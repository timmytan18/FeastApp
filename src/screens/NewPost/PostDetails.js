import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput,
  ScrollView, Keyboard, Alert, ImageBackground, Animated,
} from 'react-native';
import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { manipulateAsync } from 'expo-image-manipulator';
import EmojiModal from 'react-native-emoji-modal';
import { getPlaceInDBQuery, getFollowersQuery } from '../../api/functions/queryFunctions';
import { createFeastItem, batchCreateFollowingPosts } from '../../api/graphql/mutations';
import MapMarker from '../components/util/icons/MapMarker';
import ProfilePic from '../components/ProfilePic';
import BackArrow from '../components/util/icons/BackArrow';
import RatingsInput from '../components/RatingsInput';
import { RATING_CATEGORIES } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, sizes, wp, hp, header, shadows,
} from '../../constants/theme';

const propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      business: PropTypes.shape({
        placeId: PropTypes.string,
        geocodePoints: PropTypes.arrayOf(
          PropTypes.shape({
            coordinates: PropTypes.arrayOf(PropTypes.number),
          }),
        ),
        name: PropTypes.string,
      }),
      picture: PropTypes.shape({
        uri: PropTypes.string,
      }),
      menuItem: PropTypes.string,
      pExists: PropTypes.bool,
      pCategories: PropTypes.arrayOf(PropTypes.string),
    }),
  }).isRequired,
};

const PostDetails = ({ navigation, route }) => {
  const {
    business, picture, menuItem, pExists, pCategories,
  } = route.params;
  const [state, dispatch] = useContext(Context);

  const [review, setReview] = useState(state.review);
  const reviewRef = useRef(state.review);
  const ratings = useRef(state.ratings);

  const placeExists = useRef(pExists);
  const placeCategories = useRef(pCategories);

  const [emojiOpen, setEmojiOpen] = useState(false);
  const [emoji, setEmoji] = useState('😋');
  const emojiPosition = useRef(new Animated.Value(0)).current;
  const translateAnim = emojiPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [wp(100), 20],
  });
  const opacityAnim = emojiPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const [shareDisable, setShareDisable] = useState(false);

  useEffect(() => {
    // Save current review and ratings
    function saveReview() {
      dispatch({
        type: 'SET_REVIEW_RATINGS',
        payload: { review: reviewRef.current, ratings: ratings.current },
      });
    }

    // Destructure place attributes
    const {
      placeId,
      name,
      geocodePoints: [{ coordinates: [placeLat, placeLng] }],
    } = business;

    const placePK = `PLACE#${placeId}`;
    const hash = geohash.encode(placeLat, placeLng);

    // Check if place exists in DynamoDB
    async function checkPlaceInDB() {
      try {
        const { placeInDB, categoriesDB } = await getPlaceInDBQuery(
          { placePK, withCategories: true },
        );
        if (placeInDB) {
          console.log('Place already in DB');
          placeExists.current = true;
          placeCategories.current = categoriesDB;
        }
      } catch (e) {
        console.warn('Error fetching DB place data: ', e);
      }
    }

    // Resize and compress photo; save to S3
    async function resizeAndSaveS3({ image, timestamp }) {
      const manipResult = await manipulateAsync(
        image.localUri || image.uri,
        [
          { resize: { height: 500, width: 500 } },
        ],
        { compress: 0.75 },
      );

      const img = manipResult.uri;
      if (img) {
        const response = await fetch(img);
        const blob = await response.blob();
        const key = `post_images/${name}/${timestamp}`;
        await Storage.put(key, blob, {
          level: 'protected',
          contentType: 'image/jpeg',
        });
        return key;
      }
      return null;
    }

    // Share user review for this place
    async function share() {
      if (shareDisable) {
        return;
      }
      setShareDisable(true);

      const date = new Date();
      const timestamp = date.toISOString();

      let postImgS3Url;
      try {
        postImgS3Url = await resizeAndSaveS3({ image: picture, timestamp });
      } catch (e) {
        console.warn('Error storing updated profile picture in S3: ', e);
        Alert.alert(
          'Error',
          'Could not share your review. Please try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
        return;
      }

      // Check if place in DB and fetch categories before sharing
      if (!placeExists.current) {
        await checkPlaceInDB();
      }

      // Add post to user posts
      const {
        PK: userPK, uid, name: userName, s3Picture: userPic, identityId,
      } = state.user;
      const userPlaceSK = `#PLACE#${timestamp}`;
      const GSI1 = `POST#${placeId}`;
      const GSI2 = 'POST#';
      const LSI1 = `#PLACE#${hash}`;
      const LSI2 = `#PLACE#${placeId}`;
      const userReview = reviewRef.current;
      const userRatings = ratings.current;
      const dish = menuItem ? menuItem.trim() : null;
      const userPostInput = {
        PK: userPK,
        SK: userPlaceSK,
        GSI1,
        GSI2,
        LSI1,
        LSI2,
        placeId,
        name,
        timestamp,
        geo: hash,
        categories: placeCategories.current,
        picture: postImgS3Url,
        dish,
        review: userReview,
        rating: userRatings,
        placeUserInfo: {
          uid,
          name: userName,
          picture: userPic,
          identityId,
        },
      };
      try {
        await API.graphql(graphqlOperation(
          createFeastItem,
          { input: userPostInput },
        ));
      } catch (e) {
        console.warn('Error saving post to user posts in DB: ', e);
        Alert.alert(
          'Error',
          'Could not share your review. Please try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
        return;
      }

      // Share post to user's followers' feeds
      const userFeedsInput = {
        SK: `#FOLLOWINGPOST#${timestamp}#${uid}`,
        LSI1: `#FOLLOWINGPOST#${hash}`,
        LSI2: `#FOLLOWINGPOST#${placeId}#${timestamp}`,
        LSI3: `#FOLLOWINGPOST#${uid}`,
        placeId,
        name,
        geo: hash,
        timestamp,
        categories: placeCategories.current,
        picture: postImgS3Url,
        dish,
        review: userReview,
        rating: userRatings,
        placeUserInfo: {
          uid,
          name: userName,
          picture: userPic,
          identityId,
        },
      };
      // Created all post items for each follower
      const followers = await getFollowersQuery({ PK: userPK, onlyReturnUIDs: true });
      const allUserFeedPosts = [];
      followers.forEach(({ follower: { PK: followerPK } }) => {
        allUserFeedPosts.push({
          ...userFeedsInput,
          PK: followerPK,
        });
      });

      // TODO: Add error handling for this
      // Add user's post to followers' feeds in batches
      console.log('User feed posts:', allUserFeedPosts);
      if (allUserFeedPosts.length) {
        let i; let j;
        const BATCH_NUM = 25; // DynamoDB batch requests are 25 items max
        for (i = 0, j = allUserFeedPosts.length; i < j; i += BATCH_NUM) {
          const batch = allUserFeedPosts.slice(i, i + BATCH_NUM);
          try {
            await API.graphql(graphqlOperation(
              batchCreateFollowingPosts,
              { input: { posts: batch } },
            ));
          } catch (err) {
            console.warn("Error adding posts to followers' feeds: ", err);
          }
        }
      }

      // Clear and reset review and ratings
      dispatch({
        type: 'SET_REVIEW_RATINGS',
        payload: { review: '', ratings: { ...RATING_CATEGORIES } },
      });
      navigation.navigate('Home');
    }

    const headerLeft = () => (
      <BackArrow
        color={colors.black}
        size={wp(6.2)}
        style={{ flex: 1 }}
        pressed={() => {
          saveReview();
          navigation.goBack();
        }}
      />
    );

    const headerRight = () => (
      <TouchableOpacity
        style={styles.shareButtonContainer}
        disabled={shareDisable}
        onPress={() => share()}
      >
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerLeft,
      headerLeftContainerStyle: { paddingLeft: sizes.margin },
      headerRight,
      title: business.name,
      headerTitleStyle: header.title,
    });
  }, [business, shareDisable, state.user.PK, state.user.uid]);

  const changeRatings = ({ value, type }) => {
    if (ratings.current[type] !== value) {
      ratings.current[type] = value;
    }
  };

  const handleEmojiSelect = (emojiObject) => {
    console.log(emojiObject);
    setEmoji(emojiObject);
    handleOpenCloseEmoji(false);
  };

  const handleOpenCloseEmoji = (open) => {
    Animated.spring(emojiPosition, {
      toValue: open ? 1 : 0,
      speed: 100,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
    setEmojiOpen(open);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[{
          position: 'absolute',
          backgroundColor: 'transparent',
          bottom: 10,
          zIndex: 1,
          width: wp(100),
          height: 0.9 * state.deviceHeight,
          alignSelf: 'center',
        }, { transform: [{ translateY: translateAnim }], opacity: opacityAnim }]}
        pointerEvents={emojiOpen ? 'auto' : 'none'}
      >
        <EmojiModal
          onEmojiSelected={handleEmojiSelect}
          onPressOutside={() => handleOpenCloseEmoji(false)}
          columns={8}
          emojiSize={wp(9)}
          scrollStyle={{
            height: '100%',
          }}
          scrollContentContainerStyle={{ alignItems: 'center', padding: 0, margin: 0 }}
          containerStyle={[shadows.darker, {
            width: '100%',
            height: wp(103),
            borderRadius: 0,
            borderTopLeftRadius: wp(4),
            borderTopRightRadius: wp(4),
            justifyContent: 'flex-start',
            paddingTop: wp(3),
          }]}
          backgroundStyle={{ opacity: 0.3, backgroundColor: emojiOpen ? colors.gray4 : 'transparent' }}
        />
      </Animated.View>
      <ScrollView
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
        style={{ margin: wp(4) }}
      >
        <View style={styles.postHeader}>
          <ProfilePic
            uid={state.user.uid}
            extUrl={state.user.picture}
            size={wp(12.5)}
            style={styles.profilePic}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.nameText}>{state.user.name}</Text>
            <View style={styles.locationContainer}>
              <MapMarker size={wp(4.8)} color={colors.accent} />
              <Text style={styles.locationText} numberOfLines={1}>{business.name}</Text>
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={styles.reviewInput}
            onChangeText={(text) => {
              setReview(text);
              reviewRef.current = text;
            }}
            value={review}
            placeholder="Add a review/caption…"
            placeholderTextColor={colors.tertiary}
            multiline
            maxLength={256}
            blurOnSubmit
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.emojiInput}
            onPress={() => handleOpenCloseEmoji(true)}
          >
            <Text style={{ fontSize: wp(5) }}>{emoji}</Text>
          </TouchableOpacity>
        </View>
        <ImageBackground
          style={styles.imageContainer}
          imageStyle={{ borderRadius: wp(2) }}
          source={{ uri: picture.uri }}
        >
          {menuItem && <Text style={styles.menuItemText}>{menuItem}</Text>}
        </ImageBackground>
        <Text style={styles.ratingTitle}>My Ratings</Text>
        <View style={styles.ratingsContainer}>
          <RatingsInput ratings={ratings} changeRatings={changeRatings} />
        </View>
      </ScrollView>
    </View>
  );
};

PostDetails.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  shareButtonContainer: {
    flex: 1,
    paddingRight: sizes.margin,
    alignItems: 'center',
    flexDirection: 'row',
  },
  shareButtonText: {
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    color: colors.accent,
    letterSpacing: 0.4,
  },
  postHeader: {
    height: wp(15),
    width: '100%',
    flexDirection: 'row',
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
  tagContainer: {
    flexDirection: 'row',
    marginTop: wp(4),
    paddingLeft: wp(1),
    alignItems: 'center',
  },
  tagText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    color: colors.black,
    paddingRight: wp(1.5),
    paddingBottom: wp(0.2),
    letterSpacing: 0.2,
  },
  reviewInput: {
    flex: 0.9,
    fontFamily: 'Book',
    fontSize: sizes.h4,
    color: colors.black,
    paddingHorizontal: wp(3),
    paddingTop: wp(2),
    paddingBottom: wp(2),
    marginVertical: wp(3),
    letterSpacing: 0.3,
    backgroundColor: colors.gray4,
    borderRadius: wp(2),
    height: wp(18),
  },
  emojiInput: {
    flex: 0.1,
    fontSize: sizes.h3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray4,
    borderRadius: wp(2),
    height: wp(18),
    paddingHorizontal: wp(3),
    paddingVertical: wp(2),
    marginVertical: wp(3),
    marginLeft: wp(3),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
    marginTop: wp(1),
    marginBottom: wp(8),
  },
  menuItemText: {
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: 'white',
    width: wp(50),
    paddingBottom: wp(5),
    paddingLeft: wp(5),
  },
  ratingsContainer: {
    paddingHorizontal: wp(1),
    marginBottom: wp(8),
  },
  ratingTitle: {
    fontFamily: 'Semi',
    fontSize: sizes.b0,
    color: colors.tertiary,
    paddingLeft: wp(0.5),
    marginBottom: -wp(2),
  },
});

export default PostDetails;
