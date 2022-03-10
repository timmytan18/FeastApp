import { Alert } from 'react-native';
import {
  API, Storage, graphqlOperation,
} from 'aws-amplify';
import {
  getFollowersQuery,
  getPostYumsQuery,
  getAllSavedPostItemsQuery,
  fulfillPromise,
} from './queryFunctions';
import { deleteFeastItem, batchDeleteFollowingPosts, incrementFeastItem } from '../graphql/mutations';
import TwoButtonAlert from '../../screens/components/util/TwoButtonAlert';

const deletePostConfirmation = ({
  posterUID, timestamp, picture, placeId, rating, dispatch, setLoading, myPK, myUID, onComplete,
}) => {
  if (posterUID !== myUID) return;
  TwoButtonAlert({
    title: 'Delete Post',
    yesButton: 'Confirm',
    pressed: async () => {
      await deletePost({
        currTimestamp: timestamp,
        s3Key: picture,
        currPlaceId: placeId,
        currRating: rating,
        dispatch,
        setLoading,
        myPK,
        myUID,
        onComplete,
      });
    },
  });
};

const deletePost = async ({
  currTimestamp, s3Key, currPlaceId, currRating, dispatch, setLoading, myPK, myUID, onComplete,
}) => {
  setLoading(true);

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
          PK: `PLACE#${currPlaceId}`, SK: ratingSK, count: -1, sum: -currRating,
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

  // Update app state to trigger map re-render
  dispatch({ type: 'SET_RELOAD_MAP' });
  setLoading(false);

  if (onComplete) onComplete();
};

export default deletePostConfirmation;
