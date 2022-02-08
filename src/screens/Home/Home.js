import React, {
  useEffect, useContext, useState, useRef,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, StatusBar,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import { Storage } from 'aws-amplify';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import geohash from 'ngeohash';
import {
  getNumFollowsQuery,
  getFollowingPostsQuery,
  batchGetUserPostsQuery,
  getPlaceDetailsQuery,
} from '../../api/functions/queryFunctions';
import StoryModal from '../components/StoryModal';
import SearchButton from '../components/util/SearchButton';
import MapMarker from '../components/MapMarker';
import LocationMapMarker from '../components/util/LocationMapMarker';
import LocationArrow from '../components/util/icons/LocationArrow';
import { Context } from '../../Store';
import {
  colors, shadows, wp, hp,
} from '../../constants/theme';

const mapLessLandmarksStyle = [
  {
    featureType: 'poi.business',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text',
    stylers: [
      {
        visibility: 'off',
      },
    ],
  },
];

const Home = ({ navigation }) => {
  console.log('HEIGHT: ', hp(100));
  const [state, dispatch] = useContext(Context);
  const initialDelta = {
    latitudeDelta: 0.0461, // ~3.5 miles in height
    longitudeDelta: 0.02105,
  };
  const geoRange = {
    dLat: 0.3688, // ~28 miles in height
    dLng: 0.1684,
  };
  // const geoRange = {
  //   dLat: 0.1844, // ~14 miles in height
  //   dLng: 0.0842,
  // };
  // const geoRange = {
  //   dLat: 0.0922, // ~7 miles in height
  //   dLng: 0.0421,
  // };
  // const geoRange = {
  //   dLat: 0.0461, // ~3.5 miles in height
  //   dLng: 0.02105,
  // };

  const [markers, setMarkers] = useState([]);

  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      // Get following users
      const num = await getNumFollowsQuery({ PK: state.user.PK, SK: state.user.SK });
      const numFollowing = num[1];
      console.log('Number of following users:', numFollowing);
      dispatch({
        type: 'SET_NUM_FOLLOWING',
        payload: { num: numFollowing },
      });
    })();
  }, [dispatch, state.user.PK, state.user.SK]);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, [state.location]);

  const placePosts = useRef({}); // obj of placeId: [posts]
  const usersNamePic = useRef({}); // obj of uid: { name, pic }

  useEffect(() => {
    (async () => {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
      }

      let coords;
      try {
        ({ coords } = await Location.getLastKnownPositionAsync({}));
      } catch {
        ({ coords } = await Location.getCurrentPositionAsync({}));
      }

      console.log('Curr location:', coords);

      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });

      // Get following users' reviews
      const placePostsUpdated = {};
      const userPlaces = {}; // obj of uid: set(placeIds)
      const placeMarkers = [{
        name: 'CURRENT_USER', lat: coords.latitude, lng: coords.longitude,
      }]; // place marker for user location

      // Fetch all posts from following users
      if (state.numFollowing) {
        console.log('FETCHING FOLLOWING POSTS...');
        const allPosts = await getFollowingPostsQuery({ PK: state.user.PK });
        console.log('All feed posts: ', allPosts);
        for (let i = 0; i < allPosts.length; i += 1) {
          allPosts[i].coordinates = geohash.decode(allPosts[i].geo); // Get lat/lng from geohash
          // Desconstruct attributes needed from post
          const {
            PK, SK,
            placeId,
            coordinates: { latitude: lat, longitude: lng },
            name,
            categories,
            placeUserInfo: { picture: userPic, uid, name: userName },
          } = allPosts[i];

          // Create new posts array for place if not already created
          // If created, add post to posts array
          if (!placePostsUpdated[placeId]) {
            placePostsUpdated[placeId] = [{ PK, SK }];
          } else {
            placePostsUpdated[placeId].push({ PK, SK });
          }

          // Add user name and pic to userPlaces obj if not already added
          if (!(uid in usersNamePic.current)) {
            usersNamePic.current[uid] = { userPic, userName };
          }

          // Create new place set for user if not already created
          if (!userPlaces[uid]) {
            userPlaces[uid] = new Set();
          }
          // Add place to user's place set and placeMarkers if not already added
          if (!(userPlaces[uid].has(placeId))) {
            userPlaces[uid].add(placeId);
            placeMarkers.push({
              name,
              placeId,
              lat,
              lng,
              userName,
              userPic,
              category: categories ? categories[0] : null,
            });
          }
        }
        placePosts.current = placePostsUpdated;
      } else {
        console.log(state);
      }

      console.log('Map markers:', placeMarkers);
      setMarkers(placeMarkers);
    })();
  }, [dispatch, state.user.PK, state.user.uid, state.numFollowing]);

  const [storiesVisible, setStoriesVisible] = useState(false);
  const stories = useRef([]);
  const place = useRef({});

  const getPostPictures = (item) => new Promise((resolve, reject) => {
    console.log(item);
    Storage.get(item.picture, { level: 'protected', identityId: item.placeUserInfo.identityId })
      .then((url) => {
        item.picture = url;
        resolve(item);
      })
      .catch((err) => {
        console.warn('Error fetching post picture from S3: ', err);
        reject();
      });
  });

  const fetchPostDetails = async ({ placeId }) => {
    // Batch fetch stories for place
    const currPlacePosts = await batchGetUserPostsQuery(
      { batch: placePosts.current[placeId] },
    );
    if (currPlacePosts && currPlacePosts.length) {
      // Fetch place details for current stories, update when new place is selected
      if (place.current.placeId !== placeId) {
        place.current = await getPlaceDetailsQuery({ placeId });
      }
      // Fetch pictures for each post
      Promise.all(currPlacePosts.map(getPostPictures)).then((posts) => {
        // stories.current = posts.concat(posts);
        stories.current = posts;
        setStoriesVisible(true);
      });
    } else {
      console.warn('Error fetching images for place: ', placeId);
    }
  };

  if (!state.location.latitude || !state.location.longitude) {
    return (null);
  }

  const { latitude, longitude } = state.location;
  const initialRegion = {
    latitude,
    longitude,
    ...initialDelta,
  };

  const animateToCurrLocation = () => {
    mapRef.current.animateToRegion(initialRegion, 350);
  };

  return (
    <View style={styles.container}>
      <StatusBar
        animated
        barStyle={storiesVisible ? 'light-content' : 'dark-content'}
      />
      <StoryModal
        stories={stories.current}
        storiesVisible={storiesVisible}
        setStoriesVisible={setStoriesVisible}
        users={usersNamePic.current}
        place={place.current}
        deviceHeight={state.deviceHeight}
      />
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        rotateEnabled={false}
        pitchEnabled={false}
        userInterfaceStyle="light"
        ref={mapRef}
      // provider={PROVIDER_GOOGLE}
      // customMapStyle={mapLessLandmarksStyle}
      >
        {markers.map(({
          name, placeId, lat, lng, userName, userPic, category,
        }) => {
          if (name === 'CURRENT_USER') {
            return (
              <Marker
                key={`${lat}${lng}`}
                coordinate={{ latitude: lat, longitude: lng }}
              >
                <LocationMapMarker isUser />
              </Marker>
            );
          }
          return (
            <Marker
              key={`${lat}${lng}${userName}`}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => fetchPostDetails({ placeId })}
              isPreselected
            >
              <MapMarker
                name={name}
                placeId={placeId}
                lat={lat}
                lng={lng}
                userPic={userPic}
                category={category}
              />
            </Marker>
          );
        })}
      </MapView>
      <View style={[styles.searchBtnContainer, shadows.base]}>
        <SearchButton
          color={colors.black}
          size={wp(5.7)}
          style={styles.searchBtn}
          pressed={() => navigation.navigate('SearchUsers')}
        />
      </View>
      <TouchableOpacity
        onPress={animateToCurrLocation}
        activeOpacity={0.9}
        style={[styles.locationBackBtnContainer, shadows.base]}
      >
        <LocationArrow size={wp(5)} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchBtnContainer: {
    position: 'absolute',
    top: wp(16),
    right: wp(9),
  },
  searchBtn: {
    width: wp(14),
    height: wp(14),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(5),
    backgroundColor: colors.white,
  },
  locationBackBtnContainer: {
    position: 'absolute',
    bottom: wp(9),
    right: wp(9.5),
    width: wp(13),
    height: wp(13),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(6.5),
    backgroundColor: 'rgba(174, 191, 229, 0.9)',
  },
});

export default Home;
