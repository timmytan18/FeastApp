import React, {
  useEffect, useContext, useState, useRef, useCallback,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, ImageBackground,
  Animated, PanResponder, ScrollView, StatusBar, Easing, Alert,
} from 'react-native';
import {
  API, Storage, graphqlOperation,
} from 'aws-amplify';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import MaskedView from '@react-native-community/masked-view';
// import { AnimatedEmoji } from 'react-native-animated-emoji';
import TwoButtonAlert from './util/TwoButtonAlert';
import PlaceDetailView from './PlaceDetailView';
import MoreView from './MoreView';
import {
  getUserProfileQuery,
  getIsFollowingQuery,
  getFollowersQuery,
  getAllSavedPostItemsQuery,
  getPostYumsQuery,
} from '../../api/functions/queryFunctions';
import { deleteFeastItem, batchDeleteFollowingPosts } from '../../api/graphql/mutations';
import getElapsedTime from '../../api/functions/GetElapsedTime';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import ProfilePic from './ProfilePic';
import MapMarker from './util/icons/MapMarker';
import Rating from './util/icons/Rating';
import YumButton from './util/YumButton';
import SaveButton from './util/SaveButton';
import SwipeUpArrow from './util/icons/SwipeUpArrow';
import BackArrow from './util/icons/BackArrow';
import ThreeDots from './util/icons/ThreeDots';
import X from './util/icons/X';
import { GET_SAVED_POST_ID } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, shadows, gradients, sizes, wp,
} from '../../constants/theme';
import CenterSpinner from './util/CenterSpinner';

const ratingColor = (rating) =>
  // switch (rating) {
  //   case 4.5: case 4:
  //     return colors.secondary;
  //   case 3.5: case 3:
  //     return colors.tertiary;
  //   default:
  //     return colors.gray;
  // }
  colors.tertiary;
const NUM_COLLAPSED_LINES = 2;

const storyDuration = 6000;

const StoryModal = ({ navigation, route }) => {
  const {
    stories,
    places,
    deviceHeight,
  } = route.params;

  const [
    {
      user: {
        uid: myUID, PK: myPK, name: myName, picture: myPicture,
      }, savedPosts,
    },
    dispatch,
  ] = useContext(Context);

  const index = useRef(0);
  const [indexState, setIndexState] = useState(0);
  const numStories = useRef(stories.length);
  const place = useRef(null);

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
  useEffect(() => {
    stopBarAnimation();
    startBarAnimation();
  }, [indexState]);

  // restart animation when screen in focus
  useFocusEffect(
    useCallback(() => {
      // focus
      startBarAnimation();

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
  // const bottomEnabled = useRef(false);
  const lastContentOffsetY = useRef(0);
  // const paddingBottom = 90;
  const paddingTop = 50;
  const isCloseToTopBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
    let pos = null;
    if (topEnabled.current
      && contentOffset.y <= -paddingTop
      && lastContentOffsetY.current > contentOffset.y) {
      pos = 'TOP';
    }
    // else if (bottomEnabled.current
    //   && (layoutMeasurement.height + contentOffset.y
    //     >= contentSize.height + paddingBottom)
    //   && lastContentOffsetY.current < contentOffset.y) {
    //   pos = 'BOTTOM';
    // }
    // if (layoutMeasurement.height + contentOffset.y
    //   >= contentSize.height - paddingBottom) {
    //   bottomEnabled.current = true;
    // } else {
    //   bottomEnabled.current = false;
    // }
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
    enablePanResponder.current = false;
    setEnablePanResponderState(false);
    translateYAnim({ value: -deviceHeight });
    stopBarAnimation();
  };
  const closeModal = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const movementType = useRef('');
  // const swipeDirection = useRef(''); // horizontal or vertical
  const continueBarAnimation = () => {
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
        translateYVal.setValue(gestureState.dy / 3);
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
              console.log('large image');
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
            //     console.log('swipe left');
            //     panToLeft();
            //   } else if (gestureState.dx > 100) {
            //     // swipe right
            //     console.log('swipe right');
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

  let uid; let placeId; let name; let s3Photo; let picture;
  let dish; let rating; let review; let timestamp;
  let userName; let userPic;
  if (stories && stories.length && index.current < stories.length) {
    ({
      placeUserInfo: { uid, name: userName, picture: userPic },
      placeId, name, s3Photo, picture, dish, rating, review, timestamp,
    } = stories[index.current]);
  }
  place.current = places[placeId];
  const elapsedTime = getElapsedTime(timestamp);
  const savedPostId = GET_SAVED_POST_ID({ uid, timestamp });
  const isSaved = savedPosts.has(savedPostId);

  const [loading, setLoading] = useState(false);

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

    // Remove user's post from followers' feeds in batches
    const followers = await getFollowersQuery({ PK: myPK, onlyReturnUIDs: true });
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
    const savedPostsToDelete = await getAllSavedPostItemsQuery({
      uid: myUID, timestamp: currTimestamp,
    });
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

    // Delete yum items for post
    const yumItemsToDelete = await getPostYumsQuery({
      uid: myUID, timestamp: currTimestamp, noDetails: true,
    });
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

    // Update app state to trigger map re-render
    dispatch({ type: 'SET_RELOAD_MAP' });
  };

  const reportPost = async ({ currTimestamp, s3Key }) => {
  };

  const isMe = uid === myUID;
  const [morePressed, setMorePressed] = useState(false);
  const moreItems = isMe
    ? [
      {
        onPress: deletePostConfirmation,
        icon: <X size={wp(7.2)} color="red" />,
        label: 'Delete Post',
      },
    ] : [
      {
        onPress: () => reportPost({ currTimestamp: timestamp, s3Key: picture }),
        icon: <X size={wp(7.2)} color={colors.black} />,
        label: 'Report Post',
      },
    ];

  const fetchUser = async ({ fetchUID }) => {
    try {
      const currentUser = await getUserProfileQuery({ uid: fetchUID });
      // Check if I am following the current user
      if (currentUser.uid !== myUID) {
        currentUser.following = await getIsFollowingQuery({ currentUID: fetchUID, myUID });
      }
      navigation.push('Profile', { user: currentUser });
    } catch (err) {
      console.warn('Error fetching current user: ', err);
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
        size={wp(8)}
      />,
    }));
    setShowYummedUsers(true);
  };

  const [numLines, setNumLines] = useState(null);
  // const numLinesExpanded = useRef(null);
  const [numLinesExpanded, setNumLinesExpanded] = useState(null);
  const lineHeight = useRef(null);

  const onTextLayout = useCallback((e) => {
    if (numLinesExpanded == null) {
      setNumLinesExpanded(e.nativeEvent.lines.length);
      lineHeight.current = e.nativeEvent.lines[0] ? e.nativeEvent.lines[0].height : 0;
      setNumLines(NUM_COLLAPSED_LINES);
    }
  }, []);

  const isExpanded = (numLines === numLinesExpanded && numLinesExpanded > NUM_COLLAPSED_LINES);

  // const placeholderReview = 'Ordered so much food - overall good portions and taste was great. Definitely recommend! Ordered so much food - overall good portions and taste was great. Definitely recommend good portions and taste was great. Definitely recommend!';

  // rating = {
  //   overall: 5, food: 4, service: 4.5, atmosphere: 2, value: 3.5,
  // };

  // const [firstCardCurrent, setFirstCardCurrent] = useState(true);
  // const firstCardCurrentRef = useRef(true);

  // const prevCardStyle = {
  //   backgroundColor: 'blue',
  //   position: 'absolute',
  //   width: '100%',
  //   height: '100%',
  //   right: wp(100),
  // };

  // const nextCardStyle = {
  //   backgroundColor: 'red',
  //   position: 'absolute',
  //   width: '100%',
  //   height: '100%',
  //   left: wp(100),
  // };

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
          items={moreItems}
          morePressed={morePressed}
          setMorePressed={setMorePressed}
          onDismiss={() => continueBarAnimation()}
        />
        <MoreView
          items={yummedUsersRef.current}
          morePressed={showYummedUsers}
          setMorePressed={setShowYummedUsers}
          onDismiss={() => continueBarAnimation()}
          labelSize={sizes.b1}
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
            {stories
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
                  style={styles.locationContainer}
                  activeOpacity={0.8}
                  onPress={() => panToBottom()}
                >
                  <MapMarker size={wp(4.8)} color={colors.accent} />
                  <Text style={styles.locationText} numberOfLines={1}>{name}</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                setMorePressed(true);
                stopBarAnimation();
              }}
              style={styles.moreContainer}
            >
              <ThreeDots rotated size={wp(5)} />
            </TouchableOpacity>
          </View>
          <View style={styles.reviewTitleStarsContainer}>
            <Text style={styles.reviewTitleText}>
              Review:
            </Text>
            {rating && rating.overall && (
              <View style={styles.starsContainer}>
                <Stars
                  default={rating.overall}
                  count={5}
                  half
                  disabled
                  spacing={wp(0.6)}
                  fullStar={(
                    <MaskedView
                      maskElement={(
                        <StarFull size={wp(5)} />
                      )}
                    >
                      <LinearGradient
                        colors={rating.overall < 5 ? ['#FFC529', '#FFC529'] : gradients.orange.colors}
                        start={[-0.35, 1]}
                        end={[0.75, 1]}
                        style={{ width: wp(5), height: wp(5) }}
                      />
                    </MaskedView>
                  )}
                  halfStar={<StarHalf size={wp(5)} />}
                  emptyStar={<StarEmpty size={wp(5)} />}
                />
              </View>
            )}
          </View>
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
            style={[styles.reviewText]}
            numberOfLines={numLinesExpanded == null ? NUM_COLLAPSED_LINES : numLines}
            onPress={() => setNumLines(
              isExpanded ? NUM_COLLAPSED_LINES : numLinesExpanded,
            )}
          >
            {review}
          </Text>
          <ImageBackground
            style={styles.imageContainer}
            imageStyle={{ borderRadius: wp(2) }}
            source={{ uri: s3Photo }}
          >
            {/* <AnimatedEmoji
              index="emoji.key" // index to identity emoji component
              style={{ top: wp(40) }} // start bottom position
              name="sweat_smile" // emoji name
              size={15} // font size
              duration={6000} // ms
            // onAnimationCompleted={this.onAnimationCompleted}
            /> */}
            <View style={styles.emojiContainer}>
              <Text style={styles.emojiText}>😋</Text>
            </View>
            {dish && <Text style={styles.menuItemText}>{dish}</Text>}
          </ImageBackground>
          {!isExpanded && (
            <View style={styles.ratingsContainer}>
              {rating && rating.food && (
                <View style={styles.ratingContainer}>
                  <View>
                    <Rating
                      color={ratingColor(rating.food)}
                      size={ratingIconSize}
                    />
                    <View style={styles.ratingIconContainer}>
                      <Text style={styles.ratingText}>
                        {rating.food}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ratingLabelText}>Food</Text>
                </View>
              )}
              {rating && rating.value && (
                <View style={styles.ratingContainer}>
                  <View>
                    <Rating
                      color={ratingColor(rating.value)}
                      size={ratingIconSize}
                    />
                    <View style={styles.ratingIconContainer}>
                      <Text style={styles.ratingText}>
                        {rating.value}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ratingLabelText}>Value</Text>
                </View>
              )}
              {rating && rating.service && (
                <View style={styles.ratingContainer}>
                  <View>
                    <Rating
                      color={ratingColor(rating.service)}
                      size={ratingIconSize}
                    />
                    <View style={styles.ratingIconContainer}>
                      <Text style={styles.ratingText}>
                        {rating.service}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ratingLabelText}>Service</Text>
                </View>
              )}
              {rating && rating.atmosphere && (
                <View style={styles.ratingContainer}>
                  <View>
                    <Rating
                      color={ratingColor(rating.atmosphere)}
                      size={ratingIconSize}
                    />
                    <View style={styles.ratingIconContainer}>
                      <Text style={styles.ratingText}>
                        {rating.atmosphere}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ratingLabelText}>Atmosphere</Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View style={styles.middleContainer}>
          <View style={styles.middleButtonsContainer}>
            <View style={[styles.sideButtonsContainer, { alignItems: 'flex-start' }]}>
              <SaveButton
                isSaved={isSaved}
                dispatch={dispatch}
                size={wp(10)}
                post={stories[index.current]}
                place={place.current}
                myUID={myUID}
                stopBarAnimation={stopBarAnimation}
                startBarAnimation={startBarAnimation}
              />
            </View>
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
            <View style={[styles.sideButtonsContainer, { alignItems: 'flex-end' }]}>
              <YumButton
                size={wp(10)}
                uid={uid}
                placeId={placeId}
                timestamp={timestamp}
                myUID={myUID}
                myPK={myPK}
                myName={myName}
                myPicture={myPicture}
                showYummedUsersModal={showYummedUsersModal}
                stopBarAnimation={stopBarAnimation}
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
            <PlaceDetailView place={place.current} navigation={navigation} />
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
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'space-between',
    marginTop: wp(3),
  },
  emojiContainer: {
    alignSelf: 'flex-end',
    marginTop: wp(5),
    marginRight: wp(5),
  },
  emojiText: {
    fontSize: sizes.h1,
  },
  menuItemText: {
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: '#fff',
    width: wp(50),
    marginBottom: wp(5),
    marginLeft: wp(5),
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
