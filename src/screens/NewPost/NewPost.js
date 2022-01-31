import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList, Keyboard,
} from 'react-native';
import * as Location from 'expo-location';
import * as WebBrowser from 'expo-web-browser';
import { BallIndicator } from 'react-native-indicators';
import { LinearGradient } from 'expo-linear-gradient';
import MapModal from '../components/MapModal';
import coordinateDistance from '../../api/functions/CoordinateDistance';
import filterFSItems from '../../api/functions/FilterFSItems';
import config from '../../config';
import { Context } from '../../Store';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import SearchBox from '../components/SearchBox';
import NextArrow from '../components/util/icons/NextArrow';
import Redirect from '../components/util/icons/Redirect';
import MapMarker from '../components/util/icons/MapMarker';
import { RATING_CATEGORIES } from '../../constants/constants';
import {
  colors, gradients, shadows, sizes, wp, hp,
} from '../../constants/theme';

// Tests
import scrapeTest from './ScrapeTest';

const BING_KEY = config.BING_API_KEY;
const BING_CAT_TYPE = 'EatDrink';
const BING_NEARBY_RADIUS = '1000'; // 1 km radius
const BING_SEARCH_RADIUS = '5000'; // 5 km radius (max); is more when no results within 5 km

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

  const [showMap, setShowMap] = useState(false);
  const showMapPlace = useRef({ name: null, latitude: null, longitude: null });

  // Set up navigation and header options
  useEffect(() => {
    // Navigate to next screen
    function businessChosen() {
      if (selectedData.current) {
        setShowMap(false);
        navigation.navigate('UploadImages', {
          business: selectedData.current,
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
  }, [dispatch, navigation, placeList, selected]);

  // Filter POIs by category and remove duplicates
  async function filterSetResults(results) {
    if (!results.length) {
      return [];
    }
    const items = await filterFSItems({ results });
    console.log('Filtered items', items);
    setLoading(false);
    setPlaceList(items || []);
    return items || [];
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
      // latitude.current = '33.774193'; // Paloma
      // longitude.current = '-84.405873';
      // latitude.current = '33.96389'; // Duluth
      // longitude.current = '-84.13485';
    }

    // Fetch nearby POIs from Bing
    async function getNearby() {
      try {
        await updateCurrentLocation();
      } catch (err) {
        console.log('Error updating current location', err);
      }
      const lat = latitude.current;
      const lng = longitude.current;
      const url = `https://dev.virtualearth.net/REST/v1/LocalSearch/?&type=${BING_CAT_TYPE}&userCircularMapView=${lat},${lng},${BING_NEARBY_RADIUS}&maxResults=25&key=${BING_KEY}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        const items = data.resourceSets[0].resources;
        nearbyPlaces.current = await filterSetResults(items);
      } catch (err) {
        console.log('Error fetching Bing locations', err);
      }

      isSearch.current = false;
    }

    if (!nearbyPlaces.current.length) {
      getNearby();
    }
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
      const url = `https://dev.virtualearth.net/REST/v1/LocalSearch/?query=${query}&type=${BING_CAT_TYPE}&userCircularMapView=${lat},${lng},${BING_SEARCH_RADIUS}&maxResults=25&key=${BING_KEY}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        isSearch.current = true;
        const items = data.resourceSets[0].resources;
        console.log(items);
        await filterSetResults(items);
        // Run scraper test
        // scrapeTest({ places: searchResults });
      } catch (err) {
        console.log('Error fetching and filtering searched Bing POIs', err);
      }
    }
  };

  const showMapPressed = (place) => {
    const { name: placeName, geocodePoints: [{ coordinates: [placeLat, placeLng] }] } = place;
    showMapPlace.current = { placeName, placeLat, placeLng };
    setShowMap(true);
  };

  const renderItem = ({ item }) => {
    // Calculate distance between item coordinates and user location
    // If item doesn't have coordinates, use user's location
    const [lat, lng] = item.geocodePoints
      && item.geocodePoints.length
      && item.geocodePoints[0].coordinates
      ? item.geocodePoints[0].coordinates : [latitude.current, longitude.current];
    const distance = coordinateDistance(latitude.current, longitude.current, lat, lng);
    // Get city and address
    const city = item.Address && item.Address.locality ? item.Address.locality : '';
    const address = item.Address && item.Address.addressLine ? item.Address.addressLine : '';
    let loc = city;
    if (address) {
      loc = `${address}, ${city}`;
    }

    if (item.placeId === selected) {
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
            <View style={styles.infoContainer}>
              <View style={{ flexDirection: 'row' }}>
                <Text style={[styles.nameText, { color: 'white' }]}>{item.name}</Text>
                {item.Website && (
                  <TouchableOpacity
                    onPressIn={() => WebBrowser.openBrowserAsync(item.Website)}
                  >
                    <Redirect color={colors.white} size={wp(4.2)} />
                  </TouchableOpacity>
                )}
              </View>
              <Text
                style={[styles.locationText, { color: 'white' }]}
                numberOfLines={item.name.length > 20 ? 1 : 2}
                ellipsizeMode="tail"
              >
                {loc}
              </Text>
            </View>
            <View style={styles.distanceContainer}>
              <TouchableOpacity onPress={() => showMapPressed(item)}>
                <MapMarker size={wp(5.5)} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => showMapPressed(item)}>
                <Text style={[styles.distanceText, { color: 'white' }]}>
                  {distance}
                  {' '}
                  mi
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity
        style={[styles.itemContainer, shadows.even]}
        activeOpacity={0.8}
        onPress={() => {
          setSelected(item.placeId);
          selectedData.current = item;
        }}
      >
        <View style={styles.infoContainer}>
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.nameText}>{item.name}</Text>
            {item.Website && (
              <TouchableOpacity
                onPressIn={() => WebBrowser.openBrowserAsync(item.Website)}
              >
                <Redirect color={colors.tertiary} size={wp(4.2)} />
              </TouchableOpacity>
            )}
          </View>
          <Text
            style={styles.locationText}
            numberOfLines={item.name.length > 20 ? 1 : 2}
            ellipsizeMode="tail"
          >
            {loc}
          </Text>
        </View>
        <View style={styles.distanceContainer}>
          <TouchableOpacity onPress={() => showMapPressed(item)}>
            <MapMarker size={wp(5.5)} color={colors.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => showMapPressed(item)}>
            <Text style={styles.distanceText}>
              {distance}
              {' '}
              mi
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <View style={styles.container}>
        {showMap && (
          <MapModal
            visible={showMap}
            setVisible={setShowMap}
            userLat={latitude.current}
            userLng={longitude.current}
            userPic={state.user.picture}
            place={showMapPlace.current}
          />
        )}
        <View style={styles.topTextContainer}>
          <Text style={styles.topText}>
            Where did you Feast?
          </Text>
        </View>
        <View style={styles.searchBoxContainer}>
          <SearchBox
            completeSearch={searchPlace}
            placeholder="Search for a business"
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
                {loading ? 'Retrieving nearby businesses...' : 'Select a business'}
              </Text>
            )}
        </View>
        <View style={[styles.optionsContainer, { flexDirection: loading ? 'row' : 'column' }]}>
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.32)']}
            style={styles.fade}
          />
          {loading
            && (
              <BallIndicator
                style={{ alignSelf: 'flex-start', marginTop: wp(8) }}
                color={colors.tertiary}
              />
            )}
          {!loading && placeList.length > 0
            && (
              <FlatList
                style={styles.listContainer}
                contentContainerStyle={{ paddingBottom: wp(18) }}
                data={placeList}
                extraData={placeList}
                renderItem={renderItem}
                keyExtractor={(item) => item.placeId}
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
  topTextContainer: {
    alignSelf: 'flex-start',
    marginTop: hp(2.5),
    marginLeft: sizes.margin,
  },
  topText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    textAlign: 'left',
    color: colors.black,
  },
  searchBoxContainer: {
    flex: 0.06,
    width: '100%',
    paddingHorizontal: wp(3.5),
    paddingTop: wp(3),
    paddingBottom: wp(5),
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
  infoContainer: {
    flex: 0.7,
    paddingTop: wp(1),
    marginLeft: wp(7.2),
  },
  nameText: {
    fontFamily: 'Semi',
    fontSize: sizes.h4,
    lineHeight: sizes.h4 * 1.2,
    color: colors.black,
    paddingRight: wp(2.2),
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
    flex: 0.3,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: wp(1.3),
  },
  distanceText: {
    fontFamily: 'Medium',
    fontSize: sizes.caption,
    color: colors.tertiary,
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
