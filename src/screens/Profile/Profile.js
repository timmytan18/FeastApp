import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
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
import {
  getUserPostsQuery, getNumFollowsQuery, getPlaceDetailsQuery, getUserYumsReceivedQuery,
} from '../../api/functions/queryFunctions';
import getBestGeoPrecision from '../../api/functions/GetBestGeoPrecision';
import EditProfile from './EditProfile';
import LocationMapMarker from '../components/util/LocationMapMarker';
import ProfilePic from '../components/ProfilePic';
import MoreView from '../components/MoreView';
import FollowButton from '../components/FollowButton';
import More from '../components/util/icons/More';
import PostListItem from '../components/PostListItem';
import ThreeDots from '../components/util/icons/ThreeDots';
// import HeartEyes from '../components/util/icons/HeartEyes';
// import Heart from '../components/util/icons/Heart';
import Gear from '../components/util/icons/Gear';
import Utensils from '../components/util/icons/Utensils';
import MapMarker from '../components/util/icons/MapMarker';
import RatingMapMarker from '../components/RatingMapMarker';
import LocationArrow from '../components/util/icons/LocationArrow';
import BackArrow from '../components/util/icons/BackArrow';
import Save from '../components/util/icons/Save';
import Cam from '../components/util/icons/Cam';
import X from '../components/util/icons/X';
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

const ADDED_ATTR = ['imgUrl', 's3Photo', 'visible', 'avgRating'];

const LIST_STATES = { LOADING: 'LOADING', NO_RESULTS: 'NO_RESULTS' };

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
  if (row !== LIST_STATES.LOADING && row !== LIST_STATES.NO_RESULTS && row.length) {
    return (
      <Animated.View
        style={[
          styles.postsRowContainer,
          { transform: [{ translateX: translateContent }], opacity: translateListContentOpacity },
        ]}
      >
        {row.map(({ placePosts, numYums }) => {
          const item = placePosts[0];
          return (
            <PostListItem
              item={item}
              numYums={numYums}
              placePosts={placePosts}
              openPlacePosts={openPlacePosts}
              key={item.timestamp}
            />
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
      {row === LIST_STATES.LOADING && <CenterSpinner style={{ marginTop: wp(10) }} />}
      {row === LIST_STATES.NO_RESULTS && (
        <View style={styles.noResultsContainer}>
          <Cam size={wp(7)} />
          <Text style={styles.noResultsText}>No posts yet</Text>
        </View>
      )}
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
  const allReviews = useRef(null);

  const posts = useRef([LIST_STATES.LOADING]);

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
          // Attach placeUserInfo property for StoryModal
          item.placeUserInfo = {
            uid: user.uid,
            name: user.name,
            picture: user.picture,
            identityId: user.identityId,
          };
          resolve(item);
        })
        .catch((err) => {
          console.warn('Error fetching post picture from S3: ', err);
          reject();
        });
    });

    // Get reviews for current user
    (async () => {
      const userReviews = await getUserPostsQuery({ PK: user.PK, withUserInfo: false });
      const placePosts = {}; // { placeKey: [placePost, placePost, ...] }
      const placePostsRatingSum = {};
      if (userReviews && userReviews.length) {
        allReviews.current = userReviews;
        // Get yums received for current user
        const updatedPlaceNumYums = {};
        const yums = await getUserYumsReceivedQuery({ uid: user.uid });
        yums.forEach(({ placeId }) => {
          updatedPlaceNumYums[placeId] = (updatedPlaceNumYums[placeId] || 0) + 1;
        });
        Promise.all(userReviews.map(getPostPictures)).then((currPosts) => {
          numReviews.current = currPosts.length;
          for (let i = 0; i < currPosts.length; i += 1) {
            // add to placePosts map
            const { placeId } = currPosts[i];
            if (!placePosts[placeId]) {
              placePosts[placeId] = [currPosts[i]];
              placePostsRatingSum[placeId] = currPosts[i].rating;
              placePosts[placeId][0].visible = true;
            } else {
              placePosts[placeId].push(currPosts[i]);
              placePostsRatingSum[placeId] += currPosts[i].rating;
            }
          }
          Object.entries(placePostsRatingSum).forEach(([placeId, sum]) => {
            placePosts[placeId][0].avgRating = sum / placePosts[placeId].length;
          });

          // Format posts for FlatList, include numYums
          const placeIdKeys = Object.keys(placePosts);
          if (placeIdKeys && placeIdKeys.length) {
            posts.current = [[]];
            for (let i = 0; i < placeIdKeys.length; i += 2) {
              const rowItem = [{
                placePosts: placePosts[placeIdKeys[i]],
                numYums: updatedPlaceNumYums[placeIdKeys[i]],
              }];
              if (i + 1 < placeIdKeys.length) {
                rowItem.push({
                  placePosts: placePosts[placeIdKeys[i + 1]],
                  numYums: updatedPlaceNumYums[placeIdKeys[i + 1]],
                });
              }
              posts.current.push(rowItem);
            }
          }
          setReviews(placePosts);
          setRefreshing(false);
        });
      } else {
        posts.current = [LIST_STATES.NO_RESULTS];
        setReviews({});
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
  const moreItems = isMe ? [
    {
      onPress: () => navigation.push('Settings', { uid: user.uid }),
      icon: <Gear />,
      label: 'Settings',
      end: true,
    },
  ] : [
    {
      onPress: () => { },
      icon: <X size={wp(7.2)} color={colors.black} />,
      label: 'Report user',
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
            <Text
              style={[styles.locationText, !user.city && { fontFamily: 'MediumItalic' }]}
              numberOfLines={2}
            >
              {user.city || 'No location'}
            </Text>
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
                onPress={() => navigation.push(
                  'ProfileReviews',
                  { reviews: allReviews.current },
                )}
              >
                <Text style={styles.followCountText}>{numReviews.current}</Text>
                <Text style={styles.followText}>Reviews</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.actionsContainer}>
              {isMe
                && (
                  <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                      style={[styles.editContainer, styles.isMeEditContainer]}
                      onPress={() => setEditPressed(true)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.editText, { color: colors.black }]}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.savedContainer}
                      onPress={() => navigation.push('SavedPosts', { type: 'saved' })}
                      activeOpacity={0.7}
                    >
                      <Save size={wp(5)} color="none" outlineColor={colors.black} outlineWidth={2.6} />
                    </TouchableOpacity>
                  </View>
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
                    ADDED_ATTR={ADDED_ATTR}
                  />
                )}
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const leftTabPressed = () => {
    if (numReviews.current === 0) {
      posts.current = [LIST_STATES.NO_RESULTS];
    }
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
      posts.current = [[]];
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
    navigation.push('StoryModalModal', {
      screen: 'StoryModal',
      params: {
        stories,
        places: { [place.current.placeId]: place.current },
        deviceHeight: state.deviceHeight,
      },
    });
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <StatusBar animated barStyle="dark-content" />
      <MoreView
        items={moreItems}
        morePressed={morePressed}
        setMorePressed={setMorePressed}
      />
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
          paddingBottom: posts.current.length > 3 || numReviews.current === 0
            ? wp(12) : wp(71) + wp(60) * (3 - posts.current.length),
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
            name, geo, avgRating, visible,
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
                <RatingMapMarker name={name} rating={avgRating} visible={visible} />
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
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
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
    textAlign: 'center',
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
    marginRight: wp(2),
  },
  editContainer: {
    width: '70%',
    height: wp(10.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    paddingTop: wp(0.3),
  },
  isMeEditContainer: {
    backgroundColor: colors.gray3,
    marginLeft: wp(0.89),
    marginRight: wp(1.5),
  },
  savedContainer: {
    width: '19.5%',
    height: wp(10.5),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray3,
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
    backgroundColor: '#fff',
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
    backgroundColor: colors.lightBlue,
  },
  noResultsContainer: {
    width: '100%',
    height: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: colors.tertiary,
    marginTop: wp(2),
  },
});

export default Profile;
