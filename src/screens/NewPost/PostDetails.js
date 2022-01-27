import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput,
  Image, ScrollView, Keyboard, Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { getPlaceInDBQuery, getFollowersQuery } from '../../api/functions/queryFunctions';
import { createFeastItem, batchCreateFollowingPosts } from '../../api/graphql/mutations';
import MapMarker from '../components/util/icons/MapMarker';
import ProfilePic from '../components/ProfilePic';
import BackArrow from '../components/util/icons/BackArrow';
import RatingsInput from '../components/RatingsInput';
import { RATING_CATEGORIES } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, sizes, wp, hp,
} from '../../constants/theme';

const Category = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
});

const Chain = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
});

const propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      business: PropTypes.shape({
        categories: PropTypes.arrayOf(Category),
        chains: PropTypes.arrayOf(Chain),
        fsq_id: PropTypes.string,
        geocodes: PropTypes.shape({
          main: PropTypes.shape({
            latitude: PropTypes.number,
            longitude: PropTypes.number,
          }),
        }),
        location: PropTypes.shape({
          locality: PropTypes.string, // city
          region: PropTypes.string, // state
          country: PropTypes.string,
          address: PropTypes.string,
          postcode: PropTypes.string,
        }),
        name: PropTypes.string,
      }),
    }),
  }).isRequired,
};

const API_GATEWAY_ENDPOINT = 'https://fyjcth1v7d.execute-api.us-east-2.amazonaws.com/dev/scraper';

const PostDetails = ({ navigation, route }) => {
  const { business, businesses } = route.params;
  const [state, dispatch] = useContext(Context);

  const [review, setReview] = useState(state.review);
  const reviewRef = useRef(state.review);
  const ratings = useRef(state.ratings);

  const placeExists = useRef(false);
  const placeCategories = useRef(null);

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
      fsq_id: placeId,
      name,
      location: {
        locality: city,
        region, // state
        country,
        address,
        postcode,
      },
      geocodes: {
        main: {
          latitude: placeLat,
          longitude: placeLng,
        },
      },
      categories,
      chains,
    } = business;

    const placePK = `PLACE#${placeId}`;
    // Remove nonalphanumeric chars from name (spaces, punctionation, underscores, etc.)
    const strippedName = name.replace(/[^0-9a-z]/gi, '').toLowerCase();
    const hash = geohash.encode(placeLat, placeLng);

    // Send place data to API Gateway for lambda function to scrape
    // TODO: decide whether to run after user selects place or after user submits review
    async function createPlaceItem() {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const token = cognitoUser.signInUserSession.idToken.jwtToken;
      const category = categories[0].name;
      const data = {
        placeId,
        geohash: hash,
        strippedName,
        name,
        address,
        city,
        region,
        zip: postcode,
        country,
        category,
        chain: chains.length ? chains[0].name : '',
      };
      console.log(JSON.stringify(data));

      try {
        await fetch(API_GATEWAY_ENDPOINT, {
          method: 'PUT',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.log('Could not run scraper', e);
      }
    }

    // Check if place exists in DynamoDB
    async function checkPlaceInDB() {
      try {
        const { placeInDB, categoriesDB } = await getPlaceInDBQuery(
          { placePK, withCategories: true },
        );
        if (!placeInDB) {
          // Scrape data on screen load if place does not exist
          createPlaceItem();
        } else {
          console.log('Place already in DB');
          placeExists.current = true;
          placeCategories.current = categoriesDB;
        }
      } catch (e) {
        console.log('Fetch Dynamo place data error', e);
      }
    }

    // Run once when component mounts
    checkPlaceInDB();

    // Share user review for this place
    async function share() {
      // Check if place in DB and fetch categories before sharing
      if (!placeExists.current) {
        await checkPlaceInDB();
      }

      // Add post to user posts
      const date = new Date();
      const timestamp = date.toISOString();
      const {
        PK: userPK, uid, name: userName, picture: userPic,
      } = state.user;
      const userPlaceSK = `#PLACE#${timestamp}`;
      const GSI1 = `POST#${placeId}`;
      const GSI2 = 'POST#';
      const LSI1 = `#PLACE#${hash}`;
      const LSI2 = `#PLACE#${placeId}`;
      const userReview = reviewRef.current;
      const userRatings = ratings.current;
      const userPostInput = {
        PK: userPK,
        SK: userPlaceSK,
        GSI1,
        GSI2,
        LSI1,
        LSI2,
        placeId,
        name,
        geo: hash,
        categories: placeCategories.current,
        review: userReview,
        rating: userRatings,
        placeUserInfo: {
          uid,
          name: userName,
          picture: userPic,
        },
      };
      try {
        await API.graphql(graphqlOperation(
          createFeastItem,
          { input: userPostInput },
        ));
      } catch (err) {
        console.log(err);
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
        SK: `#FOLLOWINGPOST#${timestamp}`,
        LSI1: `#FOLLOWINGPOST#${hash}`,
        LSI2: `#FOLLOWINGPOST#${placeId}`,
        LSI3: `#FOLLOWINGPOST#${uid}`,
        placeId,
        name,
        geo: hash,
        categories: placeCategories.current,
        review: userReview,
        rating: userRatings,
        placeUserInfo: {
          uid,
          name: userName,
          picture: userPic,
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

      console.log(allUserFeedPosts);
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
            console.log("Error adding posts to followers' feeds", err);
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
        onPress={() => share()}
      >
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerLeft,
      headerLeftContainerStyle: { paddingLeft: sizes.margin },
      headerRight,
    });
  }, [business, dispatch, navigation, state.user.PK, state.user.uid]);

  const changeRatings = ({ value, type }) => {
    if (ratings.current[type] !== value) {
      ratings.current[type] = value;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView onScrollBeginDrag={Keyboard.dismiss} style={{ margin: wp(4) }}>
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
              <Text style={styles.locationText}>{business.name}</Text>
            </View>
          </View>
        </View>
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
        <Text style={styles.ratingTitle}>My Ratings</Text>
        <View style={styles.ratingsContainer}>
          <RatingsInput ratings={ratings} changeRatings={changeRatings} />
        </View>
      </ScrollView>
    </SafeAreaView>
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
    height: hp(7.2),
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
    fontFamily: 'Book',
    fontSize: sizes.h4,
    color: colors.black,
    paddingHorizontal: wp(3),
    paddingTop: wp(2),
    paddingBottom: wp(2),
    marginVertical: wp(3),
    letterSpacing: 0.3,
    backgroundColor: colors.gray2,
    borderRadius: wp(2),
    height: hp(15),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
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
    marginBottom: hp(5),
  },
  ratingTitle: {
    fontFamily: 'Semi',
    fontSize: wp(5.5),
    color: colors.primary,
    paddingLeft: wp(0.5),
    marginBottom: -wp(2),
  },
});

export default PostDetails;
