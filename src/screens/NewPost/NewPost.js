import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList, Image, Keyboard,
} from 'react-native';
import * as Location from 'expo-location';
// import { BallIndicator } from 'react-native-indicators';
import { LinearGradient } from 'expo-linear-gradient';
import coordinateDistance from '../../api/functions/CoordinateDistance';
import filterFSItems from '../../api/functions/FilterFSItems';
import config from '../../config';
import { Context } from '../../Store';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import SearchBox from '../components/SearchBox';
import NextArrow from '../components/util/icons/NextArrow';
import MapMarker from '../components/util/icons/MapMarker';
import Car from '../components/util/icons/Car';
import { RATING_CATEGORIES } from '../../constants/constants';
import {
  colors, gradients, shadows, sizes, wp,
} from '../../constants/theme';

const FS_API_KEY = config.FOURSQUARE_API_KEY;
const FS_GET_OPTIONS = {
  method: 'GET',
  headers: {
    Accept: 'application/json',
    Authorization: FS_API_KEY,
  },
};
const FS_CATEGORY_ID = '13000';
const FS_ITEM_LIMIT = 50;
const FS_SEARCH_RADIUS = 10000; // 50000 meter ~= 30 mile radius
// const FS_SEARCH_RADIUS = 50000; // 50000 meter ~= 30 mile radius
const FS_DEFAULT_CATEGORY_ICON = {
  prefix: 'https://ss3.4sqi.net/img/categories_v2/food/default_',
  suffix: '.png',
};

const NewPost = ({ navigation }) => {
  const [state, dispatch] = useContext(Context);
  const latitude = useRef(state.location.latitude);
  const longitude = useRef(state.location.longitude);

  const [loading, setLoading] = useState(true);
  const [placeList, setPlaceList] = useState([]);
  const nearbyPlaces = useRef([]);
  const [selected, setSelected] = useState(null);
  const selectedData = useRef(null);
  const isSearch = useRef(false);
  // const [smallLoading, setSmallLoading] = useState(false);

  // Set up navigation and header options
  useEffect(() => {
    // Navigate to next screen
    function businessChosen() {
      if (selectedData.current) {
        navigation.navigate('PostDetails', {
          business: selectedData.current,
          // currLat: latitude.current,
          // currLng: longitude.current
        });
      }
    }

    // Delete and reset current stored review and ratings
    function clearReview() {
      dispatch({
        type: 'SET_REVIEW_RATINGS',
        payload: { review: null, ratings: { ...RATING_CATEGORIES } },
      });
    }

    const headerLeft = () => (
      <TouchableOpacity
        style={styles.cancelButtonContainer}
        onPress={() => {
          clearReview();
          navigation.goBack();
        }}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    );

    const headerRight = () => (
      <TouchableOpacity
        disabled={!selected}
        onPress={() => businessChosen()}
        style={[styles.nextButtonContainer, { opacity: selected ? 1 : 0.5 }]}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <NextArrow />
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerLeft,
      headerRight,
    });
  }, [dispatch, navigation, selected]);

  // Filter POIs by category and remove duplicates
  async function filterSetResults(results) {
    const items = await filterFSItems({ results });
    console.log('Filtered items', items);
    setLoading(false);
    setPlaceList(items || []);
    return items || [];

    // setLoading(false);
    // setPlaceList(results || []);
    // return results || [];
  }

  // Set up location and loading nearby POIs
  useEffect(() => {
    // Get current user location
    async function updateCurrentLocation() {
      const { coords } = await Location.getCurrentPositionAsync({});
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
      latitude.current = coords.latitude;
      longitude.current = coords.longitude;
      // latitude.current = '33.96389';
      // longitude.current = '-84.13485';
      // latitude.current = '33.80';
      // longitude.current = '-84.36';
    }

    // Fetch nearby POIs from Foursquare
    (async function getNearby() {
      try {
        await updateCurrentLocation();
      } catch (err) {
        console.log('Error updating current location', err);
      }

      const lat = latitude.current;
      const lng = longitude.current;
      const url = `https://api.foursquare.com/v3/places/nearby?ll=${lat},${lng}&limit=${FS_ITEM_LIMIT}&categories=${FS_CATEGORY_ID}`;
      try {
        const res = await fetch(url, FS_GET_OPTIONS);
        const data = await res.json();
        console.log('Returned FS data', data);
        nearbyPlaces.current = await filterSetResults(data.results);
      } catch (err) {
        console.log('Error fetching and filtering nearby FS POIs', err);
      }

      isSearch.current = false;
    }());
  }, [dispatch, navigation]);

  // Search for nearby POIs using query string
  const searchPlace = async (queryInput) => {
    const query = queryInput ? queryInput.replace(/\s+/g, '%20') : '';
    setLoading(true);
    setSelected(null);
    if (query === '') {
      isSearch.current = false;
      setPlaceList(nearbyPlaces.current);
      setLoading(false);
    } else {
      const lat = latitude.current;
      const lng = longitude.current;

      const url = `https://api.foursquare.com/v3/places/search?ll=${lat},${lng}&query=${query}&categories=${FS_CATEGORY_ID}&radius=${FS_SEARCH_RADIUS}&limit=${FS_ITEM_LIMIT}`;
      try {
        const res = await fetch(url, FS_GET_OPTIONS);
        const data = await res.json();
        console.log('Returned FS data', data);
        isSearch.current = true;
        filterSetResults(data.results);
      } catch (err) {
        console.log('Error fetching and filtering searched FS POIs', err);
      }
    }
  };

  const renderItem = ({ item }) => {
    // Calcuate distance between item coordinates and user location
    const { latitude: lat, longitude: lng } = item.geocodes && item.geocodes.main
      ? item.geocodes.main : { latitude: latitude.current, longitude: longitude.current };
    const distance = coordinateDistance(latitude.current, longitude.current, lat, lng);
    // Get city and address
    const city = item.location && item.location.locality ? item.location.locality : '';
    const address = item.location && item.location.address ? item.location.address : '';
    let loc = city;
    if (address) {
      loc = `${address}, ${city}`;
    }

    const { prefix, suffix } = item.categories.length
      ? item.categories[0].icon : FS_DEFAULT_CATEGORY_ICON;
    // const { prefix, suffix } = item.categories.length
    //   ? item.categories[item.categories.length - 1].icon : FS_DEFAULT_CATEGORY_ICON;

    if (item.fsq_id === selected) {
      return (
        <TouchableOpacity
          style={styles.itemContainer}
          activeOpacity={0.95}
          onPress={() => {
            setSelected(null);
            selectedData.current = null;
          }}
        >
          <LinearGradient
            style={[styles.itemContainer, shadows.lighter]}
            colors={gradients.orange.colors}
            start={gradients.orange.start}
            end={gradients.orange.end}
          >
            <View style={styles.iconContainer}>
              <Image
                source={{ uri: prefix.concat('44', suffix) }}
                resizeMode="contain"
                style={{ flex: 1, tintColor: 'white' }}
              />
            </View>
            <View style={styles.infoContainer}>
              <Text style={[styles.nameText, { color: 'white' }]}>{item.name}</Text>
              <Text
                style={[styles.locationText, { color: 'white' }]}
                numberOfLines={item.name.length > 20 ? 1 : 2}
                ellipsizeMode="tail"
              >
                {loc}
              </Text>
            </View>
            <View style={styles.distanceContainer}>
              <Car size={wp(4.5)} color="white" />
              <Text style={[styles.distanceText, { color: 'white' }]}>
                {distance}
                {' '}
                mi
              </Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={styles.itemContainer}
        activeOpacity={0.8}
        onPress={() => {
          setSelected(item.fsq_id);
          selectedData.current = item;
        }}
      >
        <View style={styles.iconContainer}>
          <Image
            source={{ uri: prefix.concat('44', suffix) }}
            resizeMode="contain"
            style={{ flex: 1, tintColor: colors.black }}
          />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text
            style={styles.locationText}
            numberOfLines={item.name.length > 20 ? 1 : 2}
            ellipsizeMode="tail"
          >
            {loc}
          </Text>
        </View>
        <View style={styles.distanceContainer}>
          <Car size={wp(4.5)} />
          <Text style={styles.distanceText}>
            {distance}
            {' '}
            mi
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <View style={styles.container}>
        <View style={styles.searchBoxContainer}>
          <SearchBox
            completeSearch={searchPlace}
            placeholder="Search for a restaurant/business"
            autofocus={false}
          />
        </View>
        <View style={styles.topContainer}>
          <View style={styles.locationTitleContainer}>
            <View style={styles.mapMarkerContainer}>
              <MapMarker color={colors.primary} />
            </View>
            <Text style={styles.locationTitleText}>Food nearby</Text>
          </View>
          {placeList.length > 0
            && (
              <Text style={styles.loadingText}>
                {loading ? 'Retrieving nearby restaurants...' : 'Select a restaurant'}
              </Text>
            )}
        </View>
        <View style={[styles.optionsContainer, { flexDirection: loading ? 'row' : 'column' }]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.32)']}
            style={styles.fade}
          />
          {/* {loading
            && (
              <BallIndicator
                style={{ alignSelf: 'flex-start', marginTop: wp(8) }}
                color={colors.tertiary}
              />
            )} */}
          {!loading && placeList.length > 0
            && (
              <FlatList
                style={styles.listContainer}
                contentContainerStyle={{ paddingBottom: wp(18) }}
                data={placeList}
                extraData={placeList}
                renderItem={renderItem}
                keyExtractor={(item) => item.fsq_id}
                showsVerticalScrollIndicator={false}
                onScrollBeginDrag={Keyboard.dismiss}
              // ListFooterComponent={smallLoading && (
              //   <View style={styles.smallLoader}>
              //     <BallIndicator color={colors.tertiary} size={20} />
              //   </View>
              // )}
              />
            )}
          {!loading && placeList.length === 0
            && (
              <View style={styles.noResultsContainer}>
                <Text style={styles.noResultsText}>
                  Sorry, we couldn't find the restaurant you're looking for.
                </Text>
                <Text style={styles.noResultsText}>
                  Try searching for the exact restaurant name!
                </Text>
              </View>
            )}
        </View>
      </View>
    </DismissKeyboardView>
  );
};

const styles = StyleSheet.create({
  cancelButtonContainer: {
    flex: 1,
    paddingLeft: sizes.margin,
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: 'Book',
    fontSize: sizes.h4,
    color: colors.black,
  },
  nextButtonContainer: {
    flex: 1,
    paddingRight: sizes.margin,
    alignItems: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    color: colors.accent,
    paddingRight: wp(1),
    letterSpacing: 0.4,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  searchBoxContainer: {
    flex: 0.06,
    width: '100%',
    paddingHorizontal: wp(3),
    paddingVertical: wp(5),
  },
  topContainer: {
    flex: 0.11,
    width: '100%',
    paddingHorizontal: wp(4),
  },
  locationTitleContainer: {
    flexDirection: 'row',
  },
  locationTitleText: {
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    color: colors.primary,
  },
  mapMarkerContainer: {
    justifyContent: 'center',
    paddingRight: wp(1.5),
    paddingBottom: wp(0.5),
  },
  loadingText: {
    fontFamily: 'Book',
    fontSize: sizes.h4,
    color: colors.black,
    paddingLeft: wp(1),
  },
  optionsContainer: {
    flex: 0.83,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  itemContainer: {
    flex: 1,
    backgroundColor: colors.gray4,
    height: wp(19),
    borderRadius: wp(3),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: wp(1),
  },
  fade: {
    flex: 1,
    width: '100%',
    height: wp(20),
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  listContainer: {
    flex: 1,
    width: wp(92),
  },
  iconContainer: {
    flex: 0.2,
    height: wp(6.5),
  },
  infoContainer: {
    flex: 0.6,
    paddingTop: wp(1),
  },
  nameText: {
    fontFamily: 'Semi',
    fontSize: sizes.h4,
    lineHeight: sizes.h4 * 1.2,
    color: colors.black,
  },
  locationText: {
    fontFamily: 'Book',
    letterSpacing: 0.25,
    fontSize: sizes.b4,
    color: colors.black,
    lineHeight: sizes.b4 * 1.2,
    paddingTop: wp(0.8),
  },
  distanceContainer: {
    flex: 0.2,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: wp(1.3),
  },
  distanceText: {
    fontFamily: 'Medium',
    fontSize: sizes.b4,
    color: colors.black,
    paddingTop: wp(0.5),
  },
  smallLoader: {
    height: wp(15),
    alignItems: 'center',
  },
  noResultsContainer: {
    alignItems: 'center',
    width: '75%',
  },
  noResultsText: {
    fontFamily: 'Medium',
    fontSize: sizes.h3,
    color: colors.tertiary,
    textAlign: 'center',
    paddingBottom: wp(5),
  },
});

export default NewPost;
