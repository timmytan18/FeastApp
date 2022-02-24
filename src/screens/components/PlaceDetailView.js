import React, {
  useState, useEffect, useRef, useContext,
} from 'react';
import {
  Text, View, StyleSheet, ImageBackground, Animated,
  TouchableOpacity, Image, Platform, Linking, useColorScheme,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import PropTypes from 'prop-types';
import link from './OpenLink';
import { getPlaceFollowingUserReviewsQuery, getPlaceAllUserReviewsQuery } from '../../api/functions/queryFunctions';
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
import Ratings from './Ratings';
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
  }).isRequired,
};

const PlaceDetailView = React.memo(({ place, navigation }) => {
  const [deliveryPressed, setDeliveryPressed] = useState(false);
  const [menuWebPressed, setMenuWebPressed] = useState(false);

  if (!place || !place.placeInfo) {
    return <View />;
  }

  const images = [place.placeInfo.imgUrl];

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

  const pages = images.map((image) => renderPage(image));

  const pagesScroll = scroll.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -1],
  });

  const delivery = place.placeInfo.orderUrls === '{}'
    ? null : JSON.parse(place.placeInfo.orderUrls);

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

  const deliveryItems = [];
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

  const menuWebItems = [];
  if (place.placeInfo.menuUrl) {
    menuWebItems.push({
      onPress: () => link('DEFAULT', place.placeInfo.menuUrl),
      icon: <View style={{ width: '10%', alignItems: 'center' }}><Menu /></View>,
      label: 'See menu',
    });
  }
  if (place.placeInfo.placeUrl) {
    menuWebItems.push({
      onPress: () => link('DEFAULT', place.placeInfo.placeUrl),
      icon: <View style={{ width: '10%', alignItems: 'center' }}><Redirect /></View>,
      label: 'Visit website',
    });
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
        place={place}
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
  const [state, dispatch] = useContext(Context);
  const { uid, picture: userPic } = state.user;
  const { latitude: userLat, longitude: userLng } = state.location;

  const { latitude: placeLat, longitude: placeLng } = place.placeInfo.coordinates;
  const { categories } = place.placeInfo;

  const distance = coordinateDistance(userLat, userLng, placeLat, placeLng);

  let priceInd = 0;
  const price = place.placeInfo.priceLvl
    ? Array.apply(0, new Array(4)).map(() => {
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
    })
    : null;

  const scheme = Platform.OS === 'ios' ? 'maps:0,0?q=' : 'geo:0,0?q=';
  const latLng = `${placeLat},${placeLng}`;
  const label = place.name;
  const mapUrl = Platform.OS === 'ios'
    ? `${scheme}${label}&ll=${latLng}`
    : `${scheme}${latLng}(${label})`;
  const isDarkMode = useColorScheme() === 'dark';

  const markers = [
    { lat: userLat, lng: userLng },
    { lat: placeLat, lng: placeLng },
  ];
  const mapRef = useRef(null);
  const fitToMarkers = () => {
    mapRef.current.fitToSuppliedMarkers(markers.map(({ lat, lng }) => `${lat}${lng}`));
  };

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
            default={place.rating ? place.rating : 0}
            count={5}
            half
            starSize={100}
            disabled
            fullStar={<StarFull size={wp(5)} style={styles.myStarStyle} />}
            halfStar={<StarHalf size={wp(5)} style={styles.myStarStyle} />}
            emptyStar={<StarEmpty size={wp(5)} style={styles.myStarStyle} color={place.rating ? '#FFC529' : colors.gray3} />}
          />
          <Text style={[
            styles.reviewText,
            {
              color: place.review_count
                ? colors.black : colors.gray,
              fontSize: place.review_count
                ? wp(3.7) : sizes.b3,
            },
          ]}
          >
            (
            {place.review_count ? place.review_count : 'No reviews'}
            )
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={styles.infoSubContainer}>
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
            {place.placeInfo.yelpAlias && (
              <TouchableOpacity
                style={[styles.actionButtonContainer, { backgroundColor: '#fadbdb' }]}
                onPress={() => link('YELP', place.placeInfo.yelpAlias)}
              >
                <Yelp />
              </TouchableOpacity>
            )}
            {!place.placeInfo.yelpAlias && (
              <View
                style={[styles.actionButtonContainer, { backgroundColor: colors.gray2 }]}
              >
                <Yelp color={colors.gray} />
              </View>
            )}
            {(place.placeInfo.placeUrl || place.placeInfo.menuUrl) && (
              <TouchableOpacity
                style={[styles.actionButtonContainer, { backgroundColor: colors.gray2 }]}
                onPress={() => setMenuWebPressed(true)}
              >
                <Redirect />
              </TouchableOpacity>
            )}
            {!(place.placeInfo.placeUrl || place.placeInfo.menuUrl) && (
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
              {delivery && <Order />}
              {!delivery && <OrderNull />}
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
        {(categories != null || place.description != null) && (
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutTitleText}>ABOUT</Text>
            <Text style={styles.aboutText}>
              {place.description ? place.description : categories.join(', ')}
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
          <Marker
            key={`${placeLat}${placeLng}`}
            identifier={`${placeLat}${placeLng}`}
            coordinate={{ latitude: placeLat, longitude: placeLng }}
          >
            <LocationMapMarker isUser={false} name={place.name} isDarkMode={isDarkMode} />
          </Marker>
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
            <Car color='#fff' size={wp(5.3)} />
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

const examplePfp = 'https://s3-media0.fl.yelpcdn.com/bphoto/WMojIYn70kkIVyXX1OEC-g/o.jpg';

Image.prefetch(examplePfp);

const NUM_REVIEWS_TO_SHOW = 5;

const Reviews = ({ navigation, placeId, myUID }) => {
  const [reviews, setReviews] = useState([]);
  const ratings = useRef([0, 0, 0, 0]);
  const nextToken = useRef(null);
  const seenReviewRatings = useRef({});

  const [leftSelected, setLeftSelected] = useState(true);

  useEffect(() => {
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
        // Calculate average ratings
        const currRatings = [0, 0, 0, 0];
        userReviews.forEach((rev) => {
          const {
            food, value, service, atmosphere,
          } = rev.rating;
          currRatings[0] += food;
          currRatings[1] += value;
          currRatings[2] += service;
          currRatings[3] += atmosphere;
        });
        if (userReviews.length > 0) {
          currRatings.forEach((rating, i) => {
            currRatings[i] = rating / userReviews.length;
          });
          ratings.current = currRatings;
        }
        nextToken.current = currNextToken;
        // Save place reviews and average ratings
        seenReviewRatings.current[placeId] = {
          tab: {
            currReviews: userReviews, currRatings, currNextToken,
          },
        };
        setReviews(userReviews);
      })();
    } else {
      // Set reviews and ratings from saved data
      const {
        currReviews, currRatings, currNextToken,
      } = seenReviewRatings.current[placeId].tab;
      ratings.current = currRatings;
      nextToken.current = currNextToken;
      setReviews(currReviews);
    }
  }, [placeId, myUID, leftSelected]);

  const navigateToAllReviews = () => {
    navigation.push('Reviews', {
      placeId,
      fetchedReviews: [...reviews],
      fetchedNextToken: nextToken.current,
      fromFollowingOnly: leftSelected,
    });
  };

  const [food, value, service, atmosphere] = ratings.current;

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
        <View style={styles.ratingsContainer}>
          <Ratings food={food} value={value} service={service} atmosphere={atmosphere} />
        </View>
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
    fontFamily: 'Medium',
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
});

PlaceDetailView.propTypes = propTypes;

export default PlaceDetailView;
