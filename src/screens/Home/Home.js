import React, {
  useEffect, useContext, useState, useRef, useCallback,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Image,
} from 'react-native';
import { Storage } from 'aws-amplify';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import geohash from 'ngeohash';
import {
  getFollowingPostsQuery,
  batchGetUserPostsQuery,
  batchGetPlaceDetailsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import getBestGeoPrecision from '../../api/functions/GetBestGeoPrecision';
import SearchButton from '../components/util/SearchButton';
import MapMarker from '../components/MapMarker';
import LocationMapMarker from '../components/util/LocationMapMarker';
import LocationArrow from '../components/util/icons/LocationArrow';
import { getLocalData, storeLocalData, localDataKeys } from '../../api/functions/LocalStorage';
import { DEFAULT_COORDINATES } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, shadows, wp,
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
  // console.log('HEIGHT: ', hp(100));
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

  const seenStories = useRef(new Set());

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const seen = await getLocalData(localDataKeys.SEEN_STORIES);
        if (seen) {
          seenStories.current = new Set(Object.keys(seen));
        } else {
          await storeLocalData(localDataKeys.SEEN_STORIES, {});
        }
      })();
    }, []),
  );

  const [markers, setMarkers] = useState([]);
  const mapRef = useRef(null);
  const isFitToMarkers = useRef(false);

  const placePosts = useRef({}); // obj of placeId: [posts]
  const placeIdGeo = useRef({}); // obj of placeId: geo

  // Keep track of places that have been grouped together, ordered
  const storiesGroups = useRef({}); // obj of placeId: [placeId]

  // Show / hide markers when region changed based on zoom level & geohash
  const onRegionChanged = async ({ markersCopy, firstLoad }) => {
    const {
      southWest: { longitude: startX, latitude: startY },
      northEast: { longitude: endX, latitude: endY },
    } = await mapRef.current.getMapBoundaries();
    const area = (endX - startX) * (endY - startY);

    const bestPrecision = getBestGeoPrecision({ area });

    const geobox = new Set(geohash.bboxes(startY, startX, endY, endX, bestPrecision));
    const geoBoxTaken = {};

    let didAlterMarkers = false;
    Object.keys(markersCopy).forEach((placeKey) => {
      const isNew = !seenStories.current.has(markersCopy[placeKey].SK);
      markersCopy[placeKey].isNew = isNew;
      markersCopy[placeKey].onlyHasOld = true;
      const hash = placeKey.slice(0, bestPrecision);

      if (geobox.has(hash)) { // if marker is in view
        if (hash in geoBoxTaken) { // if marker's grid already has marker
          if (markersCopy[placeKey].visible) { // if marker is visible, set invisible
            didAlterMarkers = true;
            markersCopy[placeKey].visible = false;
          }
          markersCopy[geoBoxTaken[hash]].numOtherMarkers += 1;
          // if story is new, set marker its in to be new
          if (isNew) {
            markersCopy[geoBoxTaken[hash]].isNew = true;
            markersCopy[geoBoxTaken[hash]].onlyHasOld = false;
          }
          storiesGroups.current[geoBoxTaken[hash]].push(placeKey);
        } else { // if marker in grid with no other markers
          if (!markersCopy[placeKey].visible) { // if marker not already visible, set visible
            markersCopy[placeKey].visible = true;
            didAlterMarkers = true;
          }
          markersCopy[placeKey].numOtherMarkers = 0;
          geoBoxTaken[hash] = placeKey;
          storiesGroups.current[placeKey] = [placeKey];
        }
      }
    });
    if (didAlterMarkers || firstLoad) {
      setMarkers(markersCopy);
    }
  };

  useEffect(() => {
    (async () => {
      let coords;
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        alert('Permission to access location was denied. Please enable location services.');
        coords = DEFAULT_COORDINATES;
      } else {
        try {
          ({ coords } = await Location.getLastKnownPositionAsync({}));
        } catch {
          ({ coords } = await Location.getCurrentPositionAsync({}));
        }
      }

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
      const placeMarkers = {}; // place marker for user location

      // Fetch all posts for map feed from following users
      const { promise, getValue, errorMsg } = getFollowingPostsQuery({ PK: state.user.PK });
      const allPosts = await fulfillPromise(promise, getValue, errorMsg);
      for (let i = 0; i < allPosts.length; i += 1) {
        allPosts[i].coordinates = geohash.decode(allPosts[i].geo); // Get lat/lng from geohash
        // Desconstruct attributes needed from post
        const {
          PK, SK,
          placeId,
          geo,
          coordinates: { latitude: lat, longitude: lng },
          name,
          categories,
          placeUserInfo: { picture: userPic, uid, name: userName },
        } = allPosts[i];

        if (!(placeId in placeIdGeo.current)) {
          placeIdGeo.current[placeId] = geo;
        }

        // Create new posts array for place if not already created
        // If created, add post to posts array
        if (!placePostsUpdated[placeId]) {
          placePostsUpdated[placeId] = [{ PK, SK }];
        } else {
          placePostsUpdated[placeId].push({ PK, SK });
        }

        // Create new place set for user if not already created
        if (!userPlaces[uid]) {
          userPlaces[uid] = new Set();
        }
        // Add place to user's place set and placeMarkers if not already added
        if (!(userPlaces[uid].has(placeId))) {
          userPlaces[uid].add(placeId);
        }
        if (!(placeId in placeMarkers)) {
          placeMarkers[placeId] = {
            SK,
            name,
            placeId,
            lat,
            lng,
            uid,
            userName,
            userPic,
            category: categories ? categories[0] : null,
            visible: true,
            numOtherMarkers: 0,
          };
        }
      }
      placePosts.current = placePostsUpdated;
      await onRegionChanged({ markersCopy: placeMarkers, firstLoad: true });
    })();
  }, [state.user.PK, state.user.uid, state.reloadMapTrigger]);

  const stories = useRef([]);
  const placeDetails = useRef({}); // obj of placeId: { details }
  const [loadingStories, setLoadingStories] = useState('none');

  const fetchPostDetails = async ({ placeId }) => {
    setLoadingStories(placeId);

    const placeDetailsBatch = [];

    // Create batch for all stories in group
    const storiesBatch = [];
    storiesGroups.current[placeId].forEach((placeKey) => {
      storiesBatch.push(...placePosts.current[placeKey]);
      // Add place for fetch place details if not already fetched
      if (!(placeKey in placeDetails.current)) {
        placeDetailsBatch.push({
          PK: `PLACE#${placeKey}`,
          SK: `#INFO#${placeIdGeo.current[placeKey]}`,
        });
      }
    });

    // Batch fetch stories for group
    const { promise, getValue, errorMsg } = batchGetUserPostsQuery(
      { batch: storiesBatch },
    );
    const currPlacePosts = await fulfillPromise(promise, getValue, errorMsg);
    if (currPlacePosts && currPlacePosts.length) {
      // Batch fetch place details for current places
      if (placeDetailsBatch.length) {
        const {
          promise: placeBatchPromise,
          getValue: getPlaceBatchValue,
          errorMsg: placeBatchErrorMsg,
        } = await batchGetPlaceDetailsQuery({
          batch: placeDetailsBatch,
        });
        const places = await fulfillPromise(
          placeBatchPromise,
          getPlaceBatchValue,
          placeBatchErrorMsg,
        );
        places.forEach((place) => {
          if (place) placeDetails.current[place.placeId] = place;
        });
      }
      // Fetch pictures for each post
      stories.current = currPlacePosts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      const firstImg = await Storage.get(
        stories.current[0].picture,
        { identityId: stories.current[0].placeUserInfo.identityId },
      );
      try { await Image.prefetch(firstImg); } catch (e) { console.warn(e); }
      setLoadingStories('none');
      navigation.push('StoryModalModal', {
        screen: 'StoryModal',
        params: {
          stories: stories.current,
          places: placeDetails.current,
          deviceHeight: state.deviceHeight,
          firstImg,
        },
      });
    } else {
      setLoadingStories('none');
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
    isFitToMarkers.current = false;
  };
  const fitToMarkers = () => {
    if (markers) {
      mapRef.current.fitToSuppliedMarkers(Object.keys(markers).map((placeKey) => placeKey));
      isFitToMarkers.current = true;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        rotateEnabled={false}
        pitchEnabled={false}
        userInterfaceStyle="light"
        ref={mapRef}
        onRegionChangeComplete={() => onRegionChanged({ markersCopy: { ...markers } })}
      // provider={PROVIDER_GOOGLE}
      // customMapStyle={mapLessLandmarksStyle}
      >
        {Object.entries(markers).map(([placeKey, {
          name, placeId, lat, lng, uid, userName, userPic,
          category, visible, numOtherMarkers, isNew, onlyHasOld,
        }]) => (
          <Marker
            key={placeKey}
            identifier={placeKey}
            coordinate={{ latitude: lat, longitude: lng }}
            onPress={() => fetchPostDetails({ placeId })}
          >
            <MapMarker
              name={name}
              placeId={placeId}
              uid={uid}
              lat={lat}
              lng={lng}
              userPic={userPic}
              category={category}
              loadingStories={loadingStories}
              visible={visible}
              numOtherMarkers={numOtherMarkers}
              isNew={isNew}
              onlyHasOld={onlyHasOld}
            />
          </Marker>
        ))}
        <Marker
          key={`${latitude}${longitude}`}
          coordinate={{ latitude, longitude }}
          zIndex={1}
        >
          <LocationMapMarker />
        </Marker>
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
        onPress={() => (isFitToMarkers.current
          ? animateToCurrLocation()
          : fitToMarkers())}
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
    backgroundColor: '#fff',
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
    backgroundColor: colors.lightBlue,
  },
});

export default Home;
