import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, View, FlatList, TouchableOpacity, Text,
} from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
// import { BlurView } from 'expo-blur';
import { useScrollToTop } from '@react-navigation/native';
import { BallIndicator } from 'react-native-indicators';
import {
  getFollowingPostsDetailsQuery,
  getPlaceDetailsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import deletePostConfirmation from '../../api/functions/DeletePost';
import { fetchCurrentUserUID } from '../../api/functions/FetchUserProfile';
import PostItem from '../components/PostItem';
import ProfilePic from '../components/ProfilePic';
import MoreView from '../components/MoreView';
import ReportModal from '../components/ReportModal';
import X from '../components/util/icons/X';
import Logo from '../components/util/icons/Logo';
import SearchButton from '../components/util/SearchButton';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import { DEFAULT_COORDINATES } from '../../constants/constants';
import { colors, sizes, wp } from '../../constants/theme';

const NUM_POSTS_TO_FETCH = 8;
const NUM_DAYS_TO_FETCH = 7;
const ALL_POSTS_FETCHED = 'allPostsFetched';

const Home = ({ navigation }) => {
  const [state, dispatch] = useContext(Context);
  const { user: { uid: myUID, PK: myPK, name: myName }, savedPosts } = state;

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

  const flatlistRef = useRef(null);
  useScrollToTop(flatlistRef);
  useEffect(() => {
    const headerLogo = () => (
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.6}
        onPress={() => {
          if (flatlistRef.current) {
            flatlistRef.current.scrollToIndex({ index: 0, animated: true });
          }
        }}
      >
        <Logo />
      </TouchableOpacity>
    );
    // const blurredHeader = () => (
    //   <BlurView tint="light" intensity="100" style={StyleSheet.absoluteFill} />
    // );
    const headerSearch = () => (
      <SearchButton
        color={colors.black}
        size={wp(5.7)}
        style={styles.searchBtn}
        pressed={() => navigation.navigate('SearchUsers')}
      />
    );
    navigation.setOptions({
      headerTitle: headerLogo,
      headerRight: headerSearch,
      // headerTransparent: true,
      // headerBackground: blurredHeader,
      // animationEnabled: false,
    });
  }, []);

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

  const moreItemsMe = [
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
    setMorePressed(true);
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

  return (
    <View
      style={[styles.rootContainer, loading && { opacity: 0.6, backgroundColor: colors.gray }]}
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
              me={state.user}
              dispatch={dispatch}
              savedPosts={savedPosts}
              openPlace={openPlace}
            />
          )}
          keyExtractor={(item) => item.SK}
          onRefresh={() => {
            numRefresh.current += 1;
            setRefreshing(true);
          }}
          initialScrollIndex={0}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ width: wp(100) }}
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
    </View>
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
  searchBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: sizes.margin,
  },
  scrollView: {
    backgroundColor: '#131617',
  },
});

export default Home;
