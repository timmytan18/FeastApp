import React, { useState, useRef, useContext } from 'react';
import {
  View, TouchableOpacity, Text, Alert,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { LinearGradient } from 'expo-linear-gradient';
import PropTypes from 'prop-types';
import { getFollowingPostsByUserQuery, getUserPostsQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import {
  createFeastItem, deleteFeastItem, incrementFeastItem,
  batchCreateFollowingPosts, batchDeleteFollowingPosts,
} from '../../api/graphql/mutations';
import TwoButtonAlert from './util/TwoButtonAlert';
import { Context } from '../../Store';
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
};

const ADDED_ATTR = [];

const FollowButton = ({
  currentUser, myUser, containerStyle, textStyle,
}) => {
  // Destructure current user (profile user is viewing) object
  const {
    PK, SK, uid, name, username, identityId,
  } = currentUser;
  let picture = null;
  if (currentUser.picture) {
    picture = currentUser.picture;
  }

  const [{ bannedUsers }, dispatch] = useContext(Context);

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

  const getUserPosts = async () => {
    const { promise, getValue, errorMsg } = getUserPostsQuery({
      PK, withUserInfo: false,
    });
    const userReviews = await fulfillPromise(promise, getValue, errorMsg);
    const updatedReviews = [];
    userReviews.forEach((review) => {
      updatedReviews.push({
        ...review,
        PK: myPK,
        SK: `#FOLLOWINGPOST#${review.timestamp}#${uid}`,
        LSI1: `#FOLLOWINGPOST#${review.geo}`,
        LSI2: `#FOLLOWINGPOST#${review.placeId}#${review.timestamp}`,
        LSI3: `#FOLLOWINGPOST#${uid}`,
        placeUserInfo: {
          name,
          uid,
          picture,
          identityId,
        },
      });
      ADDED_ATTR.forEach((attr) => {
        delete updatedReviews[updatedReviews.length - 1][attr];
      });
    });
    reviewsForFeed.current = updatedReviews;
  };

  const changeFollowingConfirmation = async () => {
    if (following) {
      const { promise, getValue, errorMsg } = getFollowingPostsByUserQuery(
        { PK: myPK, followingUID: uid },
      );
      reviewsToDelete.current = await fulfillPromise(promise, getValue, errorMsg);
      TwoButtonAlert({
        title: `Unfollow ${currentUser.name}?`,
        yesButton: 'Confirm',
        pressed: () => {
          changeFollowing(true);
          removePostsFromFeed();
        },
      });
    } else {
      await getUserPosts();
      changeFollowing(false);
      addPostsToFeed();
    }
  };

  const changeFollowing = async (currFollow) => {
    // Add following/unfollowing to DB
    setFollowing(!currFollow);
    const date = new Date();
    const timestamp = date.toISOString();
    const mutation = currFollow ? deleteFeastItem : createFeastItem;
    const input = currFollow
      ? { PK, SK: `#FOLLOWER#${myID}` }
      : {
        PK,
        SK: `#FOLLOWER#${myID}`,
        LSI1: `#FOLLOWTIME#${timestamp}`,
        GSI1: 'USER#',
        name,
        username,
        ...(picture && { picture }),
        identityId,
        uid,
        follower,
      };
    try {
      await API.graphql(graphqlOperation(
        mutation,
        { input },
      ));
    } catch (err) {
      setFollowing(currFollow);
      console.warn('Error changing following status: ', err);
      Alert.alert(
        'Error',
        `Could not ${currFollow ? 'unfollow' : 'follow'} user`,
        [{ text: 'OK' }],
        { cancelable: false },
      );
      return;
    }

    // Increment/decrement follower and following counts
    const one = currFollow ? -1 : 1;
    try {
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        { input: { PK, SK, numFollowers: one } },
      ));
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        { input: { PK: myPK, SK: mySK, numFollowing: one } },
      ));
      // Update app state to trigger map & profile re-render
      dispatch({ type: 'SET_RELOAD_MAP' });
      dispatch({ type: 'SET_RELOAD_PROFILE' });
    } catch (err) {
      console.warn('Error update follower/following counts: ', err);
    }
  };

  // Add followed user's posts to feed in batches
  const addPostsToFeed = async () => {
    const allPosts = reviewsForFeed.current;
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
          console.warn("Error adding followed user's posts to feed: ", err);
          changeFollowing(true);
          removePostsFromFeed();
          Alert.alert(
            'Error',
            'Could not follow user',
            [{ text: 'OK' }],
            { cancelable: false },
          );
        }
      }
    }
  };

  // Remove followed user's posts from feed in batches
  const removePostsFromFeed = async () => {
    const allPosts = reviewsToDelete.current;
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
          console.warn("Error removing followed user's posts from feed: ", err);
        }
      }
    }
  };

  const banned = bannedUsers.has(uid);
  return (
    <View style={[containerStyle, banned && { opacity: 0.5 }]}>
      {!following
        && (
          <TouchableOpacity
            onPress={changeFollowingConfirmation}
            activeOpacity={0.6}
            style={{ width: '100%', height: '100%' }}
            disabled={banned}
          >
            <LinearGradient
              colors={gradients.purple.colors}
              start={gradients.purple.start}
              end={gradients.purple.end}
              style={[containerStyle, { width: '100%' }]}
            >
              <Text style={[textStyle, { color: '#fff' }]}>Follow</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      {following && (
        <TouchableOpacity
          style={[containerStyle, { backgroundColor: colors.gray3, width: '100%' }]}
          onPress={changeFollowingConfirmation}
          activeOpacity={0.6}
          disabled={banned}
        >
          <Text style={[textStyle, { color: colors.black }]}>Following</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

FollowButton.propTypes = propTypes;

export default FollowButton;
