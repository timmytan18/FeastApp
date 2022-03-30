import React, {
  useState, useEffect, useContext, useRef, useCallback,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Animated, StatusBar, FlatList, Alert,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import MapView, { Marker } from 'react-native-maps';
import geohash from 'ngeohash';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import { BallIndicator } from 'react-native-indicators';
import MaskedView from '@react-native-community/masked-view';
// import { useScrollToTop } from '@react-navigation/native';
import {
  createFeastItem, deleteFeastItem,
} from '../../api/graphql/mutations';
import {
  getUserPostsQuery,
  getNumFollowsQuery,
  getPlaceDetailsQuery,
  getUserYumsReceivedQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import getBestGeoPrecision from '../../api/functions/GetBestGeoPrecision';
import EditProfile from './EditProfile';
import ProfileReviews from './ProfileReviews';
import LocationMapMarker from '../components/util/LocationMapMarker';
import ProfilePic from '../components/ProfilePic';
import MoreView from '../components/MoreView';
import ReportModal from '../components/ReportModal';
import FeedbackModal from '../components/FeedbackModal';
import FollowButton from '../components/FollowButton';
import More from '../components/util/icons/More';
import PostListItem from '../components/PostListItem';
import ThreeDots from '../components/util/icons/ThreeDots';
import Gear from '../components/util/icons/Gear';
import Utensils from '../components/util/icons/Utensils';
import Review from '../components/util/icons/Review';
import MapMarker from '../components/util/icons/MapMarker';
import RatingMapMarker from '../components/RatingMapMarker';
import LocationArrow from '../components/util/icons/LocationArrow';
import Expand from '../components/util/icons/Expand';
import BackArrow from '../components/util/icons/BackArrow';
import Save from '../components/util/icons/Save';
import Cam from '../components/util/icons/Cam';
import X from '../components/util/icons/X';
import Feedback from '../components/util/icons/Feedback';
import getBannedUsers from '../../api/functions/GetBannedUsers';
import { ADMIN_UIDS, ADMIN_PASSWORD } from '../../constants/constants';
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

const LIST_STATES = { LOADING: 'LOADING', NO_RESULTS: 'NO_RESULTS' };

// Memoize row rendering, only rerender when row content changes
const areEqual = (prevProps, nextProps) => {
  let equal = prevProps.numReviews === nextProps.numReviews
    && prevProps.refresh === nextProps.refresh;
  if (!equal) return false;
  if (Array.isArray(prevProps.row) && Array.isArray(nextProps.row)) {
    equal = prevProps.row.length === nextProps.row.length;
    if (equal) {
      equal = prevProps.row.every((prev, i) => prev.avgRating === nextProps.row[i].avgRating);
    }
  } else {
    equal = prevProps.row === nextProps.row;
  }
  return equal;
};

const RowItem = React.memo(({
  row,
  index,
  translateLeftContent,
  translatePostListContentOpacity,
  openPlacePosts,
  leftTabPressed,
  centerTabPressed,
  rightTabPressed,
  translateTabBar,
  refresh,
  isMe,
}) => {
  const noResults = row === LIST_STATES.NO_RESULTS;
  if (row !== LIST_STATES.LOADING && !noResults && row.length) {
    return (
      <Animated.View
        style={[
          styles.postsRowContainer,
          {
            transform: [{ translateX: translateLeftContent }],
            opacity: translatePostListContentOpacity,
          },
        ]}
      >
        {row.map(({ placePosts, numYums }) => {
          const item = placePosts[0];
          return (
            <PostListItem
              item={item}
              index={index}
              numYums={numYums}
              placePosts={placePosts}
              openPlacePosts={openPlacePosts}
              key={item.timestamp}
              refresh={refresh}
              isMe={isMe}
            />
          );
        })}
      </Animated.View>
    );
  }
  return (
    <View style={{ overflow: 'hidden', paddingBottom: 3 }}>
      <View style={[styles.tabContainer, noResults && { opacity: 0.6 }]}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}
          onPress={leftTabPressed}
          disabled={noResults}
        >
          <View style={styles.tabIcon}>
            <Utensils />
          </View>
          <Animated.View
            style={[
              styles.slider,
              { transform: [{ translateX: translateTabBar }] },
              noResults && { opacity: 0 },
            ]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}
          onPress={centerTabPressed}
          disabled={noResults}
        >
          <View style={styles.tabIcon}><Review /></View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.tab}
          onPress={rightTabPressed}
          disabled={noResults}
        >
          <View style={styles.tabIcon}><MapMarker /></View>
        </TouchableOpacity>
      </View>
      {
        row === LIST_STATES.LOADING
        && (
          <BallIndicator
            style={{ marginTop: wp(10) }}
            color={colors.tertiary}
            size={wp(7)}
          />
        )
      }
      {
        row === LIST_STATES.NO_RESULTS && (
          <View style={styles.noResultsContainer}>
            <Cam size={wp(7)} />
            <Text style={styles.noResultsText}>No posts yet</Text>
          </View>
        )
      }
    </View>
  );
}, areEqual);

const sideMargin = wp(6);
const screenWidth = wp(100);

const Profile = ({ navigation, route }) => {
  // Set necessary data
  const [state, dispatch] = useContext(Context);
  const headerHeight = state.headerHeight - getStatusBarHeight();
  const mounted = useRef(true);

  const [refreshing, setRefreshing] = useState(false);
  const numRefresh = useRef(0);
  const [morePressed, setMorePressed] = useState(false);
  const [reportPressed, setReportPressed] = useState(false);
  const reportPressedRef = useRef(false);
  const [feedbackPressed, setFeedbackPressed] = useState(false);
  const feedbackPressedRef = useRef(false);
  const [editPressed, setEditPressed] = useState(false);

  const onTab = !(route && route.params && route.params.user);
  const isMe = !(!onTab && route.params.user.PK !== state.user.PK);
  const isAdmin = (!onTab && ADMIN_UIDS.has(route.params.user.uid));
  const iAmAdmin = (!onTab && ADMIN_UIDS.has(state.user.uid));
  const isBanned = onTab ? state.bannedUsers.has(state.user.uid)
    : state.bannedUsers.has(route.params.user.uid);
  const user = isMe ? state.user : route.params.user;

  const [numFollows, setNumFollows] = useState([0, 0]);
  const [reviews, setReviews] = useState(null);
  const numReviews = useRef(0);
  const allReviews = useRef(null);

  const posts = useRef([LIST_STATES.LOADING]);

  useEffect(() => {
    mounted.current = true;

    if (state.bannedUsers.has(user.uid)) {
      posts.current = [LIST_STATES.NO_RESULTS];
      setReviews({});
      setRefreshing(false);
      return;
    }

    // Get number of followers and following
    (async () => {
      const { promise, getValue, errorMsg } = getNumFollowsQuery({ PK: user.PK, SK: user.SK });
      const num = await fulfillPromise(promise, getValue, errorMsg);
      if (mounted.current) {
        setNumFollows(num);
        setRefreshing(false);
      }
    })();

    // Get reviews for user
    (async () => {
      const { promise, getValue, errorMsg } = getUserPostsQuery({
        PK: user.PK, withUserInfo: false,
      });
      const userReviews = await fulfillPromise(promise, getValue, errorMsg);
      if (userReviews && userReviews.length) {
        allReviews.current = userReviews;
        fetchPostsDetails(userReviews);
      } else {
        posts.current = [LIST_STATES.NO_RESULTS];
        if (mounted.current) {
          setReviews({});
          setRefreshing(false);
        }
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [numRefresh.current, isMe, user.PK, user.SK, user.identityId, state.reloadProfileTrigger]);

  const fetchPostsDetails = async (userReviews) => {
    const placePosts = {}; // { placeKey: [placePost, placePost, ...] }
    const placePostsRatingSum = {};
    const placeTextReviews = {};
    // Get yums received for user
    const updatedPlaceNumYums = {};
    const {
      promise: yumPromise,
      getValue: getYumValue,
      errorMsg: yumErrorMsg,
    } = getUserYumsReceivedQuery({ uid: user.uid });
    const yums = await fulfillPromise(yumPromise, getYumValue, yumErrorMsg);
    yums.forEach(({ placeId }) => {
      updatedPlaceNumYums[placeId] = (updatedPlaceNumYums[placeId] || 0) + 1;
    });
    numReviews.current = userReviews.length;
    for (let i = 0; i < userReviews.length; i += 1) {
      if (userReviews[i].picture) {
        userReviews[i].placeUserInfo = {
          uid: user.uid,
          name: user.name,
          picture: user.picture,
          identityId: user.identityId,
        };
      }
      // add to placePosts map
      const { placeId, picture } = userReviews[i];
      if (!placePosts[placeId] && !placeTextReviews[placeId]) {
        if (picture) {
          placePosts[placeId] = [userReviews[i]];
          placePosts[placeId][0].visible = true;
          placeTextReviews[placeId] = 0;
        } else {
          placeTextReviews[placeId] = 1;
        }
        placePostsRatingSum[placeId] = userReviews[i].rating;
      } else {
        if (!placePosts[placeId]) placePosts[placeId] = [];
        if (picture) placePosts[placeId].push(userReviews[i]);
        else placeTextReviews[placeId] += 1;
        placePostsRatingSum[placeId] += userReviews[i].rating;
      }
    }
    Object.entries(placePostsRatingSum).forEach(([placeId, sum]) => {
      if (placePosts[placeId] && (placePosts[placeId].length || placeTextReviews[placeId])) {
        placePosts[placeId][0].avgRating = sum / (placePosts[placeId].length + placeTextReviews[placeId]);
      }
    });

    // Format posts for FlatList, include numYums
    const placeIdKeys = Object.keys(placePosts);
    if (placeIdKeys && placeIdKeys.length) {
      // if (reviews == null) posts.current = [[]];
      posts.current = [[], {
        allReviews: allReviews.current, uid: user.uid, navigation, isReviewsList: true,
      }];
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
    if (mounted.current) {
      setReviews(placePosts);
      setRefreshing(false);
    }
  };

  // Load more posts
  // const fetchNextPosts = async () => {
  //   if (!nextToken.current) return;
  //   const { promise, getValue, errorMsg } = getUserPostsQuery({
  //     PK: user.PK, withUserInfo: false, nextToken: nextToken.current,
  //   });
  //   const {
  //     userReviews, nextToken: currNextToken,
  //   } = await fulfillPromise(promise, getValue, errorMsg);
  //   nextToken.current = currNextToken;
  //   if (userReviews && userReviews.length) {
  //     allReviews.current = allReviews.current.concat(userReviews);
  //     fetchPostsDetails(userReviews);
  //   }
  // };

  // Switch list view & map view animations
  const [mapOpen, setMapOpen] = useState(false);
  const position = useRef(new Animated.Value(0)).current;
  const animatePosition = (value) => {
    Animated.spring(position, {
      toValue: value,
      speed: 40,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };
  const tabWidth = screenWidth - sideMargin * 2;
  const translateTabBar = position.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, tabWidth / 3, tabWidth / 1.5],
  });
  const translateLeftContent = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -screenWidth],
  });
  const translateCenterContent = position.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [screenWidth, 0, -screenWidth],
  });
  const translateRightContent = position.interpolate({
    inputRange: [1, 2],
    outputRange: [screenWidth, 0],
  });
  const translatePostListContentOpacity = position.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [1, 0, 0],
  });
  const translateReviewListContentOpacity = position.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 1, 0],
  });
  const translateMapContentOpacity = position.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, 0, 1],
  });

  // Flatlist
  const flatListRef = useRef(null);
  // useScrollToTop(flatListRef);
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
    if (didAlterMarkers && mounted.current) {
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

  // Report modal
  const reportPost = async () => {
    reportPressedRef.current = true;
  };

  const shouldOpenReportModal = () => {
    if (reportPressedRef.current) {
      setReportPressed(true);
      reportPressedRef.current = false;
    }
  };

  // Feedback modal
  const sendFeedback = async () => {
    feedbackPressedRef.current = true;
  };

  const shouldOpenFeedbackModal = () => {
    if (feedbackPressedRef.current) {
      setFeedbackPressed(true);
      feedbackPressedRef.current = false;
    }
  };

  // Ban user confirmation
  const banUserConfirmation = () => {
    Alert.prompt(
      isBanned ? 'Un-Ban User' : 'Ban User',
      isBanned ? 'Admin only. Confirm un-ban?' : 'Admin only. Confirm reversible ban?',
      (passcode) => {
        if (passcode === ADMIN_PASSWORD) {
          if (isBanned) unBanUser();
          else banUser();
        } else {
          Alert.alert(
            'Error',
            'Incorrect passcode',
            [{ text: 'OK' }],
            { cancelable: false },
          );
        }
      },
      'secure-text',
    );
  };

  const banUser = async () => {
    const banUserInput = {
      PK: `USER#${user.uid}`,
      SK: `#BAN#${user.uid}`,
      GSI1: 'BANNEDUSER#',
      uid: user.uid,
      name: user.name,
    };
    try {
      await API.graphql(graphqlOperation(
        createFeastItem,
        { input: banUserInput },
      ));
      await getBannedUsers(dispatch);
      Alert.alert(
        'Success',
        'User banned',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    } catch (e) {
      console.warn(e);
      Alert.alert(
        'Error',
        'Could not ban user',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    }
  };

  const unBanUser = async () => {
    const unBanUserInput = {
      PK: `USER#${user.uid}`,
      SK: `#BAN#${user.uid}`,
    };
    try {
      await API.graphql(graphqlOperation(
        deleteFeastItem,
        { input: unBanUserInput },
      ));
      await getBannedUsers(dispatch);
      Alert.alert(
        'Success',
        'User un-banned',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    } catch (e) {
      console.warn(e);
      Alert.alert(
        'Error',
        'Could not un-ban user',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    }
  };

  // More modal
  const moreItemsMe = [
    {
      onPress: () => navigation.push('Settings', { uid: user.uid }),
      icon: <Gear />,
      label: 'Settings',
    },
    {
      onPress: sendFeedback,
      icon: <Feedback />,
      label: 'Share Feedback',
      end: true,
    },
  ];

  const moreItemsAdmin = [
    {
      onPress: sendFeedback,
      icon: <Feedback />,
      label: 'Share Feedback',
      end: true,
    },
  ];

  const moreItemsOther = [
    {
      onPress: reportPost,
      icon: <X size={wp(7.2)} color={colors.black} />,
      label: 'Report user',
      end: true,
    },
  ];

  const moreItemsIAmAdmin = [
    {
      onPress: banUserConfirmation,
      icon: <X size={wp(7.2)} color="red" />,
      label: isBanned ? 'Un-Ban User' : 'Ban user',
      end: true,
    },
  ];

  const getMoreItems = () => {
    if (isMe) return moreItemsMe;
    if (isAdmin) return moreItemsAdmin;
    if (iAmAdmin) return moreItemsIAmAdmin;
    return moreItemsOther;
  };

  const renderTopContainer = () => (
    <View style={styles.topContainer}>
      <View style={[styles.headerContainer, { height: headerHeight }]}>
        <View style={styles.headerTitleContainer}>
          {!onTab && (
            <BackArrow
              color={colors.black}
              size={wp(5.5)}
              style={{ flex: 1, marginLeft: sizes.margin }}
              pressed={() => navigation.goBack()}
              containerStyle={[styles.backArrowContainer, !isMe && { paddingRight: wp(5) }]}
            />
          )}
          <View style={[{ paddingTop: wp(3) }, isMe && { paddingLeft: wp(5) }]}>
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
        </View>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setMorePressed(true)}
        >
          <View style={{ paddingTop: 2 }}>
            {isMe ? <More /> : (isAdmin ? <Feedback /> : <ThreeDots rotated size={wp(4.6)} />)}
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
              {!isBanned && user.city ? user.city : 'No location'}
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
                onPress={centerTabPressed}
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
                      onPress={() => navigation.push('SavedPosts')}
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
    animatePosition(0);
  };

  const centerTabPressed = () => {
    setMapOpen(false);
    flatListRef.current.scrollToOffset({ animated: true, offset: 0 });
    animatePosition(1);
  };

  const rightTabPressed = () => {
    // try/catch to prevent error when switching to map view when flatlist hasn't loaded
    try {
      flatListRef.current.scrollToIndex({ animated: true, index: 0 });
      setMapOpen(true);
      animatePosition(2);
    } catch (e) {
      leftTabPressed();
    }
  };

  const openPlacePosts = async ({ stories }) => {
    const { placeId } = stories[0];
    if (place.current.placeId !== placeId) {
      const { promise, getValue, errorMsg } = getPlaceDetailsQuery({ placeId });
      const placeDetails = await fulfillPromise(promise, getValue, errorMsg);
      if (placeDetails) place.current = placeDetails;
    }
    navigation.push('StoryModalModal', {
      screen: 'StoryModal',
      params: {
        stories,
        places: { [place.current.placeId]: place.current },
      },
    });
  };

  const renderRow = useCallback(({ item, index }) => {
    if (item.isReviewsList) {
      return (
        <View>
          <Animated.View
            style={[
              styles.reviewsRowContainer,
              {
                transform: [{ translateX: translateCenterContent }],
                opacity: translateReviewListContentOpacity,
              },
            ]}
          >
            <ProfileReviews
              reviews={item.allReviews}
              uid={item.uid}
              navigation={item.navigation}
              postRowLength={posts.current.length - 2}
            />
          </Animated.View>
        </View>
      );
    }
    return (
      <RowItem
        row={item}
        index={index}
        translateLeftContent={translateLeftContent}
        translatePostListContentOpacity={translatePostListContentOpacity}
        openPlacePosts={openPlacePosts}
        leftTabPressed={leftTabPressed}
        centerTabPressed={centerTabPressed}
        rightTabPressed={rightTabPressed}
        translateTabBar={translateTabBar}
        numReviews={numReviews.current}
        refresh={numRefresh.current}
        isMe={isMe}
      />
    );
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top']}>
      <StatusBar animated barStyle="dark-content" />
      <MoreView
        items={getMoreItems()}
        morePressed={morePressed}
        setMorePressed={setMorePressed}
        onModalHide={() => {
          if (isMe || isAdmin) {
            shouldOpenFeedbackModal();
          } else {
            shouldOpenReportModal();
          }
        }}
      />
      <ReportModal
        reportPressed={reportPressed}
        setReportPressed={setReportPressed}
        sender={{ senderUID: state.user.uid, senderName: state.user.name }}
        post={{ userName: user.name, userUID: user.uid }}
        type="user account"
      />
      <FeedbackModal
        feedbackPressed={feedbackPressed}
        setFeedbackPressed={setFeedbackPressed}
        sender={{ senderUID: state.user.uid, senderName: state.user.name }}
        type="feedback"
      />
      {mapOpen && (
        <>
          <TouchableOpacity
            style={[
              styles.mapViewTabButtonOverlay,
              {
                top: insets.top,
                left: wp(2.5),
              },
            ]}
            onPress={leftTabPressed}
          />
          <TouchableOpacity
            style={[
              styles.mapViewTabButtonOverlay,
              {
                top: insets.top,
                left: wp(2.5) + wp(31.67),
              },
            ]}
            onPress={centerTabPressed}
          />
          <TouchableOpacity
            style={[
              styles.mapViewTabButtonOverlay,
              {
                top: insets.top,
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
        CellRendererComponent={renderRow}
        keyExtractor={(item, index) => index}
        onRefresh={() => {
          numRefresh.current += 1;
          if (mounted.current) setRefreshing(true);
        }}
        initialScrollIndex={0}
        onScrollToIndexFailed={(err) => { console.log(err); }}
        ref={flatListRef}
        ListHeaderComponent={renderTopContainer()}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{
          paddingBottom: (posts.current.length > 4 || numReviews.current === 0
            ? wp(12) : wp(71) + wp(60) * (4 - posts.current.length)),
        }}
      />
      <Animated.View
        style={[
          styles.mapContainer,
          { top: insets.top },
          {
            transform: [{ translateX: translateRightContent }],
            opacity: translateMapContentOpacity,
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
            <LocationMapMarker name="Me" />
          </Marker>
        </MapView>
        <TouchableOpacity
          onPress={() => (isFitToMarkers.current
            ? animateToCurrLocation()
            : fitToMarkers())}
          activeOpacity={0.9}
          style={[styles.locationBackBtnContainer, shadows.base]}
        >
          {isFitToMarkers.current ? <LocationArrow size={wp(5)} />
            : <Expand />}
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
  footerContainer: {
    overflow: 'hidden',
    flex: 1,
    marginLeft: wp(60),
    zIndex: 2,
  },
  mapViewTabButtonOverlay: {
    position: 'absolute',
    zIndex: 2,
    height: wp(11.6),
    width: wp(31.67),
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
  },
  headerTitle: {
    fontFamily: 'Semi',
    fontSize: wp(6.2),
    color: colors.primary,
    paddingTop: wp(1.6),
    lineHeight: wp(6.2),
  },
  backArrowContainer: {
    paddingVertical: wp(0.3),
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: wp(3.3),
    height: '100%',
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
    paddingHorizontal: sideMargin,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabText: {
    fontFamily: 'Semi',
    fontSize: sizes.b2,
    color: colors.black,
    letterSpacing: 0.3,
    paddingRight: wp(1.5),
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
  reviewsRowContainer: {
    position: 'absolute',
    left: 0,
    width: '100%',
    flex: 1,
  },
  mapContainer: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
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
