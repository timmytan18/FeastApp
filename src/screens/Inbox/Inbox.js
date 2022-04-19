import React, {
  useState, useEffect, useContext, useRef, useCallback,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, FlatList, Image,
} from 'react-native';
import { BallIndicator } from 'react-native-indicators';
import { useScrollToTop, useFocusEffect } from '@react-navigation/native';
import { Storage } from 'aws-amplify';
import {
  getFollowersByTimeQuery,
  getUserYumsReceivedByTimeQuery,
  getUserCommentsReceivedByTimeQuery,
  getFollowingQuery,
  getUserPostQuery,
  getPlaceDetailsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import { fetchCurrentUserUID } from '../../api/functions/FetchUserProfile';
import getElapsedTime from '../../api/functions/GetElapsedTime';
import ProfilePic from '../components/ProfilePic';
import FollowButton from '../components/FollowButton';
import Yum from '../components/util/icons/Yum';
import Comment from '../components/util/icons/Comment';
import { storeLocalData, localDataKeys } from '../../api/functions/LocalStorage';
import { Context } from '../../Store';
import {
  colors, sizes, wp, wpFull,
} from '../../constants/theme';

const today = new Date();
const isToday = (updatedAt) => {
  const date = new Date(updatedAt);
  return date.getDate() === today.getDate()
    && date.getMonth() === today.getMonth()
    && date.getFullYear() === today.getFullYear();
};

const NUM_DAYS_TO_FETCH = 8;
const FOLLOW = 'follow';
const YUM = 'yum';
const COMMENT = 'comment';

const YumNotifItem = ({ item, openUserProfile, openPost }) => {
  const [postPic, setPostPic] = useState(null);
  useEffect(() => {
    (async () => {
      if (item.imgUrl) {
        const img = await Storage.get(item.imgUrl);
        setPostPic(img);
      }
    })();
  }, [item.picture]);
  return (
    <View style={styles.userItemContainer}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        activeOpacity={0.7}
        onPress={() => openPost({
          placeId: item.placeId, timestamp: item.timestamp, type: item.type,
        })}
      >
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openUserProfile({ fetchUID: item.uid })}
          >
            <ProfilePic
              uid={item.uid}
              extUrl={item.picture}
              size={userPicSize}
              style={{ marginRight: sizes.margin }}
            />
          </TouchableOpacity>
          <View style={styles.infoContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openUserProfile({ fetchUID: item.uid })}
            >
              <Text style={styles.userNameText}>{item.name}</Text>
            </TouchableOpacity>
            <Text style={styles.subtitleText}>
              yummed your post
              <Text style={styles.elapsedTimeText}>
                {' '}
                ·
                {' '}
                {getElapsedTime(item.updatedAt)}
              </Text>
            </Text>
          </View>
        </View>
        <View>
          <Image
            resizeMode="stretch"
            style={styles.postImage}
            source={{ uri: postPic }}
          />
          <View style={{ position: 'absolute', right: 4, bottom: 4 }}>
            <Yum size={wp(4.5)} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const CommentNotifItem = ({ item, openUserProfile, openPost }) => {
  const [postPic, setPostPic] = useState(null);
  useEffect(() => {
    (async () => {
      if (item.imgUrl) {
        const img = await Storage.get(item.imgUrl);
        setPostPic(img);
      }
    })();
  }, [item.picture]);
  return (
    <View style={styles.userItemContainer}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        activeOpacity={0.7}
        onPress={() => openPost({
          placeId: item.placeId, timestamp: item.timestamp, type: item.type,
        })}
      >
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => openUserProfile({ fetchUID: item.uid })}
          >
            <ProfilePic
              uid={item.uid}
              extUrl={item.picture}
              size={userPicSize}
              style={{ marginRight: sizes.margin }}
            />
          </TouchableOpacity>
          <View style={styles.infoContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => openUserProfile({ fetchUID: item.uid })}
            >
              <Text style={styles.userNameText}>{item.name}</Text>
            </TouchableOpacity>
            <Text style={styles.subtitleText} numberOfLines={2}>
              commented:
              {' '}
              {item.comment.slice(0, 45)}
              <Text style={styles.elapsedTimeText}>
                {' '}
                ·
                {' '}
                {getElapsedTime(item.updatedAt)}
              </Text>
            </Text>
          </View>
        </View>
        <View>
          <Image
            resizeMode="stretch"
            style={styles.postImage}
            source={{ uri: postPic }}
          />
          <View style={{ position: 'absolute', right: 4, bottom: 4 }}>
            <Comment size={wp(4.5)} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const Inbox = ({ navigation, route }) => {
  // Set necessary data
  const [
    {
      user, bannedUsers, reloadProfileTrigger, reloadMapTrigger,
    },
  ] = useContext(Context);

  const [notifications, setNotifications] = useState(null);
  const todayNotifs = useRef(true);
  const [refreshing, setRefreshing] = useState(false);
  const numRefresh = useRef(0);
  const mounted = useRef(true);

  const flatlistRef = useRef(null);
  useScrollToTop(flatlistRef);

  useFocusEffect(
    useCallback(() => {
      if (route.params && route.params.shouldReload) {
        numRefresh.current += 1;
        setRefreshing(true);
        route.params.shouldReload = false;
      }
    }, [route.params]),
  );

  useEffect(() => {
    mounted.current = true;
    todayNotifs.current = true;
    (async () => {
      let promise; let getValue; let errorMsg;
      const dateOneWeekAgo = new Date(new Date().setDate(new Date().getDate() - NUM_DAYS_TO_FETCH));
      const oneWeekAgo = dateOneWeekAgo.toISOString();
      // Get users that I follow
      ({ promise, getValue, errorMsg } = getFollowingQuery({ uid: user.uid, onlyReturnPKs: true }));
      let followingUsers = await fulfillPromise(promise, getValue, errorMsg);
      followingUsers = followingUsers.map((followedUser) => followedUser.uid);
      followingUsers = new Set(followingUsers);
      // Get new followers
      ({ promise, getValue, errorMsg } = getFollowersByTimeQuery({
        PK: user.PK, timestamp: oneWeekAgo,
      }));
      const follows = await fulfillPromise(promise, getValue, errorMsg);
      follows.forEach((item) => {
        item.type = FOLLOW;
        item.follower.isFollowing = followingUsers.has(item.follower.uid);
      });
      // Get new yums
      ({ promise, getValue, errorMsg } = getUserYumsReceivedByTimeQuery({
        uid: user.uid, timestamp: oneWeekAgo,
      }));
      let yums = await fulfillPromise(promise, getValue, errorMsg);
      yums = yums.filter((item) => {
        item.type = YUM;
        return (item.uid !== user.uid);
      });
      // Get new comments
      ({ promise, getValue, errorMsg } = getUserCommentsReceivedByTimeQuery({
        uid: user.uid, timestamp: oneWeekAgo,
      }));
      let comments = await fulfillPromise(promise, getValue, errorMsg);
      comments = comments.filter((item) => {
        item.type = COMMENT;
        return (item.uid !== user.uid);
      });
      const notifs = follows.concat(yums.concat(comments));
      notifs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // sort by most recent
      if (notifs && notifs.length) {
        await storeLocalData(localDataKeys.LATEST_NOTIFICATION, notifs[0].updatedAt);
      }
      if (mounted.current) {
        setNotifications(notifs);
        setRefreshing(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, [user.PK, user.uid, numRefresh.current, reloadProfileTrigger, reloadMapTrigger]);

  const openUserProfile = async ({ fetchUID }) => {
    const currUser = await fetchCurrentUserUID({ fetchUID, myUID: user.uid });
    navigation.push(
      'ProfileStack',
      { screen: 'Profile', params: { user: currUser } },
    );
  };

  const openPost = async ({ placeId, timestamp, type }) => {
    let promise; let getValue; let errorMsg;
    // Get post details
    ({ promise, getValue, errorMsg } = getUserPostQuery({ uid: user.uid, timestamp }));
    const post = await fulfillPromise(promise, getValue, errorMsg);
    // posts[0].placeUserInfo = { uid: user.uid, name: user.name, picture: user.picture };
    // Get place details
    ({ promise, getValue, errorMsg } = getPlaceDetailsQuery({ placeId }));
    const place = await fulfillPromise(promise, getValue, errorMsg);
    navigation.push('StoryModalModal', {
      screen: 'StoryModal',
      params: {
        stories: [post],
        places: { [place.placeId]: place },
        openYums: type === YUM,
        openComments: type === COMMENT,
      },
    });
  };

  const renderFollowerItem = ({ item, updatedAt }) => (
    <View style={styles.userItemContainer}>
      <View style={styles.userInfoContainer}>
        <TouchableOpacity
          style={{ flexDirection: 'row' }}
          activeOpacity={0.7}
          onPress={() => openUserProfile({ fetchUID: item.uid })}
        >
          <ProfilePic
            uid={item.uid}
            extUrl={item.picture}
            size={userPicSize}
            style={{ marginRight: sizes.margin }}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.userNameText}>{item.name}</Text>
            <Text style={styles.subtitleText}>
              started following you
              <Text style={styles.elapsedTimeText}>
                {' '}
                ·
                {' '}
                {getElapsedTime(updatedAt)}
              </Text>
            </Text>
          </View>
        </TouchableOpacity>
        {item.isFollowing ? <Text style={styles.followingText}>Following</Text>
          : (
            <FollowButton
              currentUser={item}
              myUser={user}
              containerStyle={styles.followContainer}
              textStyle={styles.followText}
            />
          )}
      </View>
    </View>
  );

  const listHeaderComponent = ({ child, title }) => (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          {title}
        </Text>
      </View>
      {child}
    </View>
  );

  const listFooterComponent = ({ child }) => (
    <View>
      <View style={styles.footerContainer} />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>
          This week
        </Text>
      </View>
      {child}
    </View>
  );

  const renderItem = ({ item, index }) => {
    const currUID = item.type === FOLLOW ? item.follower.uid : item.uid;
    if (bannedUsers.has(currUID)) return null;
    if (index === 0) todayNotifs.current = true;
    let notifItem;
    if (item.type === FOLLOW) {
      notifItem = renderFollowerItem({ item: item.follower, updatedAt: item.updatedAt });
    } else if (item.type === YUM) {
      notifItem = (
        <YumNotifItem
          item={item}
          openUserProfile={openUserProfile}
          openPost={openPost}
        />
      );
    } else {
      notifItem = (
        <CommentNotifItem
          item={item}
          openUserProfile={openUserProfile}
          openPost={openPost}
        />
      );
    }
    if (index === 0 && isToday(item.updatedAt)) {
      return listHeaderComponent({ child: notifItem, title: 'Today' });
    } if (!isToday(item.updatedAt) && todayNotifs.current) {
      todayNotifs.current = false;
      return index === 0
        ? listHeaderComponent({ child: notifItem, title: 'This week' }) : listFooterComponent({ child: notifItem });
    }
    return notifItem;
  };

  return (
    <View style={styles.container}>
      {notifications === null
        && (
          <BallIndicator
            style={styles.ballIndicator}
            color={colors.tertiary}
          />
        )}
      <FlatList
        data={notifications}
        refreshing={refreshing}
        ref={flatlistRef}
        renderItem={renderItem}
        keyExtractor={(item) => item.updatedAt}
        onRefresh={() => {
          numRefresh.current += 1;
          setRefreshing(true);
        }}
        initialScrollIndex={0}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ width: wpFull(100), paddingVertical: wpFull(4) }}
      />
      {notifications !== null && notifications.length === 0
        && (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>
              Your notifications will
              {'\n'}
              appear here.
            </Text>
          </View>
        )}
    </View>
  );
};

const userPicSize = wp(11);
const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: sizes.margin,
    paddingTop: wp(1),
    paddingBottom: wp(2),
  },
  headerText: {
    fontFamily: 'Medium',
    letterSpacing: 0.22,
    fontSize: sizes.b2,
    color: colors.black,
    marginTop: 1,
    lineHeight: sizes.b0,
  },
  footerContainer: {
    width: '100%',
    height: 0.5,
    marginVertical: sizes.margin,
    backgroundColor: colors.gray3,
  },
  noPostsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  noPostsText: {
    fontFamily: 'Book',
    fontSize: sizes.h3,
    color: colors.black,
    textAlign: 'center',
    marginBottom: wp(10),
  },
  elapsedTimeText: {
    fontSize: sizes.b4,
    color: colors.tertiary,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItemContainer: {
    flex: 1,
    height: wp(17),
    marginVertical: wp(0.5),
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sizes.margin,
  },
  infoContainer: {
    justifyContent: 'flex-end',
  },
  userNameText: {
    fontFamily: 'Medium',
    letterSpacing: 0.22,
    fontSize: sizes.b2,
    color: colors.black,
    marginTop: 1,
    lineHeight: sizes.b0,
  },
  subtitleText: {
    fontFamily: 'Book',
    letterSpacing: 0.22,
    fontSize: sizes.b3,
    color: colors.black,
    marginTop: -2,
    lineHeight: sizes.b0,
    width: wp(60),
  },
  followingText: {
    fontFamily: 'BookItalic',
    marginRight: wp(5),
    alignSelf: 'center',
    fontSize: sizes.b3,
    color: colors.tertiary,
  },
  followContainer: {
    width: '26%',
    height: wp(8.25),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  followText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    paddingTop: wp(0.3),
  },
  postImage: {
    width: wp(11.5),
    height: wp(11.5),
    borderRadius: 2,
    backgroundColor: colors.gray3,
  },
});

export default Inbox;
