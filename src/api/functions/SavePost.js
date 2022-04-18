import { Alert } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { getUserAllSavedPostsQuery, fulfillPromise } from './queryFunctions';
import { createFeastItem, updateFeastItem, deleteFeastItem } from '../../graphql/mutations';
import { GET_SAVED_POST_ID } from '../../constants/constants';

const savePost = async ({
  isSaved, dispatch, post, place, myUID,
}) => {
  const {
    placeId,
    timestamp,
    name,
    picture,
    dish,
    rating,
    review,
    placeUserInfo,
  } = post;

  const {
    geo,
    placeInfo: {
      categories,
      imgUrl,
    },
  } = place ?? { placeInfo: {} };

  const savedPostInput = {
    PK: `USER#${myUID}`,
    SK: `#SAVEDPOST#${timestamp}#${placeUserInfo.uid}`,
    LSI1: `#SAVEDPOST#${geo}`,
    LSI2: `#SAVEDPOST#${placeId}#${timestamp}`,
    GSI1: 'SAVEDPOST#',
    placeId,
    timestamp,
    name,
    picture,
    dish,
    geo,
    categories,
    rating,
    review,
    imgUrl,
    placeUserInfo,
  };

  if (!isSaved) {
    // Save post
    try {
      await API.graphql(graphqlOperation(
        createFeastItem,
        { input: savedPostInput },
      ));
    } catch (e) {
      try {
        await API.graphql(graphqlOperation(
          updateFeastItem,
          { input: savedPostInput },
        ));
      } catch (e2) {
        console.warn('Error saving post to saved posts: ', e2);
        Alert.alert(
          'Error',
          'Could not save post. Please try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
      }
    }
  } else {
    // Unsave post
    const { PK, SK } = savedPostInput;
    try {
      await API.graphql(graphqlOperation(
        deleteFeastItem,
        { input: { PK, SK } },
      ));
    } catch (err) {
      console.warn('Error deleting post from saved post:', err);
      Alert.alert(
        'Error',
        'Could not unsave post. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false },
      );
    }
  }
  updateSavedPosts({ dispatch, PK: savedPostInput.PK });
};

const updateSavedPosts = async ({ dispatch, PK }) => {
  // Get all saved posts
  const { promise, getValue, errorMsg } = getUserAllSavedPostsQuery({
    PK, noDetails: true,
  });
  const savedPosts = await fulfillPromise(promise, getValue, errorMsg);
  const savedPostsIds = savedPosts.map(
    ({
      placeUserInfo: { uid },
      timestamp: currTimeStamp,
    }) => GET_SAVED_POST_ID({ uid, timestamp: currTimeStamp }),
  );
  dispatch({
    type: 'SET_SAVED_POSTS',
    payload: { savedPosts: new Set(savedPostsIds) },
  });
};

export default savePost;
