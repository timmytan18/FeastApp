import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, ImageBackground, TouchableOpacity,
  Animated, StatusBar, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { Storage } from 'aws-amplify';
import MapView, { Marker } from 'react-native-maps';
import geohash from 'ngeohash';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import Stars from 'react-native-stars';
import {
  getUserReviewsQuery, getNumFollowsQuery, getPlaceDetailsQuery,
} from '../../api/functions/queryFunctions';
import getBestGeoPrecision from '../../api/functions/GetBestGeoPrecision';
import EditProfile from './EditProfile';
import LocationMapMarker from '../components/util/LocationMapMarker';
import ProfilePic from '../components/ProfilePic';
import MoreView from '../components/MoreView';
import FollowButton from '../components/FollowButton';
import More from '../components/util/icons/More';
import ThreeDots from '../components/util/icons/ThreeDots';
import HeartEyes from '../components/util/icons/HeartEyes';
import Heart from '../components/util/icons/Heart';
import Gear from '../components/util/icons/Gear';
import Utensils from '../components/util/icons/Utensils';
import MapMarker from '../components/util/icons/MapMarker';
import RatingMapMarker from '../components/RatingMapMarker';
import { StarFull, StarHalf, StarEmpty } from '../components/util/icons/Star';
import LocationArrow from '../components/util/icons/LocationArrow';
import BackArrow from '../components/util/icons/BackArrow';
import Yum from '../components/util/icons/Yum';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import {
  colors, gradients, sizes, wp, shadows,
} from '../../constants/theme';

const propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      user: PropTypes.shape({
        PK: PropTypes.string,
        SK: PropTypes.string,
        identityId: PropTypes.string,
        name: PropTypes.string,
        uid: PropTypes.string,
        picture: PropTypes.string,
      }),
    }),
  }).isRequired,
};

// Memoize row rendering, only rerender when row content changes
const RowItem = React.memo(({
  row,
  translateContent,
  translateListContentOpacity,
  openPlacePosts,
  leftTabPressed,
  rightTabPressed,
  translateTabBar,
}) => {
  if (row !== 'LOADING' && row.length) {
    return (
      <Animated.View
        style={[
          styles.postsRowContainer,
          { transform: [{ translateX: translateContent }], opacity: translateListContentOpacity },
        ]}
      >
        {row.map((placePosts) => {
          const item = placePosts[0];
          return (
            <TouchableOpacity
              key={item.timestamp}
              style={styles.postItem}
              activeOpacity={0.9}
              onPress={() => openPlacePosts({ stories: placePosts })}
            >
              <ImageBackground
                resizeMode="cover"
                style={styles.postImage}
                source={{ uri: item.s3Photo }}
              >
                <View style={styles.gradientContainer}>
                  <LinearGradient
                    colors={['rgba(0,0,0,0.32)', 'transparent']}
                    style={styles.gradient}
                  />
                </View>
                <View style={styles.yumContainer}>
                  <Yum size={wp(4.8)} />
                  <Text style={styles.yumTextContainer}>21 Yums</Text>
                </View>
              </ImageBackground>
              <View style={styles.postBottomContainer}>
                <Text style={styles.postNameText} numberOfLines={1}>
                  {item.name}
                </Text>
                {item.categories && item.categories[0]
                  && (
                    <Text style={styles.postCategoryText}>
                      {item.categories[0]}
                    </Text>
                  )}
                <View style={styles.starsContainer}>
                  <Stars
                    default={Math.round(item.avgOverallRating * 2) / 2}
                    count={5}
                    half
                    disabled
                    spacing={wp(0.6)}
                    fullStar={<StarFull size={wp(3.8)} />}
                    halfStar={<StarHalf size={wp(3.8)} />}
                    emptyStar={<StarEmpty size={wp(3.8)} />}
                  />
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    );
  }
  return (
    <View style={{ overflow: 'hidden', paddingBottom: 3 }}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}
          onPress={leftTabPressed}
        >
          <View style={styles.tabIcon}><Utensils /></View>
          <Animated.View
            style={[styles.slider, { transform: [{ translateX: translateTabBar }] }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}
          onPress={rightTabPressed}
        >
          <View style={styles.tabIcon}><MapMarker /></View>
        </TouchableOpacity>
      </View>
      {row === 'LOADING' && <CenterSpinner style={{ marginTop: wp(10) }} />}
    </View>
  );
}, (prevProps, nextProps) => prevProps.row === nextProps.row);

const Profile = ({ navigation, route }) => {
  // Set necessary data
  const [state, dispatch] = useContext(Context);
  const headerHeight = state.headerHeight - getStatusBarHeight();

  const [refreshing, setRefreshing] = useState(false);
  const numRefresh = useRef(0);
  const [morePressed, setMorePressed] = useState(false);
  const [editPressed, setEditPressed] = useState(false);

  const onTab = !(route && route.params && route.params.user);
  const isMe = !(!onTab && route.params.user.PK !== state.user.PK);
  const user = isMe ? state.user : route.params.user;

  const [numFollows, setNumFollows] = useState([0, 0]);
  const [reviews, setReviews] = useState(null);
  const numReviews = useRef(0);

  const posts = useRef(['LOADING']);

  useEffect(() => {
    // Get number of followers and following
    (async () => {
      const num = await getNumFollowsQuery({ PK: user.PK, SK: user.SK });
      setNumFollows(num);
      setRefreshing(false);
    })();

    const getPostPictures = (item) => new Promise((resolve, reject) => {
      Storage.get(item.picture, { level: 'protected', identityId: user.identityId })
        .then((url) => {
          item.s3Photo = url;
          item.placeUserInfo = { uid: user.uid }; // attach placeUserInfo property for StoryModal
          resolve(item);
        })
        .catch((err) => {
          console.warn('Error fetching post picture from S3: ', err);
          reject();
        });
    });

    // Get reviews for current user
    (async () => {
      const userReviews = await getUserReviewsQuery({ PK: user.PK, withUserInfo: false });
      const placePosts = {};
      const placePostsOverallRatingSum = {};
      if (userReviews && userReviews.length) {
        Promise.all(userReviews.map(getPostPictures)).then((currPosts) => {
          numReviews.current = currPosts.length;
          for (let i = 0; i < currPosts.length; i += 1) {
            const { placeId } = currPosts[i];
            if (!placePosts[placeId]) {
              placePosts[placeId] = [currPosts[i]];
              placePostsOverallRatingSum[placeId] = currPosts[i].rating.overall;
              placePosts[placeId][0].visible = true;
            } else {
              placePosts[placeId].push(currPosts[i]);
              placePostsOverallRatingSum[placeId] += currPosts[i].rating.overall;
            }
          }
          Object.entries(placePostsOverallRatingSum).forEach(([placeId, sum]) => {
            placePosts[placeId][0].avgOverallRating = sum / placePosts[placeId].length;
          });
          console.log('User Reviews: ', placePosts);

          // Format posts for FlatList
          if (placePosts) {
            posts.current = [[]];
            const placeIdKeys = Object.keys(placePosts);
            for (let i = 0; i < placeIdKeys.length; i += 2) {
              if (i + 1 < placeIdKeys.length) {
                posts.current.push([placePosts[placeIdKeys[i]], placePosts[placeIdKeys[i + 1]]]);
              } else {
                posts.current.push([placePosts[placeIdKeys[i]]]);
              }
            }
            console.log(posts);
          }
          setReviews(placePosts);
          setRefreshing(false);
        });
      } else {
        setReviews([]);
        setRefreshing(false);
      }
    })();
  }, [numRefresh.current, dispatch, isMe, user.PK, user.SK, user.identityId]);

  // Switch list view & map view animations
  const [mapOpen, setMapOpen] = useState(false);
  const position = useRef(new Animated.Value(0)).current;
  const translateTabBar = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, wp(100) / 2 - wp(3) * 2],
  });
  const translateContent = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -wp(100)],
  });
  const translateListContentOpacity = position.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });
  const translateMapContentOpacity = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const translateMapContentZIndex = position.interpolate({
    inputRange: [0, 1],
    outputRange: [-1, -1],
  });

  // Flatlist
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

  // Map
  const { latitude, longitude } = state.location;
  const initialDelta = {
    latitudeDelta: 0.0461, // ~3.5 miles in height
    longitudeDelta: 0.02105,
  };
  const initialRegion = {
    latitude,
    longitude,
    ...initialDelta,
  };
  // Show / hide markers when region changed based on zoom level & geohash
  const onRegionChanged = async ({ markersCopy }) => {
    const {
      southWest: { longitude: startX, latitude: startY },
      northEast: { longitude: endX, latitude: endY },
    } = await mapRef.current.getMapBoundaries();
    const area = (endX - startX) * (endY - startY);

    const bestPrecision = getBestGeoPrecision({ area });

    const geobox = new Set(geohash.bboxes(startY, startX, endY, endX, bestPrecision));
    const geoBoxRemaining = {};

    let didAlterMarkers = false;
    Object.keys(markersCopy).forEach((placeKey) => {
      const hash = placeKey.slice(0, bestPrecision);
      if (geobox.has(hash)) { // if marker is in view
        if (hash in geoBoxRemaining) { // if marker's grid already has marker
          if (markersCopy[placeKey][0].visible) { // if marker is visible, set invisible
            didAlterMarkers = true;
            markersCopy[placeKey][0].visible = false;
          }
        } else { // if marker in grid with no other markers
          if (!markersCopy[placeKey][0].visible) { // if marker not already visible, set visible
            markersCopy[placeKey][0].visible = true;
            didAlterMarkers = true;
          }
          geoBoxRemaining[hash] = placeKey;
        }
      }
    });
    if (didAlterMarkers) {
      setReviews(markersCopy);
    }
  };
  const mapRef = useRef(null);
  const isFitToMarkers = useRef(false);
  const animateToCurrLocation = () => {
    mapRef.current.animateToRegion(initialRegion, 350);
    isFitToMarkers.current = false;
  };
  const fitToMarkers = () => {
    if (reviews) {
      mapRef.current.fitToSuppliedMarkers(Object.keys(reviews).map((placeKey) => placeKey));
      isFitToMarkers.current = true;
    }
  };

  const place = useRef({});

  // More modal
  const moreItems = [
    {
      onPress: () => navigation.navigate('RestaurantList', { type: 'favorites' }),
      icon: <HeartEyes size={wp(6)} />,
      label: 'My Favorites',
    },
    {
      onPress: () => navigation.navigate('RestaurantList', { type: 'likes' }),
      icon: <Heart size={wp(6)} />,
      label: 'My Likes',
    },
    {
      onPress: () => navigation.navigate('Settings'),
      icon: <Gear />,
      label: 'Settings',
      end: true,
    },
  ];

  const renderTopContainer = () => (
    <View style={styles.topContainer}>
      <View style={[styles.headerContainer, { height: headerHeight }]}>
        <View style={styles.headerTitleContainer}>
          {!onTab && (
            <View style={styles.backArrowContainer}>
              <BackArrow
                color={colors.black}
                size={wp(5.5)}
                style={{ flex: 1 }}
                pressed={() => navigation.goBack()}
              />
            </View>
          )}
          <MaskedView
            maskElement={(
              <Text style={styles.headerTitle}>
                {user.name}
              </Text>
            )}
          >
            <LinearGradient
              colors={gradients.orange.colors}
              start={gradients.orange.start}
              end={gradients.orange.end}
              style={{ width: user.name.length * wp(5), height: wp(8.9) }}
            />
          </MaskedView>
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setMorePressed(true)}
        >
          <View style={{ paddingTop: 2 }}>
            {isMe ? <More /> : <ThreeDots rotated size={wp(4.6)} />}
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.topProfileContainer}>
        <View style={{ flexDirection: 'row', flex: 0.7, justifyContent: 'center' }}>
          <View style={styles.pfpContainer}>
            <ProfilePic
              uid={user.uid}
              extUrl={user.picture}
              isMe={isMe}
              size={wp(22)}
              style={styles.userPicture}
            />
            <Text style={styles.locationText}>Atlanta, GA</Text>
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.followContainer}>
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => navigation.push(
                  'FollowsList',
                  { PK: user.PK, uid: user.uid, type: 'Followers' },
                )}
              >
                <Text style={styles.followCountText}>{numFollows[0]}</Text>
                <Text style={styles.followText}>Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => navigation.push(
                  'FollowsList',
                  {
                    PK: user.PK, uid: user.uid, identityId: user.identityId, type: 'Following',
                  },
                )}
              >
                <Text style={styles.followCountText}>{numFollows[1]}</Text>
                <Text style={styles.followText}>Following</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.followButton}
              >
                <Text style={styles.followCountText}>{numReviews.current}</Text>
                <Text style={styles.followText}>Reviews</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsContainer}>
              {isMe
                && (
                  <TouchableOpacity
                    style={[styles.editContainer, { backgroundColor: colors.gray3 }]}
                    onPress={() => setEditPressed(true)}
                  >
                    <Text style={[styles.editText, { color: colors.black }]}>Edit Profile</Text>
                  </TouchableOpacity>
                )}
              {!isMe && reviews
                && (
                  <FollowButton
                    currentUser={user}
                    myUser={state.user}
                    reviews={reviews}
                    dispatch={dispatch}
                    containerStyle={styles.editContainer}
                    textStyle={styles.editText}
                  />
                )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const leftTabPressed = () => {
    setMapOpen(false);
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    Animated.spring(position, {
      toValue: 0,
      speed: 40,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };

  const rightTabPressed = () => {
    if (numReviews.current !== 0) {
      // try/catch to prevent error when switching to map view when flatlist hasn't loaded
      try {
        flatListRef.current.scrollToIndex({ animated: true, index: 1 });
        setMapOpen(true);
        Animated.spring(position, {
          toValue: 1,
          speed: 40,
          bounciness: 2,
          useNativeDriver: true,
        }).start();
      } catch (e) {
        leftTabPressed();
      }
    } else {
      console.log('no reviews');
      setMapOpen(true);
      Animated.spring(position, {
        toValue: 1,
        speed: 40,
        bounciness: 2,
        useNativeDriver: true,
      }).start();
    }
  };

  const openPlacePosts = async ({ stories }) => {
    const { placeId } = stories[0];
    if (place.current.placeId !== placeId) {
      place.current = await getPlaceDetailsQuery({ placeId });
    }
    const { uid, name: userName, picture: userPic } = user;
    // Check if current navigation stack contains StoryModal
    // Pass in params in params object if it doesn't
    if (navigation.getState().routeNames.includes('StoryModal')) {
      navigation.push('StoryModal', {
        stories,
        users: { [uid]: { userName, userPic } },
        place: place.current,
        deviceHeight: state.deviceHeight,
      });
    } else {
      navigation.push('StoryModal', {
        screen: 'StoryModal',
        params: {
          stories,
          users: { [uid]: { userName, userPic } },
          place: place.current,
          deviceHeight: state.deviceHeight,
        },
      });
    }
  };

  const renderRow = (item) => (
    <RowItem
      row={item}
      translateContent={translateContent}
      translateListContentOpacity={translateListContentOpacity}
      openPlacePosts={openPlacePosts}
      leftTabPressed={leftTabPressed}
      rightTabPressed={rightTabPressed}
      translateTabBar={translateTabBar}
    />
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar animated barStyle="dark-content" />
      <MoreView items={moreItems} morePressed={morePressed} setMorePressed={setMorePressed} />
      {mapOpen && (
        <>
          <TouchableOpacity
            style={[
              styles.mapViewTabButtonOverlay,
              {
                top: numReviews.current === 0 ? insets.top + wp(48.8) : insets.top,
                left: wp(2.5),
              },
            ]}
            onPress={leftTabPressed}
          />
          <TouchableOpacity
            style={[
              styles.mapViewTabButtonOverlay,
              {
                top: numReviews.current === 0 ? insets.top + wp(48.8) : insets.top,
                right: wp(2.5),
              },
            ]}
            onPress={rightTabPressed}
          />
        </>
      )}
      <EditProfile
        editPressed={editPressed}
        setEditPressed={setEditPressed}
        user={user}
        dispatch={dispatch}
        deviceHeight={state.deviceHeight}
      />
      <FlatList
        pointerEvents={mapOpen ? 'none' : 'auto'}
        scrollEnabled={!mapOpen}
        data={posts.current}
        refreshing={refreshing}
        renderItem={({ item }) => renderRow(item)}
        keyExtractor={(item, index) => index}
        onRefresh={() => {
          numRefresh.current += 1;
          setRefreshing(true);
        }}
        initialScrollIndex={0}
        ref={flatListRef}
        ListHeaderComponent={renderTopContainer()}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{
          paddingBottom: posts.current.length > 3
            ? wp(1) : wp(50) + wp(57) * (3 - posts.current.length),
        }}
      />
      <Animated.View
        style={[
          styles.mapContainer,
          { top: insets.top },
          {
            transform: [{ translateX: translateContent }],
            opacity: translateMapContentOpacity,
            zIndex: translateMapContentZIndex,
          },
        ]}
      >
        <MapView
          style={styles.map}
          initialRegion={initialRegion}
          rotateEnabled={false}
          pitchEnabled={false}
          userInterfaceStyle="light"
          ref={mapRef}
          onRegionChangeComplete={() => onRegionChanged({ markersCopy: { ...reviews } })}
        >
          {reviews && Object.entries(reviews).map(([placeKey, [{
            name, geo, avgOverallRating, visible,
          }]]) => {
            const {
              latitude: placeLat,
              longitude: placeLng,
            } = geohash.decode(geo); // Get lat/lng from geohash
            return (
              <Marker
                key={placeKey}
                identifier={placeKey}
                coordinate={{ latitude: placeLat, longitude: placeLng }}
              >
                <RatingMapMarker name={name} rating={avgOverallRating} visible={visible} />
              </Marker>
            );
          })}
          <Marker
            key={`${latitude}${longitude}`}
            identifier={`${latitude}${longitude}`}
            coordinate={{ latitude, longitude }}
          >
            <LocationMapMarker />
          </Marker>
        </MapView>
        <TouchableOpacity
          onPress={() => (isFitToMarkers.current
            ? animateToCurrLocation()
            : fitToMarkers())}
          activeOpacity={0.9}
          style={[styles.locationBackBtnContainer, shadows.base]}
        >
          <LocationArrow size={wp(5)} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

Profile.propTypes = propTypes;

const styles = StyleSheet.create({
  topContainer: {
    overflow: 'hidden',
    flex: 1,
  },
  mapViewTabButtonOverlay: {
    position: 'absolute',
    zIndex: 2,
    height: wp(11.6),
    width: wp(47.5),
    opacity: 0,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'flex-start',
    marginTop: wp(3),
  },
  headerTitle: {
    fontFamily: 'Semi',
    fontSize: wp(6.2),
    color: colors.primary,
    paddingLeft: wp(5),
    paddingTop: wp(1.6),
    lineHeight: wp(6.2),
  },
  backArrowContainer: {
    paddingVertical: wp(0.3),
    marginLeft: sizes.margin,
  },
  moreButton: {
    alignSelf: 'center',
    paddingRight: wp(5),
    paddingTop: wp(0.2),
  },
  topProfileContainer: {
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'column',
    marginTop: -wp(1.5),
  },
  pfpContainer: {
    paddingTop: wp(5),
    paddingBottom: wp(4),
    marginLeft: wp(3),
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userPicture: {
    marginBottom: wp(2),
  },
  locationText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.tertiary,
  },
  infoContainer: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: wp(1.5) + 0.35 * sizes.b2,
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: wp(3),
  },
  followButton: {
    width: '30%',
    alignItems: 'center',
  },
  followCountText: {
    fontFamily: 'Semi',
    fontSize: wp(4.8),
    color: colors.accent,
  },
  followText: {
    fontFamily: 'Book',
    fontSize: sizes.b3,
    color: colors.black,
    marginTop: -wp(1),
    letterSpacing: 0.3,
  },
  actionsContainer: {
    width: wp(68),
    paddingHorizontal: wp(3),
    flexDirection: 'row',
    justifyContent: 'center',
    paddingTop: wp(3.8),
  },
  editContainer: {
    width: '70%',
    height: wp(10.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wp(2),
  },
  editText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    paddingTop: wp(0.3),
  },
  socialContainer: {
    width: wp(6) + wp(5),
    height: wp(6) + wp(5),
    marginLeft: wp(2.5),
  },
  tabContainer: {
    paddingTop: wp(3),
    paddingHorizontal: wp(6),
    marginBottom: wp(2),
    borderBottomLeftRadius: wp(3),
    borderBottomRightRadius: wp(3),
    flexDirection: 'row',
    backgroundColor: 'white',
    ...shadows.lighter,
  },
  tab: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tabIcon: {
    paddingBottom: wp(3.5),
  },
  slider: {
    position: 'absolute',
    bottom: 0,
    height: wp(1),
    width: '100%',
    alignSelf: 'flex-end',
    backgroundColor: colors.black,
    borderTopLeftRadius: wp(1),
    borderTopRightRadius: wp(1),
  },
  postsRowContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: wp(4),
    marginBottom: wp(2.5),
    flexDirection: 'row',
  },
  postItem: {
    width: wp(45),
    height: wp(57),
    backgroundColor: 'white',
    borderRadius: wp(3),
    ...shadows.lighter,
  },
  postImage: {
    flex: 0.62,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    backgroundColor: colors.gray3,
    overflow: 'hidden',
  },
  gradientContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    height: '30%',
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  yumContainer: {
    position: 'absolute',
    top: wp(3.2),
    left: wp(3.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  yumTextContainer: {
    fontFamily: 'Book',
    fontSize: sizes.b3,
    color: 'white',
    paddingLeft: wp(1.5),
    paddingTop: wp(0.3),
  },
  postBottomContainer: {
    flex: 0.38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postNameText: {
    fontFamily: 'Semi',
    fontSize: sizes.b3,
    textAlign: 'center',
    color: colors.black,
    paddingHorizontal: wp(2),
  },
  postCategoryText: {
    fontFamily: 'Book',
    fontSize: wp(3.1),
    textAlign: 'center',
    color: colors.black,
    overflow: 'hidden',
  },
  starsContainer: {
    paddingTop: wp(1.5),
    marginBottom: wp(1),
  },
  style: {
    marginHorizontal: wp(0.5),
  },
  mapContainer: {
    position: 'absolute',
    left: wp(100),
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
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

export default Profile;
