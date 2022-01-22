import React, { useEffect, useContext, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';
import geohash from 'ngeohash';
import { getFollowingQuery, getUserReviewsQuery } from '../../api/functions/queryFunctions';
import SearchButton from '../components/util/SearchButton';
import { Context } from '../../Store';
import { colors, hp, wp } from '../../constants/theme';

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

  useEffect(() => {
    (async () => {
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      console.log(coords);

      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });

      // Get user's following users
      const followingUsers = await getFollowingQuery({ uid: state.user.uid });
      console.log(followingUsers);

      // Get geohashes from user location
      const { dLat, dLng } = geoRange;
      const bottomLeft = { lat: coords.latitude - dLat, lng: coords.longitude - dLng };
      const topRight = { lat: coords.latitude + dLat, lng: coords.longitude + dLng };
      const precision = 3; // ~3 mile grid
      const hashes = geohash.bboxes(bottomLeft.lat, bottomLeft.lng, topRight.lat, topRight.lng, precision);
      console.log(hashes.join(' '));

      // Get following users' reviews
      const followingReviews = {};
      const placeMarkers = [{ name: 'Me', lat: coords.latitude, lng: coords.longitude }];
      await Promise.all(followingUsers.map(async (user) => {
        await Promise.all(hashes.map(async (hash) => {
          const currReviews = await getUserReviewsQuery({ PK: user.PK, hash, withUserInfo: true });
          for (let i = 0; i < currReviews.length; i += 1) {
            currReviews[i].coordinates = geohash.decode(currReviews[i].geo);
            const {
              placeId,
              coordinates: { latitude: lat, longitude: lng },
              name,
              placeUserInfo: { picture: userPic },
            } = currReviews[i];
            if (placeId in followingReviews) {
              followingReviews[placeId].push(currReviews[i]);
            } else {
              followingReviews[placeId] = [currReviews[i]];
              placeMarkers.push({
                name, lat, lng, userPic,
              });
            }
          }
        }));
      }));
      setReviews(followingReviews);
      console.log(followingReviews);
      setMarkers(placeMarkers);
    })();
  }, [dispatch, state.user.uid]);

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

  const onRegionChange = (newRegion) => {
    console.log(newRegion);
    setRegion(newRegion);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={region}
        // onRegionChangeComplete={onRegionChange}
        rotateEnabled={false}
      >
        {markers.map((marker) => (
          <MapView.Marker
            key={`${marker.lat}${marker.lng}`}
            coordinate={{ latitude: marker.lat, longitude: marker.lng }}
            title={marker.name}
            image={{ uri: marker.userPic }}
          />
        ))}
      </MapView>
      <View style={styles.searchBtnContainer}>
        <SearchButton
          color={colors.black}
          size={wp(5.7)}
          style={{ flex: 1 }}
          pressed={() => navigation.navigate('SearchUsers')}
        />
      </View>
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
    width: wp(12),
    height: wp(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(6),
    backgroundColor: 'white',
  },
});

export default Home;
