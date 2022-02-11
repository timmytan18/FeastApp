import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, ImageBackground, TouchableOpacity,
  Animated, Alert, StatusBar, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import MapView, { Marker } from 'react-native-maps';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import Stars from 'react-native-stars';
import { getUserReviewsQuery, getNumFollowsQuery, getFollowersQuery } from '../../api/functions/queryFunctions';
import { deleteFeastItem, batchDeleteFollowingPosts } from '../../api/graphql/mutations';
import { Context } from '../../Store';
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
import { StarFull, StarHalf, StarEmpty } from '../components/util/icons/Star';
import BackArrow from '../components/util/icons/BackArrow';
import Yum from '../components/util/icons/Yum';
import CenterSpinner from '../components/util/CenterSpinner';
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

const Profile = ({ navigation, route }) => {
  const [state, dispatch] = useContext(Context);
  const [isLoading, setLoading] = useState(false);
  const headerHeight = state.headerHeight - getStatusBarHeight();

  const [refreshing, setRefreshing] = useState(false);
  const numRefresh = useRef(0);
  const [morePressed, setMorePressed] = useState(false);
  const [editPressed, setEditPressed] = useState(false);

  const onTab = !(route && route.params && route.params.user);
  const isMe = !(!onTab && route.params.user.PK !== state.user.PK);
  const user = isMe ? state.user : route.params.user;

  const [numFollows, setNumFollows] = useState([0, state.numFollowing]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Get number of followers and following
    (async () => {
      const num = await getNumFollowsQuery({ PK: user.PK, SK: user.SK });
      setNumFollows(num);
      setRefreshing(false);
      const numFollowing = num[1];
      if (isMe && numFollowing !== state.numFollowing) {
        dispatch({
          type: 'SET_NUM_FOLLOWING',
          payload: { num: numFollowing },
        });
      }
    })();

    const getPostPictures = (item) => new Promise((resolve, reject) => {
      Storage.get(item.picture, { level: 'protected', identityId: user.identityId })
        .then((url) => {
          item.s3Photo = url;
          resolve(item);
        })
        .catch((err) => {
          console.warn('Error fetching post picture from S3: ', err);
          reject();
        });
    });

    // Get reviews for current user
    let userReviews;
    (async () => {
      userReviews = await getUserReviewsQuery({ PK: user.PK, withUserInfo: false });
      console.log('User Reviews: ', userReviews);
      if (userReviews) {
        Promise.all(userReviews.map(getPostPictures)).then((posts) => {
          setReviews(posts);
          console.log(posts);
          setRefreshing(false);
        });
      } else {
        setReviews([]);
        setRefreshing(false);
      }
    })();
  }, [numRefresh.current, dispatch, isMe, state.numFollowing, user.PK, user.SK, user.identityId]);

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

  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();

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
  const mapRef = useRef(null);
  const markers = [
    { name: 'CURRENT_USER', lat: latitude, lng: longitude },
    // { name: placeName, lat: placeLat, lng: placeLng },
  ];
  const animateToCurrLocation = () => {
    mapRef.current.animateToRegion(initialRegion, 350);
  };
  const fitToMarkers = () => {
    mapRef.current.fitToSuppliedMarkers(markers.map(({ lat, lng }) => `${lat}${lng}`));
  };

  if (isLoading) {
    return <CenterSpinner />;
  }

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
                <Text style={styles.followCountText}>{reviews.length}</Text>
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
              {!isMe
                && (
                  <FollowButton
                    currentUser={user}
                    myUser={state.user}
                    reviews={reviews}
                    dispatch={dispatch}
                    numFollowing={state.numFollowing}
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

  // const renderItem = (item) => (
  //   <View style={{ flexDirection: 'row' }}>
  //     <View style={{ flex: 0.8, paddingLeft: wp(5) }}>
  //       <Text style={styles.userText}>
  //         {item.name}
  //       </Text>
  //       <Text style={styles.userText}>
  //         {item.review}
  //       </Text>
  //       <Text style={styles.userText}>
  //         Overall:
  //         {' '}
  //         {item.rating.overall}
  //         {' '}
  //         Food:
  //         {item.rating.overall}
  //         {' '}
  //         Value:
  //         {item.rating.value}
  //         {' '}
  //         Service:
  //         {item.rating.service}
  //         {' '}
  //         Atmosphere:
  //         {item.rating.atmosphere}
  //       </Text>
  //       <Text style={styles.userText} />
  //     </View>
  //     <View style={{ width: wp(18), height: wp(18) }}>
  //       <Image
  //         resizeMode="cover"
  //         style={{ flex: 1, width: '100%', height: '100%' }}
  //         source={{ uri: item.s3Photo }}
  //       />
  //       <Text>{item.dish}</Text>
  //     </View>
  //     {isMe && (
  //       <View style={{
  //         flex: 0.2, justifyContent: 'center', alignItems: 'center',
  //       }}
  //       >
  //         <TouchableOpacity onPress={() => {
  //           TwoButtonAlert({
  //             title: 'Delete Post',
  //             yesButton: 'Confirm',
  //             pressed: () => {
  //               deletePost({ timestamp: item.timestamp, s3Key: item.picture });
  //             },
  //           });
  //         }}
  //         >
  //           <Text style={{ color: 'blue' }}>Delete</Text>
  //         </TouchableOpacity>
  //       </View>
  //     )}
  //   </View>
  // );

  const leftTabPressed = () => {
    setMapOpen(false);
    flatListRef.current.scrollToIndex({ animated: true, index: 0 });
    Animated.spring(position, {
      toValue: 0,
      speed: 40,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };

  const rightTabPressed = () => {
    setMapOpen(true);
    flatListRef.current.scrollToIndex({ animated: true, index: 1 });
    Animated.spring(position, {
      toValue: 1,
      speed: 40,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };

  const renderRow = (items) => {
    if (items[0].name) {
      return (
        <Animated.View
          style={[
            styles.postsRowContainer,
            { transform: [{ translateX: translateContent }], opacity: translateListContentOpacity },
          ]}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.timestamp}
              style={styles.postItem}
              activeOpacity={0.9}
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
                    default={item.rating.overall}
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
          ))}
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
      </View>
    );
  };

  const deletePost = async ({ timestamp, s3Key }) => {
    // Delete post from user's profile
    const input = { PK: user.PK, SK: `#PLACE#${timestamp}` };
    try {
      await API.graphql(graphqlOperation(
        deleteFeastItem,
        { input },
      ));
    } catch (err) {
      console.warn('Error deleting post from user profile:', err);
      Alert.alert(
        'Error',
        'Could not delete post',
        [{ text: 'OK' }],
        { cancelable: false },
      );
      return;
    }

    // Delete post image from S3
    try {
      await Storage.remove(s3Key, { level: 'protected' });
    } catch (err) {
      console.warn('Error deleting post image from S3:', err);
      Alert.alert(
        'Error',
        'Could not delete post',
        [{ text: 'OK' }],
        { cancelable: false },
      );
      return;
    }

    // Remove user's post from followers' feeds in batches
    const followers = await getFollowersQuery({ PK: user.PK, onlyReturnUIDs: true });
    const postInUserFeeds = [];
    followers.forEach(({ follower: { PK: followerPK } }) => {
      postInUserFeeds.push({
        PK: followerPK,
        SK: `#FOLLOWINGPOST#${timestamp}#${user.uid}`,
      });
    });

    console.log(postInUserFeeds);
    if (postInUserFeeds.length) {
      let i; let j;
      const BATCH_NUM = 25; // DynamoDB batch requests are 25 items max
      for (i = 0, j = postInUserFeeds.length; i < j; i += BATCH_NUM) {
        const batch = postInUserFeeds.slice(i, i + BATCH_NUM);
        try {
          await API.graphql(graphqlOperation(
            batchDeleteFollowingPosts,
            { input: { posts: batch } },
          ));
        } catch (err) {
          console.warn("Error removing followed user's posts from feed", err);
        }
      }
    }
    // Refresh user posts list
    numRefresh.current += 1;
    setRefreshing(true);
  };

  const posts = [[{}]];
  const size = 2;
  for (let i = 0; i < reviews.length; i += size) {
    posts.push(reviews.slice(i, i + size));
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar animated barStyle="dark-content" />
      <MoreView items={moreItems} morePressed={morePressed} setMorePressed={setMorePressed} />
      {mapOpen && (
        <>
          <TouchableOpacity
            style={[styles.mapViewTabButtonOverlay, { top: insets.top, left: wp(2.5) }]}
            onPress={leftTabPressed}
          />
          <TouchableOpacity
            style={[styles.mapViewTabButtonOverlay, { top: insets.top, right: wp(2.5) }]}
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
        data={posts}
        refreshing={refreshing}
        renderItem={({ item }) => renderRow(item)}
        keyExtractor={(item, index) => index}
        onRefresh={() => {
          numRefresh.current += 1;
          setRefreshing(true);
        }}
        ref={flatListRef}
        ListHeaderComponent={renderTopContainer()}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: wp(1) }}
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
          onMapReady={fitToMarkers}
        >
          {markers.map(({
            name, lat, lng,
          }) => {
            if (name === 'CURRENT_USER') {
              return (
                <Marker
                  key={`${lat}${lng}`}
                  identifier={`${lat}${lng}`}
                  coordinate={{ latitude: lat, longitude: lng }}
                >
                  <LocationMapMarker name="Me" />
                </Marker>
              );
            }
            return (
              <Marker
                key={`${lat}${lng}`}
                identifier={`${lat}${lng}`}
                coordinate={{ latitude: lat, longitude: lng }}
              >
                <LocationMapMarker isUser={false} name={name} />
              </Marker>
            );
          })}
        </MapView>
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
    borderBottomLeftRadius: wp(4),
    borderBottomRightRadius: wp(4),
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
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    backgroundColor: colors.gray3,
    overflow: 'hidden',
  },
  gradientContainer: {
    overflow: 'hidden',
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
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
    // top: wp(5.5),
    left: wp(100),
    width: '100%',
    height: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

export default Profile;
