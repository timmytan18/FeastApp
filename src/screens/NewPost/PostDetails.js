import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput,
  ScrollView, Keyboard, Alert, ImageBackground,
} from 'react-native';
import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { API, Storage, graphqlOperation } from 'aws-amplify';
import { manipulateAsync } from 'expo-image-manipulator';
import Stars from 'react-native-stars';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import { getPlaceInDBQuery, getFollowersQuery } from '../../api/functions/queryFunctions';
import { createFeastItem, batchCreateFollowingPosts } from '../../api/graphql/mutations';
import MapMarker from '../components/util/icons/MapMarker';
import ProfilePic from '../components/ProfilePic';
import BackArrow from '../components/util/icons/BackArrow';
import { StarFull, StarHalf, StarEmpty } from '../components/util/icons/Star';
import { POST_IMAGE_ASPECT } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, sizes, wp, header, gradients,
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

  useEffect(() => {
    // Save current review and rating
    function saveReview() {
      dispatch({
        type: 'SET_REVIEW_RATING',
        payload: { review: reviewRef.current, rating: ratingRef.current },
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
        const { placeInDB, categoriesDB, imgUrlDB } = await getPlaceInDBQuery(
          { placePK, withCategoriesAndPicture: true },
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
          { resize: { width: 500 * aspectRatio, height: 500 } },
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
        setShareDisable(false);
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
        Alert.alert(
          'Error',
          'Could not share your review. Please try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
        setShareDisable(false);
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
        categories: placeCategoriesImgUrl.current.categories,
        // imgUrl: placeCategoriesImgUrl.current.imgUrl,
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
      const followers = await getFollowersQuery({ PK: userPK, onlyReturnUIDs: true });
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

      // TODO: Add error handling for this
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
          }
        }
      }

      // Update app state to trigger map re-render
      dispatch({ type: 'SET_RELOAD_MAP' });

      // Clear and reset review and rating
      dispatch({
        type: 'SET_REVIEW_RATING',
        payload: { review: null, rating: null },
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
        style={[styles.shareButtonContainer, { opacity: shareDisable ? 0.5 : 1 }]}
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
  }, [business, menuItem, picture, shareDisable, state.user, state.user.PK, state.user.uid]);

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
          <View style={styles.starsContainer}>
            <Stars
              default={rating}
              update={(val) => {
                setRating(val);
                ratingRef.current = val;
                if (shareDisable) setShareDisable(false);
              }}
              count={5}
              half
              spacing={wp(0.6)}
              fullStar={(
                <MaskedView
                  maskElement={(
                    <StarFull size={starSize} />
                  )}
                >
                  <LinearGradient
                    colors={rating < 5 ? ['#FFC529', '#FFC529'] : gradients.orange.colors}
                    start={[-0.35, 1]}
                    end={[0.75, 1]}
                    style={{ width: starSize, height: starSize }}
                  />
                </MaskedView>
              )}
              halfStar={<StarHalf size={starSize} />}
              emptyStar={<StarEmpty size={starSize} />}
            />
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
            placeholder="📝 Write a review/caption…"
            placeholderTextColor={colors.tertiary}
            multiline
            maxLength={256}
            blurOnSubmit
            returnKeyType="done"
          />
        </View>
        <ImageBackground
          style={styles.imageContainer}
          imageStyle={{ borderRadius: wp(2) }}
          source={{ uri: picture.uri }}
        >
          {menuItem && <Text style={styles.menuItemText}>{menuItem}</Text>}
        </ImageBackground>
      </ScrollView>
    </View>
  );
};

PostDetails.propTypes = propTypes;

const starSize = wp(5.5);

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
    height: wp(24),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
    justifyContent: 'flex-end',
    marginTop: wp(1),
    marginBottom: wp(25),
  },
  menuItemText: {
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: '#fff',
    width: wp(50),
    paddingBottom: wp(5),
    paddingLeft: wp(5),
  },
  reviewTitleStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(3),
    marginBottom: wp(1),
    paddingLeft: 1,
  },
  reviewTitleText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    paddingRight: wp(2),
    marginLeft: 1,
    alignSelf: 'flex-end',
  },
  starsContainer: {
    marginBottom: wp(1),
    zIndex: 1,
  },
});

export default PostDetails;
