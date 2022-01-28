import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Alert,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';
import { getFollowingPostsByUserQuery } from '../../api/functions/queryFunctions';
import {
  createFeastItem, deleteFeastItem, incrementFeastItem,
  batchCreateFollowingPosts, batchDeleteFollowingPosts,
} from '../../api/graphql/mutations';
import TwoButtonAlert from './util/TwoButtonAlert';
import {
  colors, gradients,
} from '../../constants/theme';

const propTypes = {
  currentUser: PropTypes.shape({
    PK: PropTypes.string,
    SK: PropTypes.string,
    uid: PropTypes.string,
    name: PropTypes.string,
    username: PropTypes.string,
    identityId: PropTypes.string,
    picture: PropTypes.string,
    following: PropTypes.bool,
  }).isRequired,
  myUser: PropTypes.shape({
    uid: PropTypes.string,
    PK: PropTypes.string,
    SK: PropTypes.string,
    name: PropTypes.string,
    identityId: PropTypes.string,
    picture: PropTypes.string,
    s3Picture: PropTypes.string,
  }).isRequired,
  reviews: PropTypes.arrayOf(PropTypes.shape({
    placeId: PropTypes.string,
    name: PropTypes.string,
    geo: PropTypes.string,
    timestamp: PropTypes.string,
  })).isRequired,
  numFollowing: PropTypes.number.isRequired,
};

const FollowButton = ({
  currentUser, myUser, reviews, numFollowing, dispatch, containerStyle, textStyle,
}) => {
  // Destructure current user (profile user is viewing) object
  const {
    PK, SK, uid, name, username, identityId,
  } = currentUser;
  let picture = null;
  if (currentUser.picture) {
    picture = currentUser.picture;
  }

  // Create follower object using my info
  const myID = myUser.uid;
  const myPK = myUser.PK;
  const mySK = myUser.SK;
  const follower = {
    PK: myPK,
    SK: mySK,
    name: myUser.name,
    identityId: myUser.identityId,
    followedSK: SK,
    uid: myID,
  };
  if (myUser.picture && myUser.s3Picture) {
    follower.picture = myUser.s3Picture;
  }

  const [following, setFollowing] = useState(currentUser.following);

  const reviewsForFeed = useRef([]);
  const reviewsToDelete = useRef([]);

  useEffect(() => {
    const updatedReviews = [];
    reviews.forEach((review) => {
      updatedReviews.push({
        ...review,
        PK: myPK,
        SK: `#FOLLOWINGPOST#${review.timestamp}`,
        LSI1: `#FOLLOWINGPOST#${review.geo}`,
        LSI2: `#FOLLOWINGPOST#${review.placeId}`,
        LSI3: `#FOLLOWINGPOST#${uid}`,
        placeUserInfo: {
          name,
          uid,
          picture,
        },
      });
    });
    reviewsForFeed.current = updatedReviews;
  }, [reviews, myPK, name, uid, picture]);

  const changeFollowingConfirmation = async () => {
    if (following) {
      reviewsToDelete.current = await getFollowingPostsByUserQuery(
        { PK: myPK, followingUID: uid },
      );
      TwoButtonAlert({
        title: `Unfollow ${currentUser.name}?`,
        yesButton: 'Confirm',
        pressed: () => {
          changeFollowing();
          removePostsFromFeed();
        },
      });
    } else {
      changeFollowing();
      addPostsToFeed();
    }
  };

  const changeFollowing = async () => {
    // Add following/unfollowing to dynamo
    const currFollow = following;
    setFollowing(!currFollow);
    const mutation = currFollow ? deleteFeastItem : createFeastItem;
    const input = currFollow
      ? { PK, SK: `#FOLLOWER#${myID}` }
      : {
        PK, SK: `#FOLLOWER#${myID}`, GSI1: 'USER#', name, username, ...(picture && { picture }), identityId, uid, follower,
      };
    console.log(input);
    try {
      await API.graphql(graphqlOperation(
        mutation,
        { input },
      ));
    } catch (err) {
      setFollowing(currFollow);
      console.log(err);
      Alert.alert(
        'Error',
        `Could not ${currFollow ? 'unfollow' : 'follow'}`,
        [{ text: 'OK' }],
        { cancelable: false },
      );
      return;
    }

    // Increment/decrement follower and following counts
    const one = currFollow ? -1 : 1;
    console.log('UPDATING FOLLOWS');
    try {
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        { input: { PK, SK, numFollowers: one } },
      ));
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        { input: { PK: myPK, SK: mySK, numFollowing: one } },
      ));
      // Update app state with new num following count
      dispatch({
        type: 'SET_NUM_FOLLOWING',
        payload: { num: numFollowing + one },
      });
    } catch (err) {
      console.log(err);
    }
  };

  // Add followed user's posts to feed in batches
  const addPostsToFeed = async () => {
    const allPosts = reviewsForFeed.current;
    console.log(allPosts);
    if (allPosts.length) {
      let i; let j;
      const BATCH_NUM = 25; // DynamoDB batch requests are 25 items max
      for (i = 0, j = allPosts.length; i < j; i += BATCH_NUM) {
        const batch = allPosts.slice(i, i + BATCH_NUM);
        try {
          await API.graphql(graphqlOperation(
            batchCreateFollowingPosts,
            { input: { posts: batch } },
          ));
        } catch (err) {
          console.log("Error adding followed user's posts to feed", err);
        }
      }
    }
  };

  // Remove followed user's posts from feed in batches
  const removePostsFromFeed = async () => {
    const allPosts = reviewsToDelete.current;
    console.log(allPosts);
    if (allPosts.length) {
      let i; let j;
      const BATCH_NUM = 25; // DynamoDB batch requests are 25 items max
      for (i = 0, j = allPosts.length; i < j; i += BATCH_NUM) {
        const batch = allPosts.slice(i, i + BATCH_NUM);
        try {
          await API.graphql(graphqlOperation(
            batchDeleteFollowingPosts,
            { input: { posts: batch } },
          ));
        } catch (err) {
          console.log("Error removing followed user's posts from feed", err);
        }
      }
    }
  };

  return (
    <View style={containerStyle}>
      {!following
        && (
          <TouchableOpacity
            onPress={changeFollowingConfirmation}
            activeOpacity={0.6}
            style={{ width: '100%', height: '100%' }}
          >
            <LinearGradient
              colors={gradients.purple.colors}
              start={gradients.purple.start}
              end={gradients.purple.end}
              style={[containerStyle, { width: '100%' }]}
            >
              <Text style={[textStyle, { color: colors.white }]}>Follow</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      {following && (
        <TouchableOpacity
          style={[containerStyle, { backgroundColor: colors.gray3, width: '100%' }]}
          onPress={changeFollowingConfirmation}
          activeOpacity={0.6}
        >
          <Text style={[textStyle, { color: colors.black }]}>Following</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

FollowButton.propTypes = propTypes;

export default FollowButton;
