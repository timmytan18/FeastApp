import React, {
  useEffect, useContext, useState, useRef, useCallback,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Image,
  Animated, PanResponder, ScrollView, StatusBar, Easing, Alert,
} from 'react-native';
import {
  API, Storage, graphqlOperation,
} from 'aws-amplify';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import TwoButtonAlert from './util/TwoButtonAlert';
import PlaceDetailView from './PlaceDetailView';
import MoreView from './MoreView';
import ReportModal from './ReportModal';
import {
  getFollowersQuery,
  getAllSavedPostItemsQuery,
  getPostYumsQuery,
  getPostNumCommentsQuery,
  getPostCommentsNoDetailsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import { deleteFeastItem, batchDeleteFollowingPosts, incrementFeastItem } from '../../api/graphql/mutations';
import getElapsedTime from '../../api/functions/GetElapsedTime';
import { fetchCurrentUserUID } from '../../api/functions/FetchUserProfile';
import ProfilePic from './ProfilePic';
import MapMarker from './util/icons/MapMarker';
import YumButton from './util/YumButton';
import CommentsModal from './CommentsModal';
import CommentButton from './util/CommentButton';
import SwipeUpArrow from './util/icons/SwipeUpArrow';
import BackArrow from './util/icons/BackArrow';
import ThreeDots from './util/icons/ThreeDots';
import StarsRating from './util/StarsRating';
import Save from './util/icons/Save';
import X from './util/icons/X';
import CenterSpinner from './util/CenterSpinner';
import savePost from '../../api/functions/SavePost';
import { mergeLocalData, localDataKeys } from '../../api/functions/LocalStorage';
import { GET_POST_ID, POST_IMAGE_ASPECT } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, shadows, gradients, sizes, wp, isPad, wpFull,
} from '../../constants/theme';

const NUM_COLLAPSED_LINES = 2;
const storyDuration = 6000;

const StoryModal = ({ navigation, route }) => {
  const {
    stories,
    places,
    firstImg,
    openYums,
    openComments: initialOpenComments,
    postOnly,
  } = route.params;

  const [
    {
      user: {
        uid: myUID, PK: myPK, name: myName, picture: myPicture, expoPushToken: myExpoPushToken,
      }, savedPosts, deviceHeight,
    },
    dispatch,
  ] = useContext(Context);

  const deviceAspect = deviceHeight / wpFull(100);

  const index = useRef(0);
  const [indexState, setIndexState] = useState(0);
  const numStories = useRef(stories.length);
  const place = useRef(null);
  const [image, setImage] = useState(null);
  const seenImages = useRef([firstImg]);

  const seenStories = useRef({});

  // animation for bar
  const [progressAnim] = useState(new Animated.Value(0));
  const progressTranslate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5%', '100%'],
  });

  // options
  const barAnimOptions = {
    toValue: 1,
    easing: Easing.linear,
    duration: storyDuration,
    useNativeDriver: false,
  };

  const startBarAnimation = () => {
    if (postOnly) return;
    // reset to beginning
    progressAnim.setValue(0);

    // start animation
    Animated.timing(progressAnim, barAnimOptions).start(({ finished }) => {
      if (finished) goToNextStory();
    });
  };

  const stopBarAnimation = () => {
    Animated.timing(progressAnim).stop();
  };

  // restart animation when current story index changes
  // fetch and preload next image
  // save seen stories to local storage
  const date = new Date();
  const timeLocal = date.toISOString();
  useEffect(() => {
    stopBarAnimation();
    startBarAnimation();
    (async () => {
      let img = null;
      if (stories[index.current].picture) {
        img = seenImages.current[index.current]
          ? seenImages.current[index.current] : await Storage.get(
            stories[index.current].picture,
            { identityId: stories[index.current].placeUserInfo.identityId },
          );
      }
      setImage(img);
      if (index.current + 1 < numStories.current
        && index.current + 1 >= seenImages.current.length) {
        let nextImg = null;
        if (stories[index.current + 1].picture) {
          nextImg = await Storage.get(
            stories[index.current + 1].picture,
            { identityId: stories[index.current + 1].placeUserInfo.identityId },
          );
        }
        seenImages.current.push(nextImg);
        if (nextImg) {
          try {
            await Image.prefetch(nextImg);
          } catch (e) { console.warn(e); }
        }
      }
      seenStories.current[stories[index.current].SK] = timeLocal;

      if (initialOpenComments) {
        (async () => {
          const { promise, getValue, errorMsg } = getPostNumCommentsQuery({ uid, timestamp });
          const numComments = await fulfillPromise(promise, getValue, errorMsg);
          openComments({ numComments });
        })();
      }
    })();
  }, [indexState]);

  // restart animation when screen in focus
  useFocusEffect(
    useCallback(() => {
      // focus - start anim when top is focused
      if (enablePanResponder.current) {
        startBarAnimation();
      }

      // blur
      return () => {
        stopBarAnimation();
      };
    }, []),
  );

  // story progression handlers
  const goToNextStory = () => {
    if (index.current === numStories.current - 1) closeModal();
    else {
      setNumLinesExpanded(null);
      setIndexState(++index.current);
    }
  };

  const goToPrevStory = () => {
    if (index.current === 0) startBarAnimation();
    else {
      setNumLinesExpanded(null);
      setIndexState(--index.current);
    }
  };

  const enablePanResponder = useRef(true);
  const [enablePanResponderState, setEnablePanResponderState] = useState(true);
  const translateXVal = useRef(new Animated.Value(0)).current;
  const translateYVal = useRef(new Animated.Value(0)).current;
  // const translateXAnim = ({ value }) => {
  //   Animated.spring(translateXVal, {
  //     toValue: value,
  //     bounciness: 4,
  //     useNativeDriver: true,
  //   }).start();
  // };
  const translateYAnim = ({ value }) => {
    Animated.spring(translateYVal, {
      toValue: value,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  // const panToLeft = () => {
  //   translateXAnim({ value: -wp(100) });
  //   // setFirstCardCurrent(false);
  //   // firstCardCurrentRef.current = false;
  // };
  // const panToRight = () => {
  //   translateXAnim({ value: wp(100) });
  // };

  // Calculate scroll thresholds to animate between top/bottom or exit modal
  const topEnabled = useRef(true);
  const lastContentOffsetY = useRef(0);
  const paddingTop = 50;
  const isCloseToTopBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    let pos = null;
    if (topEnabled.current
      && contentOffset.y <= -paddingTop
      && lastContentOffsetY.current > contentOffset.y) {
      pos = 'TOP';
    }
    if (contentOffset.y <= paddingTop) {
      topEnabled.current = true;
    } else {
      topEnabled.current = false;
    }
    lastContentOffsetY.current = contentOffset.y;
    return pos;
  };
  const panToTop = () => {
    enablePanResponder.current = true;
    setEnablePanResponderState(true);
    translateYAnim({ value: 0 });
    startBarAnimation();
  };
  const panToBottom = () => {
    if (postOnly) {
      navigation.goBack();
    }
    enablePanResponder.current = false;
    setEnablePanResponderState(false);
    translateYAnim({ value: -deviceHeight });
    stopBarAnimation();
  };
  const closeModal = async () => {
    // save seen stories to local storage
    seenStories.current[stories[index.current].SK] = timeLocal;
    await mergeLocalData(localDataKeys.SEEN_STORIES, seenStories.current);
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const movementType = useRef('');
  // const swipeDirection = useRef(''); // horizontal or vertical
  const continueBarAnimation = () => {
    if (postOnly) return;
    // const currAnimVal = parseInt(JSON.stringify(progressAnim), 10);
    const currAnimVal = progressAnim._value; // could be better way to get current animation
    const duration = storyDuration - currAnimVal * storyDuration;
    const options = {
      ...barAnimOptions,
      duration,
    };
    Animated.timing(progressAnim, options).start(({ finished }) => {
      if (finished) goToNextStory();
    });
  };
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enablePanResponder.current,
      onPanResponderGrant: () => {
        stopBarAnimation();
        setTimeout(() => {
          if (movementType.current !== 'swipe') movementType.current = 'hold';
        }, 300);
      },
      onPanResponderStart: () => {
        movementType.current = 'tap';
        // swipeDirection.current = '';
      },
      onPanResponderMove: (_, gestureState) => {
        movementType.current = 'swipe';
        // if (swipeDirection.current === 'horizontal') {
        //   translateXVal.setValue(gestureState.dx / 2);
        // } else if (swipeDirection.current === 'vertical') {
        //   translateYVal.setValue(gestureState.dy / 3);
        // } else if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
        //   swipeDirection.current = 'horizontal';
        //   translateXVal.setValue(gestureState.dx);
        // } else {
        //   swipeDirection.current = 'vertical';
        if (!postOnly || (postOnly && gestureState.dy > 0)) {
          translateYVal.setValue(gestureState.dy / 3);
        }
        // }
      },
      onPanResponderRelease: (_, gestureState) => {
        // three different types of movements: tap, hold, swipe
        switch (movementType.current) {
          case 'tap':
            if (gestureState.x0 > 250) {
              // stop current animation in place
              stopBarAnimation();

              // options
              const options = { ...barAnimOptions, duration: 75 };

              // start animation, always jump to next story
              Animated.timing(progressAnim, options).start(goToNextStory);
            } else if (gestureState.x0 < 150) {
              goToPrevStory();
            } else {
              // open up larger image ?
            }
            break;
          case 'hold':
            continueBarAnimation();
            break;
          case 'swipe':
            // horizontal swipe
            // if (swipeDirection.current === 'horizontal') {
            //   if (gestureState.dx < -100) {
            //     // swipe left
            //     panToLeft();
            //   } else if (gestureState.dx > 100) {
            //     // swipe right
            //     panToRight();
            //   } else {
            //     translateXAnim({ value: 0 });
            //     continueBarAnimation();
            //   }
            //   // vertical swipe
            // } else if (swipeDirection.current === 'vertical') {
            if (gestureState.dy < -100) {
              // swipe up
              panToBottom();
            } else if (gestureState.dy / 2 > 50) {
              // swipe down
              closeModal();
            } else {
              translateYAnim({ value: 0 });
              continueBarAnimation();
            }
            // }
            break;
          default:
            break;
        }
      },
    }),
  ).current;

  const scrollRef = useRef();

  const moreItems = useRef([]);

  let uid; let placeId; let name; let picture;
  let dish; let rating; let review; let timestamp;
  let userName; let userPic; let expoPushToken;
  if (stories && stories.length && index.current < stories.length) {
    ({
      placeUserInfo: {
        uid, name: userName, picture: userPic, expoPushToken,
      },
      placeId, name, picture, dish, rating, review, timestamp,
    } = stories[index.current]);
  }

  place.current = places[placeId];
  const elapsedTime = getElapsedTime(timestamp);
  const savedPostId = GET_POST_ID({ uid, timestamp });
  const isSaved = savedPosts.has(savedPostId);

  const [loading, setLoading] = useState(false);

  const [reportPressed, setReportPressed] = useState(false);
  const reportPressedRef = useRef(false);

  const isMe = uid === myUID;
  const [morePressed, setMorePressed] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const commentDetailsRef = useRef({ uid: null, timestamp: null, numComments: 0 });
  const currentComment = useRef({ uid: null, timestamp: null, comment: '' });
  const openComments = ({ numComments }) => {
    stopBarAnimation();
    // clear saved unposted comment if different post
    if (currentComment.current.uid !== uid || currentComment.current.timestamp !== timestamp) {
      currentComment.current = { uid: null, timestamp: null, comment: '' };
    }
    // set comment fetch details
    commentDetailsRef.current = {
      uid, timestamp, numComments, placeId, expoPushToken, imgUrl: picture,
    };
    setShowComments(true);
  };

  const deletePostConfirmation = () => {
    TwoButtonAlert({
      title: 'Delete Post',
      yesButton: 'Confirm',
      pressed: async () => {
        await deletePost({ currTimestamp: timestamp, s3Key: picture });
        closeModal();
      },
      onCancel: () => {
        continueBarAnimation();
      },
    });
  };

  const deletePost = async ({ currTimestamp, s3Key }) => {
    setLoading(true);
    enablePanResponder.current = false;

    // Delete post from user's profile
    const input = { PK: myPK, SK: `#PLACE#${currTimestamp}` };
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

    // Update place's average rating
    const ratingSK = '#RATING';
    try {
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        {
          input: {
            PK: `PLACE#${placeId}`, SK: ratingSK, count: -1, sum: -rating,
          },
        },
      ));
    } catch (err) {
      console.warn('Error updating place rating:', err);
      Alert.alert(
        'Error',
        'Could not delete post',
        [{ text: 'OK' }],
        { cancelable: false },
      );
      return;
    }

    // Remove user's post from followers' feeds in batches
    const { promise, getValue, errorMsg } = getFollowersQuery({ PK: myPK, onlyReturnUIDs: true });
    const followers = await fulfillPromise(promise, getValue, errorMsg);
    const postInUserFeeds = [{ PK: myPK, SK: `#FOLLOWINGPOST#${currTimestamp}#${myUID}` }]; // remove from own feed
    followers.forEach(({ follower: { PK: followerPK } }) => {
      postInUserFeeds.push({
        PK: followerPK,
        SK: `#FOLLOWINGPOST#${currTimestamp}#${myUID}`,
      });
    });

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

    // Remove post from users' saved posts
    const {
      promise: savedPostsPromise, getValue: getSavedPostsValue, errorMsg: savedPostsErrorMsg,
    } = getAllSavedPostItemsQuery({
      uid: myUID, timestamp: currTimestamp,
    });
    const savedPostsToDelete = await fulfillPromise(
      savedPostsPromise,
      getSavedPostsValue,
      savedPostsErrorMsg,
    );
    for (i = 0, j = savedPostsToDelete.length; i < j; i += BATCH_NUM) {
      const batch = savedPostsToDelete.slice(i, i + BATCH_NUM);
      try {
        await API.graphql(graphqlOperation(
          batchDeleteFollowingPosts,
          { input: { posts: batch } },
        ));
      } catch (err) {
        console.warn('Error removing all saved post items for post', err);
      }
    }

    // Delete comment items for post
    const {
      promise: commentPromise, getValue: getCommentValue, errorMsg: commentErrorMsg,
    } = getPostCommentsNoDetailsQuery({
      uid: myUID, timestamp: currTimestamp,
    });
    const commentItemsToDelete = await fulfillPromise(commentPromise, getCommentValue, commentErrorMsg);
    for (i = 0, j = commentItemsToDelete.length; i < j; i += BATCH_NUM) {
      const batch = commentItemsToDelete.slice(i, i + BATCH_NUM);
      try {
        await API.graphql(graphqlOperation(
          batchDeleteFollowingPosts,
          { input: { posts: batch } },
        ));
      } catch (err) {
        console.warn('Error deleting all comment items for post', err);
      }
    }

    // Delete num comment count for post
    const numCommentsInput = { PK: `POST#${currTimestamp}#${myUID}`, SK: '#NUMCOMMENTS' };
    try {
      await API.graphql(graphqlOperation(
        deleteFeastItem,
        { input: numCommentsInput },
      ));
    } catch (err) {
      console.warn('Error deleting post comment count:', err);
    }

    // Delete yum items for post
    const { promise: yumPromise, getValue: getYumValue, errorMsg: yumErrorMsg } = getPostYumsQuery({
      uid: myUID, timestamp: currTimestamp, noDetails: true,
    });
    const yumItemsToDelete = await fulfillPromise(yumPromise, getYumValue, yumErrorMsg);
    for (i = 0, j = yumItemsToDelete.length; i < j; i += BATCH_NUM) {
      const batch = yumItemsToDelete.slice(i, i + BATCH_NUM);
      try {
        await API.graphql(graphqlOperation(
          batchDeleteFollowingPosts,
          { input: { posts: batch } },
        ));
      } catch (err) {
        console.warn('Error deleting all yum post items for post', err);
      }
    }

    // Update app state to trigger map & profile re-render
    dispatch({ type: 'SET_RELOAD_MAP' });
    dispatch({ type: 'SET_RELOAD_PROFILE' });
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
      onPress: deletePostConfirmation,
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

  const onMorePressed = () => {
    stopBarAnimation();
    const item = stories[index.current];
    moreItems.current = isMe ? moreItemsMe : moreItemsOther;
    if (isSaved) moreItems.current[0] = isSavedMoreItem;
    const saveParams = {
      isSaved,
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

  const fetchUser = async ({ fetchUID }) => {
    const currUser = await fetchCurrentUserUID({ fetchUID, myUID });
    navigation.push(
      'ProfileStack',
      { screen: 'Profile', params: { user: currUser } },
    );
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

  const maxCollapsedLines = stories[index.current].picture ? NUM_COLLAPSED_LINES : null;
  const [numLines, setNumLines] = useState(null);
  const [numLinesExpanded, setNumLinesExpanded] = useState(null);
  const lineHeight = useRef(null);

  const onTextLayout = useCallback((e) => {
    if (numLinesExpanded == null) {
      setNumLinesExpanded(e.nativeEvent.lines.length);
      lineHeight.current = e.nativeEvent.lines[0] ? e.nativeEvent.lines[0].height : 0;
      setNumLines(maxCollapsedLines);
    }
  }, []);

  const isExpanded = (numLines === numLinesExpanded && numLinesExpanded > maxCollapsedLines);

  return (
    <View style={{ flex: 1 }}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [
              { translateX: translateXVal },
              { translateY: translateYVal },
            ],
            opacity: loading ? 0.6 : 1,
          },
        ]}
      >
        <StatusBar animated barStyle="light-content" />
        <MoreView
          items={moreItems.current}
          morePressed={morePressed}
          setMorePressed={setMorePressed}
          onDismiss={() => continueBarAnimation()}
          onModalHide={shouldOpenReportModal}
        />
        <MoreView
          items={yummedUsersRef.current}
          morePressed={showYummedUsers}
          setMorePressed={setShowYummedUsers}
          onDismiss={() => continueBarAnimation()}
          labelSize={sizes.b1}
        />
        <ReportModal
          reportPressed={reportPressed}
          setReportPressed={setReportPressed}
          onDismiss={() => continueBarAnimation()}
          sender={{ senderUID: myUID, senderName: myName }}
          post={{
            picture,
            userName,
            userUID: uid,
            timestamp,
            placeId,
          }}
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
          startBarAnimation={startBarAnimation}
          myExpoPushToken={myExpoPushToken}
        />
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
              <CenterSpinner />
            </View>
          )}
        <View style={styles.cardContainer} {...panResponder.panHandlers}>
          <View style={styles.progressContainer}>
            {!postOnly && stories
              && (stories.map((story, i) => (
                <View
                  key={story.SK}
                  style={[styles.progressBar, { marginHorizontal: 2, flex: 1 }]}
                >
                  {i < indexState && (
                    <View style={[
                      styles.progressBar,
                      { backgroundColor: colors.gray, flex: 1 },
                    ]}
                    />
                  )}
                  {i === indexState
                    && (
                      <Animated.View
                        style={[
                          styles.progressBar,
                          { backgroundColor: colors.gray, width: progressTranslate },
                        ]}
                      />
                    )}
                </View>
              )))}
          </View>
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row', flex: 0.9 }}>
              <TouchableOpacity
                onPress={() => fetchUser({ fetchUID: uid })}
                activeOpacity={0.8}
                style={styles.profilePic}
              >
                <ProfilePic
                  uid={uid}
                  extUrl={userPic}
                  size={wp(12.5)}
                  style={{ flex: 1 }}
                />
              </TouchableOpacity>
              <View style={styles.headerTextContainer}>
                <View style={styles.nameElapsedTimeContainer}>
                  <TouchableOpacity
                    onPress={() => fetchUser({ fetchUID: uid })}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.nameText}>{userName}</Text>
                  </TouchableOpacity>
                  <Text style={styles.elapsedTimeText}>{elapsedTime}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => panToBottom()}
                >
                  <MaskedView
                    maskElement={(
                      <View style={styles.locationContainer}>
                        <MapMarker size={wp(4.8)} color={colors.accent} />
                        <Text style={styles.locationText} numberOfLines={1}>{name}</Text>
                      </View>
                    )}
                  >
                    <LinearGradient
                      colors={gradients.purple.colors}
                      start={[-0.2, 1]}
                      end={[1.2, 0]}
                      style={{ width: name.length * wp(5), height: sizes.h4 + wp(1.5) }}
                    />
                  </MaskedView>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={onMorePressed}
              style={styles.moreContainer}
            >
              <ThreeDots rotated size={wp(5)} />
            </TouchableOpacity>
          </View>
          <View style={styles.reviewTitleStarsContainer}>
            <Text style={styles.reviewTitleText}>
              Review:
            </Text>
            {rating !== null && (
              <StarsRating
                rating={rating}
                spacing={wp(0.6)}
                size={wp(5)}
                containerStyle={styles.starsContainer}
              />
            )}
          </View>
          <View style={[isExpanded && {
            justifyContent: 'space-between', flex: 1, paddingBottom: wp(5),
          }]}
          >
            {numLinesExpanded == null && (
              <View pointerEvents="box-none">
                <Text
                  style={[styles.reviewText, styles.reviewTextHidden]}
                  onTextLayout={onTextLayout}
                >
                  {review}
                </Text>
              </View>
            )}
            <Text
              style={[styles.reviewText, !isExpanded && { paddingBottom: wp(4) }]}
              numberOfLines={numLinesExpanded == null ? maxCollapsedLines : numLines}
              onPress={() => {
                setNumLines(
                  isExpanded ? maxCollapsedLines : numLinesExpanded,
                );
              }}
            >
              {review}
            </Text>
            {image ? (
              <View>
                <Image
                  style={[
                    styles.image,
                    (isPad || (deviceAspect < 1.9)) && { aspectRatio: 1.05 },
                    isExpanded && { aspectRatio: 0.9 },
                  ]}
                  source={{ uri: image }}
                />
                <View style={styles.emojiContainer} />
                {dish && <Text style={styles.menuItemText}>{dish}</Text>}
              </View>
            ) : (
              <View
                style={[styles.image, isPad && { aspectRatio: 1.05 }, styles.noImage]}
              >
                <Text style={styles.noImageText}>No image</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.middleContainer}>
          <View style={styles.middleButtonsContainer}>
            <View style={[styles.sideButtonsContainer, { alignItems: 'flex-start' }]}>
              <CommentButton
                openComments={openComments}
                uid={uid}
                expoPushToken={expoPushToken}
                timestamp={timestamp}
                placeId={placeId}
                imgUrl={picture}
                dispatch={dispatch}
                size={wp(11)}
                stopBarAnimation={stopBarAnimation}
              />
            </View>
            {!postOnly && (
              <View style={styles.viewPlaceBtnContainer}>
                <SwipeUpArrow />
                <LinearGradient
                  colors={gradients.orange.colors}
                  start={gradients.orange.start}
                  end={gradients.orange.end}
                  style={styles.viewPlaceBtnGradient}
                >
                  <TouchableOpacity
                    style={styles.viewPlaceBtn}
                    onPress={() => panToBottom()}
                    activeOpacity={1}
                  >
                    <MaskedView
                      maskElement={(
                        <View style={styles.viewPlaceBtnTextContainer}>
                          <Text style={styles.viewPlaceBtnText}>View Place</Text>
                        </View>
                      )}
                    >
                      <LinearGradient
                        colors={gradients.orange.colors}
                        start={gradients.orange.start}
                        end={gradients.orange.end}
                        style={{ width: wp(23), height: '100%' }}
                      />
                    </MaskedView>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
            {postOnly && (
              <View style={[styles.viewPlaceBtnContainer, { marginTop: wp(2.5) }]}>
                <TouchableOpacity
                  style={[styles.viewPlaceBtn, { backgroundColor: 'transparent' }]}
                  onPress={navigation.goBack}
                  activeOpacity={1}
                >
                  <Text style={[styles.viewPlaceBtnText, { color: '#fff', fontSize: sizes.b3 }]}>Close</Text>
                </TouchableOpacity>
                <View style={styles.downArrowPostOnly}>
                  <SwipeUpArrow />
                </View>
              </View>
            )}
            <View style={[styles.sideButtonsContainer, { alignItems: 'flex-end' }]}>
              <YumButton
                size={wp(10)}
                uid={uid}
                placeId={placeId}
                timestamp={timestamp}
                expoPushToken={expoPushToken}
                myUID={myUID}
                myPK={myPK}
                myName={myName}
                myPicture={myPicture}
                myExpoPushToken={myExpoPushToken}
                picture={picture}
                showYummedUsersModal={showYummedUsersModal}
                stopBarAnimation={stopBarAnimation}
                openYums={openYums}
              />
            </View>
          </View>
        </View>
        <View style={[styles.bottomContainer, { height: deviceHeight, bottom: -deviceHeight }]}>
          <ScrollView
            style={styles.scrollView}
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={200}
            onScroll={({ nativeEvent }) => {
              const pos = isCloseToTopBottom(nativeEvent);
              if (pos === 'TOP') {
                panToTop();
              }
            }}
          >
            <PlaceDetailView
              place={place.current}
              placeName={name}
              placeId={placeId}
              navigation={navigation}
            />
          </ScrollView>
          <TouchableOpacity
            style={styles.downArrowContainer}
            onPress={() => {
              scrollRef.current?.scrollTo({
                y: 0,
                animated: true,
              });
              panToTop();
            }}
            activeOpacity={0.7}
          >
            <View pointerEvents="none">
              <BackArrow
                color={colors.gray4}
                size={wp(6)}
                style={styles.downArrow}
              />
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

const ratingIconSize = wp(12);

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#131617',
  },
  container: {
    flex: 1,
    backgroundColor: '#131617',
    opacity: 1,
  },
  cardContainer: {
    flex: 0.85,
    marginTop: wp(12),
    borderRadius: wp(5),
    backgroundColor: '#fff',
    paddingHorizontal: sizes.margin,
  },
  progressContainer: {
    height: wp(9),
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressBar: {
    height: wp(0.7),
    borderRadius: wp(0.35),
    flexDirection: 'row',
    backgroundColor: colors.gray2,
  },
  middleContainer: {
    flex: 0.15,
    paddingHorizontal: sizes.margin * 2,
  },
  middleButtonsContainer: {
    marginTop: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sideButtonsContainer: {
    flex: 0.2,
  },
  viewPlaceBtnContainer: {
    flex: 0.6,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  viewPlaceBtnGradient: {
    width: wp(21),
    height: wp(8),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(3),
    marginTop: wp(1.8),
  },
  viewPlaceBtn: {
    width: wp(20),
    height: wp(7),
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(2.5),
  },
  viewPlaceBtnTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  viewPlaceBtnText: {
    fontSize: sizes.b4,
    fontFamily: 'Medium',
    paddingBottom: 0.2,
  },
  downArrowPostOnly: {
    marginTop: wp(0.4),
    transform: [{ rotate: '180deg' }],
  },
  headerContainer: {
    height: wp(15.5),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  profilePic: {
    aspectRatio: 1,
    borderRadius: wp(15),
    alignSelf: 'center',
  },
  headerTextContainer: {
    justifyContent: 'space-between',
    marginTop: wp(1.3),
    marginBottom: wp(0.7),
  },
  nameElapsedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    color: colors.black,
    paddingLeft: wp(3),
  },
  elapsedTimeText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    color: colors.tertiary,
    opacity: 0.6,
    paddingLeft: wp(2),
    paddingTop: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    paddingLeft: wp(2.2),
    width: wp(60),
    alignItems: 'flex-start',
  },
  locationText: {
    fontFamily: 'Semi',
    fontSize: sizes.h4,
    lineHeight: wp(6),
    textAlignVertical: 'top',
    color: colors.accent,
    letterSpacing: 0.3,
    paddingLeft: wp(1.2),
  },
  moreContainer: {
    alignSelf: 'center',
    marginRight: wp(0.5),
    padding: wp(2),
  },
  image: {
    borderRadius: wp(2),
    width: '100%',
    aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
  },
  noImage: {
    backgroundColor: colors.gray2,
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1.2,
  },
  noImageText: {
    fontFamily: 'Book',
    fontSize: sizes.b3,
    color: colors.tertiary,
  },
  menuItemText: {
    position: 'absolute',
    left: wp(5),
    bottom: wp(5),
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: '#fff',
    width: wp(50),
  },
  reviewTitleStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(1),
    paddingLeft: 1,
  },
  reviewTitleText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    paddingRight: wp(2),
    alignSelf: 'flex-end',
  },
  starsContainer: {
    marginBottom: wp(1),
    zIndex: 1,
  },
  reviewText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    paddingHorizontal: 2,
    paddingTop: wp(0.4),
    paddingBottom: wp(1),
    alignSelf: 'center',
    textAlign: 'left',
    width: '100%',
  },
  reviewTextHidden: {
    opacity: 0,
    position: 'absolute',
    zIndex: -1,
  },
  ratingsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: wp(2),
    paddingLeft: wp(1),
    paddingRight: wp(2),
  },
  ratingContainer: {
    alignItems: 'center',
    flex: 0.25,
  },
  ratingIconContainer: {
    position: 'absolute',
    height: '100%',
    width: ratingIconSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: '#fff',
  },
  ratingLabelText: {
    fontFamily: 'Medium',
    fontSize: sizes.b4,
    color: colors.black,
    paddingTop: wp(1.5),
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
  },
  downArrowContainer: {
    position: 'absolute',
    right: wp(10),
    bottom: wp(17),
    width: wp(15),
    height: wp(15),
    borderRadius: wp(7.5),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tertiary,
    opacity: 0.9,
    ...shadows.even,
  },
  downArrow: {
    transform: [{ rotate: '90deg' }],
  },
});

export default StoryModal;
