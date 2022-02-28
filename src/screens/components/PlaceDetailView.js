import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import {
  Text, View, StyleSheet, ImageBackground, Animated,
  TouchableOpacity, Platform, Linking, useColorScheme,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import { PacmanIndicator } from 'react-native-indicators';
import PropTypes from 'prop-types';
import link from './OpenLink';
import {
  getPlaceFollowingUserReviewsQuery, getPlaceAllUserReviewsQuery, getPlaceRatingQuery,
} from '../../api/functions/queryFunctions';
import coordinateDistance from '../../api/functions/CoordinateDistance';
import ReviewItem from './ReviewItem';
import LocationMapMarker from './util/LocationMapMarker';
import Car from './util/icons/Car';
import LocationArrow from './util/icons/LocationArrow';
import { DollarSign, DollarSignEmpty } from './util/icons/DollarSign';
import Yelp from './util/icons/Yelp';
import Redirect from './util/icons/Redirect';
import Menu from './util/icons/Menu';
import Order from './util/icons/Order';
import OrderNull from './util/icons/OrderNull';
import Ubereats from './util/icons/delivery/Ubereats';
import Trycaviar from './util/icons/delivery/Trycaviar';
import Seamless from './util/icons/delivery/Seamless';
import Postmates from './util/icons/delivery/Postmates';
import Grubhub from './util/icons/delivery/Grubhub';
import Doordash from './util/icons/delivery/Doordash';
import Chownow from './util/icons/delivery/Chownow';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import BackArrow from './util/icons/BackArrow';
import Toggle from './util/Toggle';
import Pagination from './util/Pagination';
import MoreView from './MoreView';
import { Context } from '../../Store';
import {
  colors, sizes, gradients, wp, shadows,
} from '../../constants/theme';

const propTypes = {
  place: PropTypes.shape({
    PK: PropTypes.string,
    SK: PropTypes.string,
    geo: PropTypes.string,
    name: PropTypes.string,
    placeId: PropTypes.string,
    placeInfo: PropTypes.shape({
      address: PropTypes.string,
      categories: PropTypes.arrayOf(PropTypes.string),
      coordinates: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
      }),
      imgUrl: PropTypes.string,
      menuUrl: PropTypes.string,
      orderUrls: PropTypes.string,
      phone: PropTypes.string,
      placeUrl: PropTypes.string,
      priceLvl: PropTypes.number,
      yelpAlias: PropTypes.string,
    }),
  }),
  placeName: PropTypes.string.isRequired,
  placeId: PropTypes.string.isRequired,
};

const defaultProps = {
  place: null,
};

const getDeliveryIcon = (type) => {
  if (type === 'ubereats') {
    return <Ubereats />;
  } if (type === 'trycaviar') {
    return <Trycaviar />;
  } if (type === 'seamless') {
    return <Seamless />;
  } if (type === 'postmates') {
    return <Postmates />;
  } if (type === 'grubhub') {
    return <Grubhub />;
  } if (type === 'doordash') {
    return <Doordash />;
  } if (type === 'chownow') {
    return <Chownow />;
  }
  return <Order size={wp(6.5)} />;
};

const NoImageContainer = () => (
  <LinearGradient
    colors={gradients.orange.colors}
    start={gradients.orange.start}
    end={gradients.orange.end}
    style={{ flex: 1, justifyContent: 'center' }}
  >
    <View style={styles.noImageContainer}>
      <View>
        <PacmanIndicator
          color={colors.tertiary}
          style={{ marginTop: wp(2) }}
        />
        <Text style={styles.noImageSubText}>
          Currently Feasting...
        </Text>
      </View>
      <Text style={styles.noImageText}>
        Please check back later
        {'\n'}
        for more details
      </Text>
    </View>
  </LinearGradient>
);

const PlaceDetailView = React.memo(({
  place, placeName, placeId, navigation,
}) => {
  const [deliveryPressed, setDeliveryPressed] = useState(false);
  const [menuWebPressed, setMenuWebPressed] = useState(false);

  const renderPage = (item) => (
    <View
      style={{ flex: 1 }}
      key={item}
    >
      {item && (
        <ImageBackground
          source={{ uri: item }}
          style={styles.imageContainer}
          resizeMode="cover"
        >
          <LinearGradient
            colors={['rgba(0,0,0,0.32)', 'transparent']}
            style={styles.gradient}
          />
        </ImageBackground>
      )}
    </View>
  );

  const scroll = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scroll.addListener(({ value }) => {
      scroll.current = value;
    });
    return (
      scroll.removeAllListeners()
    );
  }, [scroll]);

  const opacity = scroll.interpolate({
    inputRange: [0, wp(45), wp(100)],
    outputRange: [1, 0.7, 0],
    extrapolate: 'clamp',
  });

  const pagesScroll = scroll.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
  });

  // Necessary variables to correctly render
  let images = [];
  let pages = [<NoImageContainer />];
  let delivery = null;
  const deliveryItems = [];
  const menuWebItems = [];

  if (place && place.placeInfo) {
    const { placeInfo } = place;

    images = [placeInfo.imgUrl];
    pages = images.map((image) => renderPage(image));

    delivery = placeInfo.orderUrls === '{}'
      ? null : JSON.parse(placeInfo.orderUrls);

    if (delivery) {
      Object.entries(delivery).forEach(([_type, url]) => {
        const type = _type.replace(/\s+/g, '').toLowerCase();
        deliveryItems.push({
          onPress: () => link(type, url),
          icon: (
            <View style={{ width: '10%', alignItems: 'center' }}>
              {getDeliveryIcon(type)}
            </View>
          ),
          label: _type,
        });
      });
    }
    if (placeInfo.menuUrl) {
      menuWebItems.push({
        onPress: () => link('DEFAULT', placeInfo.menuUrl),
        icon: <View style={{ width: '10%', alignItems: 'center' }}><Menu /></View>,
        label: 'See menu',
      });
    }
    if (placeInfo.placeUrl) {
      menuWebItems.push({
        onPress: () => link('DEFAULT', placeInfo.placeUrl),
        icon: <View style={{ width: '10%', alignItems: 'center' }}><Redirect /></View>,
        label: 'Visit website',
      });
    }
  }

  return (
    <View style={{ backgroundColor: '#fff', flex: 1 }}>
      <Animated.View style={[styles.pageContainer, {
        opacity,
        transform: [{ translateY: pagesScroll }],
      }]}
      >
        {pages[0]}
        <Pagination length={images.length} index={0} />
      </Animated.View>
      <BodyContent
        place={place || { name: placeName, placeId }}
        scroll={scroll}
        delivery={delivery}
        setDeliveryPressed={setDeliveryPressed}
        setMenuWebPressed={setMenuWebPressed}
        navigation={navigation}
      />
      {deliveryItems.length !== 0
        && (
          <MoreView
            items={deliveryItems}
            morePressed={deliveryPressed}
            setMorePressed={setDeliveryPressed}
          />
        )}
      {menuWebItems.length !== 0
        && (
          <MoreView
            items={menuWebItems}
            morePressed={menuWebPressed}
            setMorePressed={setMenuWebPressed}
          />
        )}
    </View>
  );
});

const BodyContent = React.memo(({
  place, scroll, delivery, setDeliveryPressed, setMenuWebPressed, navigation,
}) => {
  const [state] = useContext(Context);
  const { uid, picture: userPic } = state.user;
  const { latitude: userLat, longitude: userLng } = state.location;

  const [rating, setRating] = useState({ sum: 0, count: 1 });

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (place && place.placeId) {
        const updatedRating = await getPlaceRatingQuery({ placeId: place.placeId });
        setRating(updatedRating);
      }
    })();
    return () => controller.abort();
  }, [place.placeId]);

  // Open map route details
  const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
  const label = place.name;

  const isDarkMode = useColorScheme() === 'dark';

  // Necessary variables to correctly render
  let placeLat = null; let placeLng = null;
  let categories = null;
  let distance = 0;
  let price;
  let latLng = `${userLat},${userLng}`;
  const markers = [
    { lat: userLat, lng: userLng },
  ];

  const PLACE_SCRAPED = place && place.placeInfo;
  if (PLACE_SCRAPED) {
    ({
      latitude: placeLat,
      longitude: placeLng,
    } = place.placeInfo.coordinates);
    categories = place.placeInfo.categories;
    distance = coordinateDistance(userLat, userLng, placeLat, placeLng);
    if (place.placeInfo.priceLvl) {
      let priceInd = 0;
      price = Array.apply(0, new Array(4)).map(() => {
        priceInd += 1;
        if (priceInd <= place.placeInfo.priceLvl) {
          return (
            <View key={priceInd} style={{ marginHorizontal: wp(0.3) }}>
              <DollarSign />
            </View>
          );
        }
        return (
          <View key={priceInd} style={{ marginHorizontal: wp(0.3) }}>
            <DollarSignEmpty />
          </View>
        );
      });
    }
    latLng = `${placeLat},${placeLng}`;
    markers.push({ lat: placeLat, lng: placeLng });
  } else {
    price = Array.apply(0, new Array(4)).map((_, i) => (
      <View key={i} style={{ marginHorizontal: wp(0.3) }}>
        <DollarSignEmpty />
      </View>
    ));
  }

  const mapUrl = Platform.OS === 'ios'
    ? `${scheme}${label}&ll=${latLng}`
    : `${scheme}${latLng}(${label})`;

  const mapRef = useRef(null);
  const fitToMarkers = () => {
    mapRef.current.fitToSuppliedMarkers(markers.map(({ lat, lng }) => `${lat}${lng}`));
  };

  const currRating = rating || { count: 1, sum: 0 };

  return (
    <View style={styles.rootInfoContainer}>
      <View style={{ height: wp(5), width: wp(100), backgroundColor: '#fff' }} />
      <View style={styles.titleTextContainer}>
        {Platform.OS === 'android' && <View style={{ height: wp(2), width: wp(100) }} />}
        <Text
          style={styles.titleText}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {place.name}
        </Text>
      </View>
      <View style={styles.topContainer}>
        <View style={styles.starsContainer}>
          <Stars
            default={currRating.sum / currRating.count}
            count={5}
            half
            starSize={100}
            spacing={wp(0.6)}
            disabled
            fullStar={<StarFull size={wp(5)} style={styles.myStarStyle} />}
            halfStar={<StarHalf size={wp(5)} style={styles.myStarStyle} />}
            emptyStar={<StarEmpty size={wp(5)} style={styles.myStarStyle} color={currRating.sum ? '#FFC529' : colors.gray3} />}
          />
          <Text style={[
            styles.reviewText,
            {
              color: currRating.count
                ? colors.black : colors.gray,
              fontSize: currRating.count
                ? wp(3.7) : sizes.b3,
            },
          ]}
          >
            (
            {currRating.sum ? currRating.count : 'No reviews'}
            )
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={[styles.infoSubContainer, !PLACE_SCRAPED && { opacity: 0.5 }]}>
            <View style={styles.distancePriceContainer}>
              <View style={styles.carContainer}><Car /></View>
              <Text style={styles.distanceText}>
                {distance}
                {' '}
                mi
              </Text>
            </View>
            <View style={styles.priceContainer}>{price}</View>
          </View>
          <View style={styles.actionsContainer}>
            {PLACE_SCRAPED && place.placeInfo.yelpAlias ? (
              <TouchableOpacity
                style={[styles.actionButtonContainer, { backgroundColor: '#fadbdb' }]}
                onPress={() => link('YELP', place.placeInfo.yelpAlias)}
              >
                <Yelp />
              </TouchableOpacity>
            ) : (
              <View
                style={[styles.actionButtonContainer, { backgroundColor: colors.gray2 }]}
              >
                <Yelp color={colors.gray} />
              </View>
            )}
            {PLACE_SCRAPED && (place.placeInfo.placeUrl || place.placeInfo.menuUrl) ? (
              <TouchableOpacity
                style={[styles.actionButtonContainer, { backgroundColor: colors.gray2 }]}
                onPress={() => setMenuWebPressed(true)}
              >
                <Redirect />
              </TouchableOpacity>
            ) : (
              <View
                style={[styles.actionButtonContainer, { backgroundColor: colors.gray2 }]}
              >
                <Redirect color={colors.gray} />
              </View>
            )}
            <TouchableOpacity
              style={[styles.orderButtonContainer, !delivery && { ...shadows.lighter }]}
              onPress={() => setDeliveryPressed(true)}
              disabled={!delivery}
            >
              {delivery ? <Order /> : <OrderNull />}
              <Text
                style={[
                  styles.orderButtonText,
                  { color: delivery ? colors.black : colors.gray },
                ]}
              >
                Order Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {(categories != null) && (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitleText}>ABOUT</Text>
            <Text style={styles.aboutText}>
              {categories.join(', ')}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.breaker} />
      <Reviews navigation={navigation} placeId={place.placeId} myUID={uid} />
      <View style={styles.breaker} />
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          rotateEnabled={false}
          pitchEnabled={false}
          initialRegion={{
            latitude: userLat,
            longitude: userLng,
            latitudeDelta: 0.0461, // ~3.5 miles in height
            longitudeDelta: 0.02105,
          }}
          ref={mapRef}
          onMapReady={fitToMarkers}
        >
          {PLACE_SCRAPED && (
            <Marker
              key={`${placeLat}${placeLng}`}
              identifier={`${placeLat}${placeLng}`}
              coordinate={{ latitude: placeLat, longitude: placeLng }}
            >
              <LocationMapMarker isUser={false} name={place.name} isDarkMode={isDarkMode} />
            </Marker>
          )}
          <Marker
            key={`${userLat}${userLng}`}
            identifier={`${userLat}${userLng}`}
            coordinate={{ latitude: userLat, longitude: userLng }}
          >
            <LocationMapMarker isUser userPic={userPic} name="Me" isDarkMode={isDarkMode} />
          </Marker>
        </MapView>
        <TouchableOpacity
          style={styles.openMapContainer}
          onPress={() => Linking.openURL(mapUrl)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.purple.colors}
            start={gradients.purple.start}
            end={gradients.purple.end}
            style={styles.openMap}
          >
            <Car color="#fff" size={wp(5.3)} />
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={fitToMarkers}
          activeOpacity={0.9}
          style={[styles.locationBackBtnContainer, shadows.base]}
        >
          <LocationArrow size={wp(5)} />
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prevProps, currProps) => false);

const NUM_REVIEWS_TO_SHOW = 5;

const Reviews = ({ navigation, placeId, myUID }) => {
  const [reviews, setReviews] = useState([]);
  const rating = useRef(0);
  const nextToken = useRef(null);
  const seenReviewRatings = useRef({});

  const [leftSelected, setLeftSelected] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const tab = leftSelected ? 'FRIENDS' : 'ALL';
    // Fetch reviews if not already fetched for current selected tab (friends or all)
    if (!(placeId in seenReviewRatings.current) || !(tab in seenReviewRatings.current[placeId])) {
      (async () => {
        const {
          userReviews,
          nextToken: currNextToken,
        } = leftSelected
            ? await getPlaceFollowingUserReviewsQuery({
              myUID, placeId, limit: NUM_REVIEWS_TO_SHOW,
            })
            : await getPlaceAllUserReviewsQuery({
              myUID, placeId, limit: NUM_REVIEWS_TO_SHOW,
            });
        // Calculate average rating
        let currRating = 0;
        userReviews.forEach((rev) => {
          currRating += rev.rating;
        });
        if (userReviews.length > 0) {
          currRating /= userReviews.length;
          rating.current = currRating;
        }
        nextToken.current = currNextToken;
        // Save place reviews and average rating
        seenReviewRatings.current[placeId] = {
          tab: {
            currReviews: userReviews, currRating, currNextToken,
          },
        };
        setReviews(userReviews);
      })();
    } else {
      // Set reviews and rating from saved data
      const {
        currReviews, currRating, currNextToken,
      } = seenReviewRatings.current[placeId].tab;
      rating.current = currRating;
      nextToken.current = currNextToken;
      setReviews(currReviews);
    }
    return () => controller.abort();
  }, [placeId, myUID, leftSelected]);

  const navigateToAllReviews = () => {
    navigation.push('Reviews', {
      placeId,
      fetchedReviews: [...reviews],
      fetchedNextToken: nextToken.current,
      fromFollowingOnly: leftSelected,
    });
  };

  return (
    <View style={styles.bottomContainer}>
      <View style={styles.userReviewsContainer}>
        <View style={styles.toggleContainer}>
          <Toggle
            selectedColor={colors.lightBlue}
            leftText="Friends"
            rightText="All"
            leftSelected={leftSelected}
            setLeftSelected={setLeftSelected}
          />
        </View>
        <Text style={[styles.reviewTitleText, { marginBottom: wp(4), marginLeft: 1 }]}>
          {leftSelected ? "Friends' Reviews" : 'All Reviews'}
        </Text>
        <View style={styles.userReviewsContainer}>
          {reviews.map((item) => (
            <ReviewItem
              item={item}
              myUID={myUID}
              navigation={navigation}
              key={item.SK}
            />
          ))}
        </View>
        {nextToken.current && (
          <TouchableOpacity
            style={styles.seeMoreContainer}
            activeOpacity={0.5}
            onPress={navigateToAllReviews}
          >
            <Text style={styles.seeMoreText}>See more reviews</Text>
            <View pointerEvents="none">
              <BackArrow
                color={colors.tertiary}
                size={wp(5)}
                style={styles.downArrow}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 1,
    height: wp(100),
    width: wp(100),
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'flex-start',
    borderBottomLeftRadius: wp(3),
    borderBottomRightRadius: wp(3),
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '25%',
    width: '100%',
  },
  downArrowContainer: {
    position: 'absolute',
    right: wp(7),
    top: wp(12),
  },
  downArrow: {
    transform: [{ rotate: '180deg' }],
    ...shadows.base,
  },
  rootInfoContainer: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: wp(100),
    paddingBottom: wp(6),
    backgroundColor: '#fff',
  },
  topContainer: {
    paddingHorizontal: wp(4),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  titleTextContainer: {
    width: '100%',
    paddingHorizontal: wp(4),
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  titleText: {
    paddingBottom: wp(1),
    flexWrap: 'wrap',
    color: colors.black,
    fontFamily: 'Semi',
    fontSize: sizes.smallTitle,
    letterSpacing: 1,
    lineHeight: 1.2 * sizes.smallTitle,
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: -wp(0.3),
  },
  myStarStyle: {
    marginHorizontal: wp(0.5),
  },
  reviewText: {
    alignSelf: 'center',
    color: colors.black,
    marginLeft: wp(2),
    fontSize: wp(3.7),
    fontFamily: 'Book',
  },
  infoContainer: {
    width: '100%',
    height: wp(28),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(0.5),
    marginBottom: wp(1),
    justifyContent: 'space-between',
  },
  infoSubContainer: {
    flex: 0.3,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: wp(5),
  },
  distancePriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: wp(2.1),
  },
  distanceText: {
    opacity: 0.9,
    color: colors.black,
    fontFamily: 'Book',
    fontSize: sizes.b2,
    textAlign: 'center',
  },
  carContainer: {
    marginRight: wp(2),
    marginBottom: wp(0.5),
  },
  priceContainer: {
    flexDirection: 'row',
    marginLeft: -wp(0.5),
  },
  actionsContainer: {
    flex: 0.7,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: wp(0.1),
  },
  actionButtonContainer: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: wp(14),
    width: wp(14),
    borderRadius: wp(4),
    marginLeft: wp(5),
    ...shadows.even,
  },
  orderButtonContainer: {
    alignItems: 'center',
    marginLeft: wp(4),
    ...shadows.darker,
  },
  orderButtonText: {
    fontSize: wp(3.3),
    fontFamily: 'Medium',
    color: colors.black,
    opacity: 0.9,
    marginBottom: -wp(1),
  },
  aboutContainer: {
    justifyContent: 'flex-start',
    paddingHorizontal: wp(0.5),
  },
  aboutTitleText: {
    fontSize: sizes.b1,
    fontFamily: 'Medium',
    color: colors.tertiary,
  },
  aboutText: {
    opacity: 0.9,
    color: colors.black,
    fontFamily: 'Book',
    fontSize: sizes.b1,
  },
  breaker: {
    width: wp(100),
    height: wp(2),
    marginVertical: wp(6),
    backgroundColor: colors.gray2,
  },
  bottomContainer: {
    paddingHorizontal: wp(4.5),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  ratingsContainer: {
    width: '99%',
    marginBottom: wp(6),
    alignSelf: 'center',
  },
  toggleContainer: {
    alignItems: 'center',
    marginTop: wp(1.5),
    marginBottom: wp(7),
  },
  userReviewsContainer: {
    marginHorizontal: wp(0.5),
    width: '100%',
  },
  userReviewContainer: {
    flexDirection: 'row',
    marginBottom: wp(3),
  },
  reviewTitleText: {
    fontSize: sizes.b1,
    fontFamily: 'Semi',
    color: colors.black,
    opacity: 0.9,
    letterSpacing: 0.2,
  },
  userPictureContainer: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(11) / 2,
    marginRight: wp(1),
    marginTop: wp(0.4),
    backgroundColor: colors.gray3,
  },
  userPicture: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(11) / 2,
  },
  userNameReviewContainer: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: wp(2),
    justifyContent: 'center',
  },
  userReviewText: {
    fontSize: sizes.b2,
    fontFamily: 'Book',
    color: colors.black,
    marginTop: wp(0.25),
  },
  seeMoreContainer: {
    marginVertical: wp(3),
    alignSelf: 'flex-end',
    flexDirection: 'row',
    marginRight: wp(2.5),
    alignItems: 'center',
  },
  seeMoreText: {
    fontSize: sizes.b2,
    fontFamily: 'Medium',
    color: colors.tertiary,
    marginRight: wp(1.5),
  },
  mapContainer: {
    width: '95%',
    aspectRatio: 1,
    marginBottom: wp(36),
    alignSelf: 'center',
    borderRadius: wp(2),
    marginHorizontal: wp(4),
  },
  map: {
    flex: 1,
    borderRadius: wp(2),
    margin: wp(4),
  },
  openMapContainer: {
    position: 'absolute',
    top: wp(24.5),
    left: wp(8),
    width: wp(14),
    height: wp(14),
    borderRadius: wp(14) / 2,
  },
  openMap: {
    width: wp(12.5),
    height: wp(12.5),
    borderRadius: wp(12.5) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationBackBtnContainer: {
    position: 'absolute',
    top: wp(8),
    left: wp(8),
    width: wp(12.5),
    height: wp(12.5),
    borderRadius: wp(6.25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.lightBlue,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: wp(18),
    marginTop: wp(5),
  },
  noImageSubText: {
    fontSize: sizes.b2,
    fontFamily: 'Book',
    color: colors.tertiary,
    textAlign: 'center',
    marginTop: wp(0.9),
  },
  noImageText: {
    fontSize: sizes.b1,
    fontFamily: 'Medium',
    color: colors.tertiary,
    textAlign: 'center',
    marginTop: wp(5),
  },
});

PlaceDetailView.propTypes = propTypes;
PlaceDetailView.defaultProps = defaultProps;

export default PlaceDetailView;
