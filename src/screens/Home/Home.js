import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, View, FlatList, TouchableOpacity, Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import * as Notifications from 'expo-notifications';
import { useScrollToTop } from '@react-navigation/native';
import { BallIndicator } from 'react-native-indicators';
import {
  getFollowingPostsDetailsQuery,
  getPlaceDetailsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import deletePostConfirmation from '../../api/functions/DeletePost';
import { fetchCurrentUserUID } from '../../api/functions/FetchUserProfile';
import savePost from '../../api/functions/SavePost';
import CommentsModal from '../components/CommentsModal';
import PostItem from '../components/PostItem';
import ProfilePic from '../components/ProfilePic';
import MoreView from '../components/MoreView';
import ReportModal from '../components/ReportModal';
import Save from '../components/util/icons/Save';
import X from '../components/util/icons/X';
import Logo from '../components/util/icons/Logo';
import SearchButton from '../components/util/SearchButton';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import { DEFAULT_COORDINATES, NOTIF_TYPES, GET_POST_ID } from '../../constants/constants';
import {
  colors, isPad, sizes, wp, wpFull,
} from '../../constants/theme';

const NUM_POSTS_TO_FETCH = 8;
const NUM_DAYS_TO_FETCH = 7;
const ALL_POSTS_FETCHED = 'allPostsFetched';

const Home = ({ navigation }) => {
  const [state, dispatch] = useContext(Context);
  const {
    user: {
      uid: myUID, PK: myPK, name: myName, picture: myPicture, expoPushToken: myExpoPushToken,
    }, savedPosts,
  } = state;

  const [posts, setPosts] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const numRefresh = useRef(0);
  const [loading, setLoading] = useState(false);

  const currPost = useRef(null);
  const moreItems = useRef([]);
  const [morePressed, setMorePressed] = useState(false);
  const [reportPressed, setReportPressed] = useState(false);
  const reportPressedRef = useRef(false);

  const mounted = useRef(true);

  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener();

    // This listener is fired whenever a user taps on or interacts with a notification
    // (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const notifData = response.notification.request.content.data;
      if (notifData.type === NOTIF_TYPES.FOLLOW
        || notifData.type === NOTIF_TYPES.YUM
        || notifData.type === NOTIF_TYPES.COMMENT) {
        navigation.navigate('InboxTab', {
          screen: 'Inbox', params: { shouldReload: true },
        });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const flatlistRef = useRef(null);
  useScrollToTop(flatlistRef);
  useEffect(() => {
    const blurredHeader = () => (
      <BlurView tint="light" intensity="100" style={StyleSheet.absoluteFill} />
    );
    const headerSearch = () => (
      <SearchButton
        color={colors.black}
        size={wp(5.7)}
        style={styles.searchBtn}
        pressed={() => navigation.navigate('SearchUsers')}
      />
    );
    navigation.setOptions({
      headerRight: headerSearch,
      headerTransparent: true,
      headerBackground: blurredHeader,
      animationEnabled: false,
    });
  }, []);

  useEffect(() => {
    const headerLogo = () => (
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.6}
        onPress={() => {
          if (flatlistRef.current && posts.length > 0) {
            flatlistRef.current.scrollToIndex({ index: 0, animated: true });
          }
        }}
      >
        <Logo />
      </TouchableOpacity>
    );
    navigation.setOptions({
      headerTitle: headerLogo,
    });
  }, [posts]);

  useEffect(() => {
    (async () => {
      let coords;
      // Get user location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Permission to access location was denied');
        alert('Permission to access location was denied. Please enable location services.');
        coords = DEFAULT_COORDINATES;
      } else {
        try {
          ({ coords } = await Location.getLastKnownPositionAsync({}));
        } catch {
          ({ coords } = await Location.getCurrentPositionAsync({}));
        }
      }
      dispatch({
        type: 'SET_LOCATION',
        payload: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
      });
    })();
  }, []);

  const currNextToken = useRef(null);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      setRefreshing(true);
      const dateOneWeekAgo = new Date(new Date().setDate(new Date().getDate() - NUM_DAYS_TO_FETCH));
      const oneWeekAgo = dateOneWeekAgo.toISOString();

      const { promise, getValue, errorMsg } = getFollowingPostsDetailsQuery(
        { PK: state.user.PK, timestamp: oneWeekAgo, limit: NUM_POSTS_TO_FETCH },
      );
      const { currPosts, nextToken } = await fulfillPromise(promise, getValue, errorMsg);
      if (mounted.current) {
        if (currPosts) {
          currNextToken.current = nextToken;
          setPosts(currPosts);
        } else {
          setPosts([]);
        }
        setRefreshing(false);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, [state.user.PK, state.user.uid, numRefresh.current, state.reloadMapTrigger]);

  const [moreLoading, setMoreLoading] = useState(false);
  // Get more posts
  const getMorePosts = async () => {
    if (!currNextToken.current || currNextToken.current === ALL_POSTS_FETCHED) return;
    mounted.current = true;
    setMoreLoading(true);
    const dateOneWeekAgo = new Date(new Date().setDate(new Date().getDate() - NUM_DAYS_TO_FETCH));
    const oneWeekAgo = dateOneWeekAgo.toISOString();

    const { promise, getValue, errorMsg } = getFollowingPostsDetailsQuery(
      {
        PK: state.user.PK,
        timestamp: oneWeekAgo,
        limit: NUM_POSTS_TO_FETCH,
        nextToken: currNextToken.current,
      },
    );
    const { currPosts, nextToken } = await fulfillPromise(promise, getValue, errorMsg);
    if (mounted.current) {
      currNextToken.current = nextToken || ALL_POSTS_FETCHED;
      setPosts([...posts, ...currPosts]);
      setMoreLoading(false);
    }
  };

  const [showYummedUsers, setShowYummedUsers] = useState(false);
  const yummedUsersRef = useRef([]);
  const showYummedUsersModal = ({ users }) => {
    yummedUsersRef.current = users.map((item) => ({
      onPress: () => fetchUser({ fetchUID: item.uid }),
      label: item.name,
      icon: <ProfilePic
        extUrl={item.picture}
        uid={item.uid}
        size={wp(8)}
      />,
    }));
    setShowYummedUsers(true);
  };

  const fetchUser = async ({ fetchUID }) => {
    const currUser = await fetchCurrentUserUID({ fetchUID, myUID });
    navigation.push(
      'ProfileStack',
      { screen: 'Profile', params: { user: currUser } },
    );
  };

  const openPlace = async ({ placeId }) => {
    const { promise, getValue, errorMsg } = getPlaceDetailsQuery({ placeId });
    const place = await fulfillPromise(promise, getValue, errorMsg);
    const placeName = place ? place.name : '';
    navigation.push('PlaceDetail', { place, placeId, placeName });
  };

  const reportPost = async () => {
    reportPressedRef.current = true;
  };

  const shouldOpenReportModal = () => {
    if (reportPressedRef.current) {
      setReportPressed(true);
      reportPressedRef.current = false;
    }
  };

  const notSavedMoreItem = {
    onPress: () => { },
    icon: <Save size={wp(7.2)} color="rgba(176, 187, 199, 0.6)" />,
    label: 'Save Post',
  };

  const isSavedMoreItem = {
    icon: <Save size={wp(7.2)} color={colors.accent} />,
    label: 'Unsave Post',
  };

  const moreItemsMe = [
    notSavedMoreItem,
    {
      onPress: () => deletePostConfirmation({
        posterUID: currPost.current.placeUserInfo.uid,
        timestamp: currPost.current.timestamp,
        picture: currPost.current.picture,
        placeId: currPost.current.placeId,
        rating: currPost.current.rating,
        dispatch,
        setLoading,
        myPK,
        myUID,
        onComplete: () => {
          numRefresh.current += 1;
          setRefreshing(true);
        },
      }),
      icon: <X size={wp(7.2)} color="red" />,
      label: 'Delete Post',
    },
  ];

  const moreItemsOther = [
    notSavedMoreItem,
    {
      onPress: reportPost,
      icon: <X size={wp(7.2)} color={colors.black} />,
      label: 'Report Post',
    },
  ];

  const onMorePressed = (item) => {
    currPost.current = item;
    const isMe = item.placeUserInfo.uid === myUID;
    moreItems.current = isMe ? moreItemsMe : moreItemsOther;
    const currIsSaved = savedPosts.has(GET_POST_ID({
      uid: item.placeUserInfo.uid, timestamp: item.timestamp,
    }));
    if (currIsSaved) moreItems.current[0] = isSavedMoreItem;
    const saveParams = {
      isSaved: currIsSaved,
      dispatch,
      post: item,
      place: {
        geo: item.geo,
        placeInfo: { categories: item.categories, imgUrl: item.imgUrl },
      },
      myUID,
    };
    moreItems.current[0].onPress = () => savePost(saveParams);
    setMorePressed(true);
  };

  const [showComments, setShowComments] = useState(false);
  const commentDetailsRef = useRef({
    uid: null, expoPushToken: null, timestamp: null, numComments: 0,
  });
  const currentComment = useRef({ uid: null, timestamp: null, comment: '' });
  const openComments = ({
    uid, expoPushToken, timestamp, numComments, placeId, imgUrl,
  }) => {
    // clear saved unposted comment if different post
    if (currentComment.current.uid !== uid || currentComment.current.timestamp !== timestamp) {
      currentComment.current = { uid: null, timestamp: null, comment: '' };
    }
    // set comment fetch details
    commentDetailsRef.current = {
      uid, expoPushToken, timestamp, numComments, placeId, imgUrl,
    };
    setShowComments(true);
  };

  const listFooterComponent = () => {
    if (moreLoading) return (<CenterSpinner style={{ marginBottom: wp(4) }} />);
    if (currNextToken.current === ALL_POSTS_FETCHED) {
      return (
        <Text style={styles.noMorePostsText}>You're all caught up for the week! :)</Text>
      );
    }
    return null;
  };

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.rootContainer,
        { marginTop: insets.top },
        isPad && { paddingTop: wpFull(3) },
        loading && { opacity: 0.6, backgroundColor: colors.gray },
      ]}
      pointerEvents={loading ? 'none' : 'auto'}
      edges={['top']}
    >
      {loading
        && (
          <View style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
          >
            <CenterSpinner color={colors.black} />
          </View>
        )}
      {posts === null
        && (
          <BallIndicator
            style={styles.ballIndicator}
            color={colors.tertiary}
          />
        )}
      <View style={styles.container}>
        <MoreView
          items={moreItems.current}
          morePressed={morePressed}
          setMorePressed={setMorePressed}
          onModalHide={shouldOpenReportModal}
        />
        <MoreView
          items={yummedUsersRef.current}
          morePressed={showYummedUsers}
          setMorePressed={setShowYummedUsers}
          labelSize={sizes.b1}
        />
        <ReportModal
          reportPressed={reportPressed}
          setReportPressed={setReportPressed}
          sender={{ senderUID: myUID, senderName: myName }}
          post={currPost.current ? {
            picture: currPost.current.picture,
            userName: currPost.current.placeUserInfo.name,
            userUID: currPost.current.placeUserInfo.uid,
            timestamp: currPost.current.timestamp,
            placeId: currPost.current.placeId,
          } : null}
          type="user post"
        />
        <CommentsModal
          visible={showComments}
          setVisible={setShowComments}
          numComments={commentDetailsRef.current.numComments}
          timestamp={commentDetailsRef.current.timestamp}
          uid={commentDetailsRef.current.uid}
          expoPushToken={commentDetailsRef.current.expoPushToken}
          placeId={commentDetailsRef.current.placeId}
          imgUrl={commentDetailsRef.current.imgUrl}
          navigation={navigation}
          dispatch={dispatch}
          currentComment={currentComment}
          myUID={myUID}
          myName={myName}
          myPicture={myPicture}
          myExpoPushToken={myExpoPushToken}
        />
        <FlatList
          data={posts}
          refreshing={refreshing}
          ref={flatlistRef}
          renderItem={({ item }) => (
            <PostItem
              item={item}
              fetchUser={fetchUser}
              onMorePressed={onMorePressed}
              showYummedUsersModal={showYummedUsersModal}
              openComments={openComments}
              me={state.user}
              savedPosts={savedPosts}
              openPlace={openPlace}
              refresh={numRefresh.current}
            />
          )}
          keyExtractor={(item) => item.SK}
          onRefresh={() => {
            numRefresh.current += 1;
            setRefreshing(true);
          }}
          initialScrollIndex={0}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: wpFull(100) }}
          onEndReached={getMorePosts}
          ListFooterComponent={listFooterComponent}
        />
      </View>
      {posts !== null && posts.length === 0
        && (
          <View style={styles.noPostsContainer}>
            <Text style={styles.noPostsText}>
              Follow people to see
              {'\n'}
              more posts!
            </Text>
          </View>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  noMorePostsText: {
    fontFamily: 'Book',
    fontSize: sizes.b1,
    color: colors.tertiary,
    textAlign: 'center',
    marginTop: wp(5),
    marginBottom: wp(12),
  },
  ballIndicator: {
    alignSelf: 'center',
    position: 'absolute',
    top: '40%',
    zIndex: 1,
  },
  noPostsContainer: {
    position: 'absolute',
  },
  noPostsText: {
    fontFamily: 'Book',
    fontSize: sizes.h3,
    color: colors.black,
    textAlign: 'center',
    marginBottom: wp(10),
  },
  rootContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  header: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: sizes.margin,
    paddingBottom: 9,
  },
  scrollView: {
    backgroundColor: '#131617',
  },
});

export default Home;
