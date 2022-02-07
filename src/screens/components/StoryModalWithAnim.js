import React, {
  useEffect, useContext, useState, useRef, useMemo,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, ImageBackground, Animated, Easing, PanResponder,
} from 'react-native';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import MaskedView from '@react-native-community/masked-view';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import ProfilePic from './ProfilePic';
import MapMarker from './util/icons/MapMarker';
import Rating from './util/icons/Rating';
import YumButton from './util/YumButton';
import SaveButton from './util/SaveButton';
import SwipeUpArrow from './util/icons/SwipeUpArrow';
import {
  colors, shadows, gradients, sizes, wp, hp,
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

const StoryModal = ({
  stories, storiesVisible, setStoriesVisible, users,
}) => {
  console.log(stories);

  useEffect(() => {
    console.log('useeffect');
    inputAnim.setValue(0);
    index.current = 0;
    numStories.current = stories.length;
    if (storiesVisible) {
      storiesVisibleRef.current = true;
      slideInput({ reset: false });
    }
    return () => {
      index.current = 0;
      setIndexState(index.current);
    };
  }, [storiesVisible, stories]);

  // const [index, setIndex] = useState(0);
  const index = useRef(0);
  const [indexState, setIndexState] = useState(0);
  const storiesVisibleRef = useRef(storiesVisible);
  const numStories = useRef(stories.length);

  const barWidth = (wp(100) - 2 * sizes.margin) / (stories.length) - 2;
  const inputAnim = useRef(new Animated.Value(0)).current;
  const inputTranslate = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth],
  });
  const slideInput = ({ reset }) => {
    if (reset) {
      inputAnim.setValue(0);
    }
    Animated.timing(inputAnim, {
      toValue: 1,
      easing: Easing.linear,
      duration: 6000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      inputAnim.setValue(0);
      console.log('finished', finished);
      if (index.current < numStories.current - 1 && storiesVisibleRef.current) {
        console.log('increment index');
        index.current += 1;
        setIndexState(index.current);
        slideInput({ reset: false });
      } else {
        console.log('anim finished');
        storiesVisibleRef.current = false;
        setStoriesVisible(false);
      }
    });
    // Animated.loop(
    //   Animated.timing(inputAnim, {
    //     toValue: 1,
    //     easing: Easing.linear,
    //     duration: 6000,
    //     useNativeDriver: false,
    //   }).start(({ finished }) => {
    //     inputAnim.setValue(0);
    //     console.log('finished', finished);
    //     if (index.current < numStories.current - 1 && storiesVisibleRef.current) {
    //       console.log('increment index');
    //       index.current += 1;
    //       setIndexState(index.current);
    //       slideInput();
    //     } else {
    //       console.log('anim finished');
    //       storiesVisibleRef.current = false;
    //       setStoriesVisible(false);
    //     }
    //   }),
    //   { iterations: stories.length },
    // ).start();
  };

  const isTap = useRef(false);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderStart: (e, gestureState) => {
        isTap.current = true;
      },
      onPanResponderMove: (evt, gestureState) => {
        // console.log(gestureState);
        // if (Math.abs(gestureState.dx) >= 2 || Math.abs(gestureState.dy) >= 2) {
        //   // position.setValue({ x: gestureState.dx, y: gestureState.dy });
        //   if (isTap.current) { isTap.current = false; }
        // } else {
        //   isTap.current = true;
        // }
        isTap.current = false;
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (isTap.current) {
          if (gestureState.x0 > 250) {
            if (index.current < numStories.current) {
              console.log('tap right yeet');
              // inputAnim.stopAnimation();
              // Animated.loop().stop();
              // inputAnim.setValue(0);
              // inputAnim.stopAnimation((value) => {
              //   inputAnim.setValue(value);
              //   Animated.timing(inputAnim, {
              //     toValue: 1,
              //     easing: Easing.linear,
              //     duration: 200,
              //     useNativeDriver: false,
              //   }).start();
              // });
              // inputAnim.setValue(0);
              // index.current += 1;
              // setIndexState(index.current);
              slideInput({ reset: true });
            }
          } else if (gestureState.x0 < 150) {
            if (index.current > 0) {
              console.log('tap left');
              // inputAnim.setValue(0);
              // index.current -= 1;
              // setIndexState(index.current);
              // slideInput();
            }
          } else {
            console.log('large image');
            // open up larger image ?
          }
        } else if (gestureState.dy > 100) {
          console.log('swipe down');
          // Animated.spring(position, {
          //     toValue: { x: 0, y: 0 },
          //     friction: 4,
          // }).start()
        }
      },
    }),
  ).current;

  let uid; let placeId; let name; let picture; let dish; let rating; let review;
  let userName; let userPic;
  if (stories && stories.length && index.current < stories.length) {
    ({
      placeUserInfo: { uid }, placeId, name, picture, dish, rating, review,
    } = stories[index.current]);
    ({ userName, userPic } = users[uid]);
  }

  // const placeholderReview = 'Ordered so much food - overall good portions and taste was great. Definitely recommend!';

  // rating = {
  //   overall: 5, food: 4, service: 4.5, atmosphere: 2, value: 3.5,
  // };

  return (
    <Modal
      isVisible={storiesVisible}
      animationIn="zoomIn"
      animationOut="zoomOut"
      swipeDirection={['down']}
      propagateSwipe
      onSwipeComplete={() => {
        storiesVisibleRef.current = false;
        setStoriesVisible(false);
      }}
    >
      <View style={styles.container}>
        <Animated.View style={styles.cardContainer} {...panResponder.panHandlers}>
          <View style={styles.progressContainer}>
            {stories && stories.length
              && (stories.map((story, i) => (
                <View
                  key={story.SK + Math.random()}
                  style={[styles.progressBar, { marginHorizontal: 2, width: barWidth }]}
                >
                  <Animated.View
                    style={[
                      styles.progressBar,
                      { backgroundColor: colors.gray },
                      {
                        width: i === index.current
                          ? inputTranslate : (i < index.current ? 1 : 0),
                      },
                    ]}
                  />
                </View>
              )))}
          </View>
          <View style={styles.headerContainer}>
            <View style={{ flexDirection: 'row' }}>
              <ProfilePic
                uid={uid}
                extUrl={userPic}
                size={wp(12.5)}
                style={styles.profilePic}
              />
              <View style={styles.headerTextContainer}>
                <Text style={styles.nameText}>{userName}</Text>
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
            {rating && rating.overall === 5 && (
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
                        colors={gradients.orange.colors}
                        start={[-0.35, 1]}
                        end={[0.75, 1]}
                        style={{ width: wp(5), height: wp(5) }}
                      />
                    </MaskedView>
                  )}
                />
              </View>
            )}
            {rating && rating.overall < 5 && (
              <View style={styles.starsContainer}>
                <Stars
                  default={rating.overall}
                  count={5}
                  half
                  disabled
                  spacing={wp(0.6)}
                  fullStar={<StarFull size={wp(5)} />}
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
        </Animated.View>
        <View style={styles.bottomContainer}>
          <View style={styles.bottomButtonsContainer}>
            <View style={[styles.sideButtonsContainer, { alignItems: 'flex-start' }]}>
              <SaveButton size={wp(11)} />
            </View>
            <View style={styles.viewPlaceBtnContainer}>
              <SwipeUpArrow />
              <LinearGradient
                colors={gradients.orange.colors}
                start={gradients.orange.start}
                end={gradients.orange.end}
                style={styles.viewPlaceBtnGradient}
              >
                <View style={styles.viewPlaceBtn}>
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
                </View>
              </LinearGradient>
            </View>
            <View style={[styles.sideButtonsContainer, { alignItems: 'flex-end' }]}>
              <YumButton size={wp(11)} />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const ratingIconSize = wp(12);

const styles = StyleSheet.create({
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
    height: wp(10),
    alignItems: 'center',
    flexDirection: 'row',
  },
  progressBar: {
    height: wp(0.9),
    borderRadius: wp(0.45),
    // flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.gray2,
  },
  bottomContainer: {
    flex: 0.15,
    paddingHorizontal: sizes.margin * 2,
  },
  bottomButtonsContainer: {
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
    width: wp(24.5),
    height: wp(9.5),
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(4),
    marginTop: wp(1.8),
  },
  viewPlaceBtn: {
    width: wp(23.5),
    height: wp(8.5),
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(3.5),
  },
  viewPlaceBtnTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  viewPlaceBtnText: {
    fontSize: sizes.b3,
    fontFamily: 'Medium',
    paddingBottom: 1,
  },
  headerContainer: {
    height: hp(7.2),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  profilePic: {
    height: '90%',
    aspectRatio: 1,
    borderRadius: wp(15),
    alignSelf: 'center',
  },
  headerTextContainer: {
    justifyContent: 'space-between',
    marginTop: wp(1.3),
    marginBottom: wp(0.7),
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    color: colors.black,
    paddingLeft: wp(3),
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
});

export default StoryModal;
