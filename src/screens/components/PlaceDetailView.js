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
import { getUserProfileQuery, getIsFollowingQuery } from '../../api/functions/queryFunctions';
import coordinateDistance from '../../api/functions/CoordinateDistance';
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
    <View style={{ backgroundColor: 'white', flex: 1 }}>
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
  // console.log(place, delivery)

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
      <View style={{ height: wp(5), width: wp(100), backgroundColor: 'white' }} />
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
              style={[styles.orderButtonContainer]}
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
      <View style={styles.bottomContainer}>
        <View style={styles.userReviewsContainer}>
          <Text style={[
            styles.reviewTitleText,
            {
              fontSize: sizes.h3, marginBottom: wp(4), textAlign: 'center', paddingRight: wp(2),
            },
          ]}
          >
            Feast User Reviews
          </Text>
          <View style={styles.ratingsContainer}>
            <Ratings food={4.5} value={4.5} service={3.5} atmosphere={3} />
          </View>
          <Reviews navigation={navigation} placeId={place.placeId} myUID={uid} />
        </View>
      </View>
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
            <Car color="white" size={wp(5.3)} />
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

const Reviews = ({ navigation, placeId, myUID }) => {
  const fetchCurrentUser = async ({ uid }) => {
    try {
      const currentUser = await getUserProfileQuery({ uid });

      // Check if I am following the current user
      if (currentUser.uid !== myUID) {
        currentUser.following = await getIsFollowingQuery({ currentUID: uid, myUID });
        console.log('isFollowing:', currentUser.following);
      }

      navigation.push('Profile', { user: currentUser });
    } catch (err) {
      console.warn('Error fetching current user: ', err);
    }
  };

  return (
    <View style={styles.userReviewsContainer}>
      <View style={styles.userReviewContainer}>
        <TouchableOpacity style={styles.userPictureContainer} activeOpacity={0.7} onPress={() => fetchCurrentUser({ uid: 'c8d97d30-5d3f-44d6-84fc-1cd4d3a14e7a' })}>
          <Image style={styles.userPicture} source={{ uri: examplePfp }} />
        </TouchableOpacity>
        <View style={styles.userNameReviewContainer}>
          <Text style={styles.reviewTitleText}>Tim Tan</Text>
          <Text style={styles.userReviewText}>Wow, this restaurant is amazing. Wow, this restaurant is amazing.  </Text>
        </View>
      </View>
      <View style={styles.userReviewContainer}>
        <TouchableOpacity style={styles.userPictureContainer}>
          <Image style={styles.userPicture} source={{ uri: examplePfp }} />
        </TouchableOpacity>
        <View style={styles.userNameReviewContainer}>
          <Text style={styles.reviewTitleText}>Swole Biafore</Text>
          <Text style={styles.userReviewText}>Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. </Text>
        </View>
      </View>
      <View style={styles.userReviewContainer}>
        <TouchableOpacity style={styles.userPictureContainer}>
          <Image style={styles.userPicture} source={{ uri: examplePfp }} />
        </TouchableOpacity>
        <View style={styles.userNameReviewContainer}>
          <Text style={styles.reviewTitleText}>Clammy Handy</Text>
          <Text style={styles.userReviewText}>Wow, this restaurant is amazing. </Text>
        </View>
      </View>
      <View style={styles.userReviewContainer}>
        <TouchableOpacity style={styles.userPictureContainer}>
          <Image style={styles.userPicture} source={{ uri: examplePfp }} />
        </TouchableOpacity>
        <View style={styles.userNameReviewContainer}>
          <Text style={styles.reviewTitleText}>Trevor Popeman</Text>
          <Text style={styles.userReviewText}>Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
    transform: [{ rotate: '-90deg' }],
    ...shadows.base,
  },
  rootInfoContainer: {
    width: '100%',
    flexDirection: 'column',
    paddingTop: wp(100),
    paddingBottom: wp(6),
    backgroundColor: 'white',
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
    backgroundColor: 'white',
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
    borderRadius: wp(14) / 2,
    marginLeft: wp(5),
  },
  orderButtonContainer: {
    alignItems: 'center',
    marginLeft: wp(4),
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
    paddingHorizontal: wp(4),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  ratingsContainer: {
    width: '99%',
    marginBottom: wp(5),
    alignSelf: 'center',
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
    marginTop: wp(1),
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
  },
  mapContainer: {
    width: '95%',
    aspectRatio: 1,
    marginTop: wp(6),
    marginBottom: wp(32),
    alignSelf: 'center',
    borderRadius: wp(2),
    marginHorizontal: wp(4),
  },
  map: {
    flex: 1,
    borderRadius: wp(2),
  },
  openMapContainer: {
    position: 'absolute',
    top: wp(20.5),
    left: wp(4),
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
    top: wp(4),
    left: wp(4),
    width: wp(12.5),
    height: wp(12.5),
    borderRadius: wp(6.25),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(174, 191, 229, 0.9)',
  },
});

PlaceDetailView.propTypes = propTypes;

export default PlaceDetailView;
