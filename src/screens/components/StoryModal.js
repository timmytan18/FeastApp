import React, {
  useEffect, useContext, useState, useRef,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, ImageBackground,
  Animated, PanResponder, ScrollView, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import MaskedView from '@react-native-community/masked-view';
import PlaceDetail from './PlaceDetail';
import { getUserProfileQuery, getIsFollowingQuery } from '../../api/functions/queryFunctions';
import getElapsedTime from '../../api/functions/GetElapsedTime';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import ProfilePic from './ProfilePic';
import MapMarker from './util/icons/MapMarker';
import Rating from './util/icons/Rating';
import YumButton from './util/YumButton';
import SaveButton from './util/SaveButton';
import SwipeUpArrow from './util/icons/SwipeUpArrow';
import BackArrow from './util/icons/BackArrow';
import { Context } from '../../Store';
import {
  colors, shadows, gradients, sizes, wp,
} from '../../constants/theme';

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

const StoryModal = ({ navigation, route }) => {
  const {
    stories,
    users,
    place,
    deviceHeight,
  } = route.params;

  const [{ user: { uid: myUID } }, dispatch] = useContext(Context);

  // useEffect(() => {
  //   index.current = 0;
  //   numStories.current = stories.length;
  //   return () => {
  //     index.current = 0;
  //     translateVal.setValue(0);
  //     enablePanResponder.current = true;
  //     setEnablePanResponderState(true);
  //     setIndexState(0);
  //   };
  // }, [stories]);

  const index = useRef(0);
  const [indexState, setIndexState] = useState(0);
  const numStories = useRef(stories.length);

  const enablePanResponder = useRef(true);
  const [enablePanResponderState, setEnablePanResponderState] = useState(true);
  const translateVal = useRef(new Animated.Value(0)).current;
  const translateAnim = ({ value }) => {
    Animated.spring(translateVal, {
      toValue: value,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
  };

  // Calculate scroll thresholds to animate between top/bottom or exit modal
  const topEnabled = useRef(true);
  const bottomEnabled = useRef(false);
  const lastContentOffsetY = useRef(0);
  const paddingBottom = 90;
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
    translateAnim({ value: 0 });
  };
  const panToBottom = () => {
    enablePanResponder.current = false;
    setEnablePanResponderState(false);
    translateAnim({ value: -deviceHeight });
  };
  const closeModal = () => {
    navigation.popToTop();
  };

  const isTap = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enablePanResponder.current,
      onPanResponderStart: (e, gestureState) => {
        isTap.current = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        isTap.current = false;
        translateVal.setValue(gestureState.dy / 3);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // tap to see next/prev story
        if (isTap.current) {
          if (gestureState.x0 > 250) {
            if (index.current < numStories.current - 1) {
              index.current += 1;
              setIndexState(index.current);
            } else {
              closeModal();
            }
          } else if (gestureState.x0 < 150) {
            if (index.current > 0) {
              index.current -= 1;
              setIndexState(index.current);
            } else {
              closeModal();
            }
          } else {
            console.log('large image');
            // open up larger image ?
          }
          // swipe up/down to change top/bottom view
        } else if (gestureState.dy < -100) {
          // swipe up
          panToBottom();
        } else if (gestureState.dy / 2 > 100) {
          // swipe down
          closeModal();
        } else {
          panToTop();
        }
      },
    }),
  ).current;

  let uid; let placeId; let name; let picture; let dish; let rating; let review; let timestamp;
  let userName; let userPic;
  if (stories && stories.length && index.current < stories.length) {
    ({
      placeUserInfo: { uid }, placeId, name, picture, dish, rating, review, timestamp,
    } = stories[index.current]);
    ({ userName, userPic } = users[uid]);
  }

  const elapsedTime = getElapsedTime(timestamp);
  console.log(elapsedTime);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getUserProfileQuery({ uid });

      // Check if I am following the current user
      if (currentUser.uid !== myUID) {
        currentUser.following = await getIsFollowingQuery({ currentUID: uid, myUID });
        console.log('isFollowing:', currentUser.following);
      }

      navigation.push('Profile', { user: currentUser });
    } catch (err) {
      console.warn('Error fetching current user: ', err);
    }
  };

  // const placeholderReview = 'Ordered so much food - overall good portions and taste was great. Definitely recommend!';

  // rating = {
  //   overall: 5, food: 4, service: 4.5, atmosphere: 2, value: 3.5,
  // };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: translateVal }] },
      ]}
    >
      <StatusBar animated barStyle="light-content" />
      <View style={styles.cardContainer} {...panResponder.panHandlers}>
        <View style={styles.progressContainer}>
          {stories && stories.length > 1
            && (stories.map((story, i) => (
              <View
                key={story.SK}
                style={[styles.progressBar, { marginHorizontal: 2 }]}
              >
                <View
                  style={[
                    styles.progressBar,
                    { backgroundColor: colors.gray, flex: i === indexState ? 1 : 0 },
                  ]}
                />
              </View>
            )))}
        </View>
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={fetchCurrentUser}
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
                <Text style={styles.nameText}>{userName}</Text>
                <Text style={styles.elapsedTimeText}>{elapsedTime}</Text>
              </View>
              <View style={styles.locationContainer}>
                <MapMarker size={wp(4.8)} color={colors.accent} />
                <Text style={styles.locationText} numberOfLines={1}>{name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.emojiContainer}>
            <Text style={styles.emojiText}>😋</Text>
          </View>
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
        <Text style={styles.reviewText}>{review}</Text>
        <ImageBackground
          style={styles.imageContainer}
          imageStyle={{ borderRadius: wp(2) }}
          source={{ uri: picture }}
        >
          {dish && <Text style={styles.menuItemText}>{dish}</Text>}
        </ImageBackground>
        <View style={styles.ratingsContainer}>
          {rating && rating.food && (
            <View style={styles.ratingContainer}>
              <View>
                <Rating
                  isGradient={rating.food > 4.5}
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
                  isGradient={rating.value > 4.5}
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
                  isGradient={rating.service > 4.5}
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
                  isGradient={rating.atmosphere > 4.5}
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
      </View>
      <View style={styles.middleContainer}>
        <View style={styles.middleButtonsContainer}>
          <View style={[styles.sideButtonsContainer, { alignItems: 'flex-start' }]}>
            <SaveButton size={wp(10.5)} />
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
            <YumButton size={wp(10.5)} />
          </View>
        </View>
      </View>
      <View style={[styles.bottomContainer, { height: deviceHeight, bottom: -deviceHeight }]}>
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          scrollEventThrottle={200}
          onScroll={({ nativeEvent }) => {
            const pos = isCloseToTopBottom(nativeEvent);
            if (pos === 'TOP') {
              panToTop();
            }
          }}
        >
          <PlaceDetail place={place} navigation={navigation} />
        </ScrollView>
        <TouchableOpacity
          style={styles.downArrowContainer}
          onPress={() => panToTop()}
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
    backgroundColor: 'white',
    paddingHorizontal: sizes.margin,
  },
  progressContainer: {
    height: wp(9),
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressBar: {
    height: wp(0.9),
    borderRadius: wp(0.45),
    flex: 1,
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
    borderRadius: wp(3.5),
    marginTop: wp(1.8),
  },
  viewPlaceBtn: {
    width: wp(20),
    height: wp(7),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(3),
  },
  viewPlaceBtnTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  viewPlaceBtnText: {
    fontSize: sizes.b4,
    fontFamily: 'Medium',
    paddingBottom: 0.5,
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
    width: '90%',
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
  emojiContainer: {
    alignSelf: 'center',
    marginRight: wp(5),
  },
  emojiText: {
    fontSize: sizes.h1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
    marginTop: wp(3),
  },
  menuItemText: {
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: 'white',
    width: wp(50),
    paddingBottom: wp(5),
    paddingLeft: wp(5),
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
    color: 'white',
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
