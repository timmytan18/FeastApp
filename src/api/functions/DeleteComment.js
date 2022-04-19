import { Alert } from 'react-native';
import {
  API, graphqlOperation,
} from 'aws-amplify';
import { deleteFeastItem, batchDeleteFollowingPosts, incrementFeastItem } from '../graphql/mutations';
import TwoButtonAlert from '../../screens/components/util/TwoButtonAlert';
import { GET_POST_ID } from '../../constants/constants';

const deleteCommentConfirmation = ({
  item, myUID, fetchComments, closeModalRef, dispatch,
}) => {
  const {
    timestamp,
    uid: commenterUID,
    actionTimestamp,
    placeUserInfo: { uid: posterUID },
  } = item;
  const PK = `POST#${timestamp}#${posterUID}`;
  const SK = `#COMMENT#${actionTimestamp}#${commenterUID}`;
  if (posterUID !== myUID && commenterUID !== myUID) return;
  TwoButtonAlert({
    title: 'Delete Comment',
    yesButton: 'Confirm',
    pressed: async () => {
      await deleteComment({
        PK,
        SK,
      });
      fetchComments();
      Alert.alert(
        'Comment Deleted',
        '',
        [{ text: 'OK' }],
        { cancelable: false },
      );
      dispatch({ type: 'SET_RELOAD_NUM_COMMENTS', payload: GET_POST_ID({ uid: posterUID, timestamp }) });
      closeModalRef.current();
    },
  });
};

const deleteComment = async ({
  PK, SK,
}) => {
  // Delete post from user's profile
  const input = { PK, SK };
  try {
    await API.graphql(graphqlOperation(
      deleteFeastItem,
      { input },
    ));
  } catch (err) {
    console.warn('Error deleting comment: ', err);
    Alert.alert(
      'Error',
      'Could not delete post',
      [{ text: 'OK' }],
      { cancelable: false },
    );
    return;
  }

  // Decrement comment count
  try {
    await API.graphql(graphqlOperation(
      incrementFeastItem,
      { input: { PK, SK: '#NUMCOMMENTS', count: -1 } },
    ));
  } catch (err) {
    try {
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        { input: { PK, SK: '#NUMCOMMENTS', count: -1 } },
      ));
    } catch (err2) {
      console.warn('Error decrementing comments count: ', err2);
    }
  }
};

export default deleteCommentConfirmation;
