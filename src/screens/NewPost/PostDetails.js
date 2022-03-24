import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Keyboard, Alert, Image,
} from 'react-native';
import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { manipulateAsync } from 'expo-image-manipulator';
import { getPlaceInDBQuery, getFollowersQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import {
  createFeastItem, batchCreateFollowingPosts, incrementFeastItem, deleteFeastItem,
} from '../../api/graphql/mutations';
import MapMarker from '../components/util/icons/MapMarker';
import ProfilePic from '../components/ProfilePic';
import BackArrow from '../components/util/icons/BackArrow';
import Cam from '../components/util/icons/Cam';
import EditStarsRating from '../components/EditStarsRating';
import CenterSpinner from '../components/util/CenterSpinner';
import { POST_IMAGE_ASPECT } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, sizes, wp, header,
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
      pCategories: PropTypes.shape({
        categories: PropTypes.arrayOf(PropTypes.string),
        imgUrl: PropTypes.string,
      }),
    }),
  }).isRequired,
};

const reviewCharLimit = 256;
const reviewCharLimitNoImage = 512;
const PostDetails = ({ navigation, route }) => {
  const {
    business, picture, menuItem, pExists, pCategories,
  } = route.params;
  const [state, dispatch] = useContext(Context);

  const [review, setReview] = useState(state.review);
  const reviewRef = useRef(state.review);
  const ratingRef = useRef(state.rating);

  const placeExists = useRef(pExists);
  const placeCategoriesImgUrl = useRef(pCategories);

  const [rating, setRating] = useState(state.rating || 0);

  const [shareDisable, setShareDisable] = useState(!ratingRef.current);

  // Save current review and rating
  function saveReview() {
    dispatch({
      type: 'SET_REVIEW_RATING',
      payload: { review: reviewRef.current, rating: ratingRef.current },
    });
  }

  useEffect(() => {
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
        const { promise, getValue, errorMsg } = getPlaceInDBQuery(
          { placePK, withCategoriesAndPicture: true },
        );
        const { placeInDB, categoriesDB, imgUrlDB } = await fulfillPromise(
          promise,
          getValue,
          errorMsg,
        );
        if (placeInDB) {
          placeExists.current = true;
          placeCategoriesImgUrl.current = { categories: categoriesDB, imgUrl: imgUrlDB };
        }
      } catch (e) {
        console.warn('Error fetching DB place data: ', e);
      }
    }

    // Resize and compress photo; save to S3
    async function resizeAndSaveS3({ image, timestamp }) {
      const aspectRatio = POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1];
      const manipResult = await manipulateAsync(
        image.localUri || image.uri,
        [
          { resize: { width: 1000 * aspectRatio, height: 1000 } },
        ],
        { compress: 0.5 },
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

    // Delete post from user's profile
    async function deletePostFromProfile({ myPK, currTimestamp }) {
      const input = { PK: myPK, SK: `#PLACE#${currTimestamp}` };
      try {
        await API.graphql(graphqlOperation(
          deleteFeastItem,
          { input },
        ));
      } catch (err) {
        console.warn('Error deleting post from user profile:', err);
      }
    }

    // Delete post image from S3
    async function deletePostFromS3({ s3Key }) {
      try {
        await Storage.remove(s3Key, { level: 'protected' });
      } catch (err) {
        console.warn('Error deleting post image from S3:', err);
      }
    }

    const onShareFailed = async ({ postImgS3Url }) => {
      if (!postImgS3Url) return;
      await deletePostFromS3({ s3Key: postImgS3Url });
      Alert.alert(
        'Error',
        'Could not share your review. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false },
      );
      setShareDisable(false);
    };

    // Share user review for this place
    async function share() {
      if (shareDisable) {
        return;
      }
      setShareDisable(true);

      const date = new Date();
      const timestamp = date.toISOString();

      // Resize and store post image in S3
      let postImgS3Url = null;
      if (picture) {
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
          setShareDisable(false);
          return;
        }
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
      const LSI1 = `#POSTTIME#${timestamp}`;
      const LSI2 = `#PLACE#${placeId}`;
      const userReview = reviewRef.current;
      const userRating = ratingRef.current;
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
        categories: placeCategoriesImgUrl.current.categories,
        imgUrl: placeCategoriesImgUrl.current.imgUrl,
        picture: postImgS3Url,
        dish,
        review: userReview,
        rating: userRating,
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
        onShareFailed({ postImgS3Url });
        return;
      }

      // Update place rating count and sum
      const ratingSK = '#RATING';
      try {
        await API.graphql(graphqlOperation(
          incrementFeastItem,
          {
            input: {
              PK: placePK, SK: ratingSK, count: 1, sum: userRating,
            },
          },
        ));
      } catch (e) {
        // If place rating item doesn't exist, create it
        if (e.errors && e.errors.length
          && e.errors.some(({ errorType }) => errorType === 'DynamoDB:ConditionalCheckFailedException')) {
          const placeRatingInput = {
            PK: placePK, SK: ratingSK, count: 1, sum: userRating, placeId,
          };
          try {
            await API.graphql(graphqlOperation(
              createFeastItem,
              { input: placeRatingInput },
            ));
          } catch (e2) {
            console.warn('Error create place rating item: ', e2);
            // If error creating place rating item, delete post from user profile
            deletePostFromProfile({ myPK: userPK, currTimestamp: timestamp });
            onShareFailed({ postImgS3Url });
            return;
          }
        } else {
          console.warn('Error updating place rating count and sum: ', e);
          // If error creating place rating item, delete post from user profile
          deletePostFromProfile({ myPK: userPK, currTimestamp: timestamp });
          onShareFailed({ postImgS3Url });
          return;
        }
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
        categories: placeCategoriesImgUrl.current.categories,
        imgUrl: placeCategoriesImgUrl.current.imgUrl,
        picture: postImgS3Url,
        dish,
        review: userReview,
        rating: userRating,
        placeUserInfo: {
          uid,
          name: userName,
          picture: userPic,
          identityId,
        },
      };
      // Created all post items for each follower
      const { promise, getValue, errorMsg } = getFollowersQuery({
        PK: userPK, onlyReturnUIDs: true,
      });
      const followers = await fulfillPromise(promise, getValue, errorMsg);
      const allUserFeedPosts = [{
        ...userFeedsInput,
        PK: userPK,
      }];
      followers.forEach(({ follower: { PK: followerPK } }) => {
        allUserFeedPosts.push({
          ...userFeedsInput,
          PK: followerPK,
        });
      });

      // Add user's post to followers' feeds in batches
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
            onShareFailed({ postImgS3Url });
            return;
          }
        }
      }

      // Update app state to trigger map & profile re-render
      dispatch({ type: 'SET_RELOAD_MAP' });
      dispatch({ type: 'SET_RELOAD_PROFILE' });

      // Clear and reset review and rating
      dispatch({
        type: 'SET_REVIEW_RATING',
        payload: { review: null, rating: null },
      });
      navigation.navigate('ProfileTab', {
        screen: 'Profile',
      });
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

    const loading = ratingRef.current != null && shareDisable;
    const headerRight = () => (
      <TouchableOpacity
        style={[styles.shareButtonContainer, { opacity: shareDisable ? 0.5 : 1 }]}
        disabled={shareDisable}
        onPress={() => share()}
      >
        {!loading && <Text style={styles.shareButtonText}>Share</Text>}
        {loading && <CenterSpinner />}
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerLeft,
      headerLeftContainerStyle: { paddingLeft: sizes.margin },
      headerRight,
      title: business.name,
      headerTitleStyle: header.title,
    });
  }, [business, menuItem, picture, shareDisable, state.user, state.user.PK, state.user.uid]);

  const updateRating = (rating) => {
    setRating(rating);
    ratingRef.current = rating;
    if (shareDisable) setShareDisable(false);
  };

  const attachImage = () => {
    saveReview();
    navigation.navigate('UploadImages', {
      openImagePicker: true,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        onScrollBeginDrag={Keyboard.dismiss}
        showsVerticalScrollIndicator={false}
        style={{ padding: wp(4) }}
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
        <View style={styles.reviewTitleStarsContainer}>
          <Text style={styles.reviewTitleText}>
            Review:
          </Text>
          <EditStarsRating
            rating={rating}
            updateRating={updateRating}
            spacing={wp(0.6)}
            size={starSize}
            starStyle={styles.myStarStyle}
            containerStyle={styles.starsContainer}
          />
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TextInput
            style={styles.reviewInput}
            onChangeText={(text) => {
              setReview(text);
              reviewRef.current = text;
            }}
            value={review}
            placeholder={`📝 Write a review${picture ? '/caption' : ''}…`}
            placeholderTextColor={colors.tertiary}
            multiline
            maxLength={picture ? reviewCharLimit : reviewCharLimitNoImage}
            blurOnSubmit
            returnKeyType="done"
          />
        </View>
        {picture && (
          <View style={styles.imageContainer}>
            <Image
              style={styles.image}
              source={{ uri: picture.uri }}
            />
            {menuItem !== null && menuItem.length > 0
              && <Text style={styles.menuItemText}>{menuItem}</Text>}
          </View>
        )}
        {!picture && (
          <TouchableOpacity
            style={styles.noImageContainer}
            activeOpacity={0.6}
            onPress={attachImage}
          >
            <Cam />
            <Text style={styles.noImageText}>Attach an image</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

PostDetails.propTypes = propTypes;

const starSize = wp(5.8);
const inputSize = wp(28);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    flex: 1,
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
    height: inputSize,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
    marginTop: wp(1),
    marginBottom: wp(25),
    borderRadius: wp(2),
  },
  image: {
    width: '100%',
    aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
    borderRadius: wp(2),
  },
  menuItemText: {
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: '#fff',
    width: wp(50),
    position: 'absolute',
    bottom: wp(5),
    left: wp(5),
  },
  noImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(3),
    paddingVertical: wp(3),
    marginVertical: wp(3),
    backgroundColor: colors.gray2,
    height: inputSize,
    borderRadius: wp(2),
    opacity: 0.9,
  },
  noImageText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.tertiary,
    marginTop: wp(1),
  },
  reviewTitleStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 1,
  },
  reviewTitleText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    paddingRight: wp(2),
    marginTop: wp(3),
    marginBottom: wp(1),
    marginLeft: 1,
    alignSelf: 'flex-end',
  },
  starsContainer: {
    marginTop: wp(3),
    marginBottom: wp(2),
    zIndex: 1,
  },
});

export default PostDetails;
