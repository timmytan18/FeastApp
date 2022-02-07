import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, SafeAreaView, View, Image, TouchableOpacity, Animated, SectionList, Alert,
} from 'react-native';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import Stars from 'react-native-stars';
import { getUserReviewsQuery, getNumFollowsQuery, getFollowersQuery } from '../../api/functions/queryFunctions';
import { deleteFeastItem, batchDeleteFollowingPosts } from '../../api/graphql/mutations';
import { Context } from '../../Store';
import EditProfile from './EditProfile';
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
import CenterSpinner from '../components/util/CenterSpinner';
import {
  colors, gradients, sizes, wp, hp, shadows,
} from '../../constants/theme';

const Profile = ({ navigation, route }) => {
  const [state, dispatch] = useContext(Context);
  const [isLoading, setLoading] = useState(false);
  const headerHeight = state.headerHeight - getStatusBarHeight();

  const [refreshing, setRefreshing] = useState(false);
  const numRefresh = useRef(0);
  const [morePressed, setMorePressed] = useState(false);
  const [editPressed, setEditPressed] = useState(false);

  const onTab = !(route && route.params && route.params.user);
  const isMe = !(!onTab && route.params.user.PK != state.user.PK);
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

  const position = useRef(new Animated.Value(0)).current;

  const translate = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, wp(100) / 2 - wp(3) * 2],
  });

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
      <View style={{ ...shadows.lighter }}>
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
                style={{ width: user.name.length * wp(5), height: hp(3.78) }}
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
                size={wp(19)}
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
          <View style={styles.tabContainer}>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.tab}
              onPress={() => {
                Animated.spring(position, {
                  toValue: 0,
                  speed: 40,
                  bounciness: 2,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <View style={styles.tabIcon}><Utensils /></View>
              <Animated.View style={[styles.slider, { transform: [{ translateX: translate }] }]} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.tab}
              onPress={() => {
                Animated.spring(position, {
                  toValue: 1,
                  speed: 40,
                  bounciness: 2,
                  useNativeDriver: true,
                }).start();
              }}
            >
              <View style={styles.tabIcon}><MapMarker /></View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

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

  const renderRow = (items) => (
    <View style={styles.postsRowContainer}>
      {items.map((item) => (
        <TouchableOpacity key={item.timestamp} style={{ alignItems: 'center' }} activeOpacity={0.9}>
          <View style={styles.postItem}>
            <View style={styles.starsContainer}>
              <Stars
                default={item.rating.overall}
                count={5}
                half
                disabled
                spacing={wp(0.6)}
                fullStar={<StarFull size={wp(4)} />}
                halfStar={<StarHalf size={wp(4)} />}
                emptyStar={<StarEmpty size={wp(4)} />}
              />
            </View>
            <Image
              resizeMode="cover"
              style={styles.postImage}
              source={{ uri: item.s3Photo }}
            />
          </View>
          <Text style={styles.postNameText}>
            {item.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const posts = [];
  const size = 2;
  const reversedReviews = reviews.reverse();
  for (let i = 0; i < reversedReviews.length; i += size) {
    posts.push(reversedReviews.slice(i, i + size));
  }
  const data = [{ title: 'profile', data: posts }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <MoreView items={moreItems} morePressed={morePressed} setMorePressed={setMorePressed} />
      <EditProfile
        editPressed={editPressed}
        setEditPressed={setEditPressed}
        user={user}
        dispatch={dispatch}
      />
      <SectionList
        sections={data}
        keyExtractor={(item, index) => index}
        renderItem={({ item }) => renderRow(item)}
        renderSectionHeader={renderTopContainer}
        refreshing={refreshing}
        onRefresh={() => {
          numRefresh.current += 1;
          setRefreshing(true);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    overflow: 'hidden',
    flex: 1,
    paddingBottom: wp(2.4),
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
    paddingTop: hp(1.5),
  },
  headerTitle: {
    fontFamily: 'Semi',
    fontSize: wp(6.2),
    color: colors.primary,
    paddingLeft: wp(5),
    paddingTop: hp(0.7),
    lineHeight: wp(6.2),
  },
  backArrowContainer: {
    paddingVertical: wp(0.3),
    marginLeft: sizes.margin,
  },
  moreButton: {
    alignSelf: 'center',
    paddingRight: wp(5),
    paddingTop: wp(1),
  },
  topProfileContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderBottomLeftRadius: wp(4),
    borderBottomRightRadius: wp(4),
    flexDirection: 'column',
  },
  pfpContainer: {
    paddingTop: wp(6),
    paddingBottom: hp(1.5),
    marginLeft: wp(1),
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  userPicture: {
    marginBottom: hp(1.1),
  },
  locationText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.tertiary,
  },
  infoContainer: {
    flex: 0.7,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: hp(1.4) + 0.35 * sizes.b2,
  },
  followContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: wp(3),
  },
  followButton: {
    width: '33%',
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
    paddingTop: wp(3) + hp(0.2),
  },
  editContainer: {
    width: '73%',
    height: hp(3) + wp(3.6),
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
    width: hp(3) + wp(5),
    height: hp(3) + wp(5),
    marginLeft: wp(2.5),
  },
  tabContainer: {
    marginTop: hp(1.5),
    marginHorizontal: wp(6),
    flexDirection: 'row',
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
    marginHorizontal: wp(5),
    marginBottom: wp(2.5),
    flexDirection: 'row',
  },
  postItem: {
    width: wp(43.5),
    height: wp(43.5),
  },
  postImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    borderRadius: wp(2),
    backgroundColor: colors.gray3,
  },
  postNameText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.black,
    marginTop: wp(1),
  },
  starsContainer: {
    position: 'absolute',
    top: wp(3),
    right: wp(3),
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingHorizontal: wp(1.7),
    paddingVertical: wp(1.5),
    borderRadius: wp(1.3),
    zIndex: 1,
  },
  style: {
    marginHorizontal: wp(0.5),
  },
});

export default Profile;
