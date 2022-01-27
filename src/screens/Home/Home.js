import React, {
  useEffect, useContext, useState, useRef,
} from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import geohash from 'ngeohash';
import { getNumFollowsQuery, getFollowingPostsQuery } from '../../api/functions/queryFunctions';
import SearchButton from '../components/util/SearchButton';
import MapMarker from '../components/MapMarker';
import LocationMapMarker from '../components/util/LocationMapMarker';
import LocationArrow from '../components/util/icons/LocationArrow';
import { Context } from '../../Store';
import {
  colors, shadows, hp, wp,
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
  const [state, dispatch] = useContext(Context);
  const [region, setRegion] = useState(null);
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

  const [reviews, setReviews] = useState(null);
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
    (async () => {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      console.log('Curr location:', coords);

      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });

      // // Get geohashes from user location
      // const { dLat, dLng } = geoRange;
      // const bottomLeft = { lat: coords.latitude - dLat, lng: coords.longitude - dLng };
      // const topRight = { lat: coords.latitude + dLat, lng: coords.longitude + dLng };
      // const precision = 3; // ~3 mile grid
      // const hashes = geohash.bboxes(bottomLeft.lat, bottomLeft.lng, topRight.lat, topRight.lng, precision);
      // console.log(hashes.join(' '));

      // Get following users' reviews
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
            placeId,
            coordinates: { latitude: lat, longitude: lng },
            name,
            categories,
            placeUserInfo: { picture: userPic, uid },
          } = allPosts[i];
          // Create new place set for user if not already created
          if (!userPlaces[uid]) {
            userPlaces[uid] = new Set();
          }
          // Add place to user's place set and placeMarkers if not already added
          if (!(placeId in userPlaces[uid])) {
            userPlaces[uid].add(placeId);
            placeMarkers.push({
              name, lat, lng, userPic, category: categories ? categories[0] : null,
            });
          }
        }
      } else {
        console.log(state);
      }

      console.log('Map markers:', placeMarkers);
      setMarkers(placeMarkers);
    })();
  }, [dispatch, state.user.PK, state.user.uid, state.numFollowing]);

  if (!state.location) {
    return (null);
  }

  SplashScreen.hideAsync();

  const { latitude, longitude } = state.location;
  const initialRegion = {
    latitude,
    longitude,
    ...initialDelta,
  };
  if (!region) {
    setRegion(initialRegion);
  }

  const animateToCurrLocation = () => {
    mapRef.current.animateToRegion(initialRegion, 350);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        rotateEnabled={false}
        pitchEnabled={false}
        userInterfaceStyle="light"
        ref={mapRef}
      // provider={PROVIDER_GOOGLE}
      // customMapStyle={mapLessLandmarksStyle}
      >
        {markers.map(({
          name, lat, lng, userPic, category,
        }) => {
          if (name === 'CURRENT_USER') {
            return (
              <Marker
                key={`${lat}${lng}`}
                coordinate={{ latitude: lat, longitude: lng }}
              >
                <LocationMapMarker />
              </Marker>
            );
          }
          return (
            <Marker
              key={`${lat}${lng}`}
              coordinate={{ latitude: lat, longitude: lng }}
            >
              <MapMarker name={name} lat={lat} lng={lng} userPic={userPic} category={category} />
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
    top: hp(8),
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
    bottom: hp(5),
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
