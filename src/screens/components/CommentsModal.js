import React, {
  useState, useRef, useEffect, useContext,
} from 'react';
import {
  StyleSheet, View, Text, TextInput, Animated, FlatList, Alert, TouchableOpacity, ActionSheetIOS,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { getPostCommentsQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import {
  createFeastItem, incrementFeastItem,
} from '../../graphql/mutations';
import SwipeDownModal from './util/SwipeDownModal';
import ProfilePic from './ProfilePic';
import getElapsedTime from '../../api/functions/GetElapsedTime';
import CenterSpinner from './util/CenterSpinner';
import { fetchCurrentUserUID } from '../../api/functions/FetchUserProfile';
import deleteCommentConfirmation from '../../api/functions/DeleteComment';
import { sendCommentNotif } from '../../api/functions/Notifications';
import { GET_POST_ID } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const CommentItem = ({ item, fetchUser, onMorePressed }) => {
  const {
    comment, uid, picture, name, actionTimestamp,
  } = item;
  const elapsedTime = getElapsedTime(actionTimestamp);
  const [activeStyle, setActiveStyle] = useState({});
  return (
    <TouchableOpacity
      style={[styles.commentItemContainer, { ...activeStyle }]}
      activeOpacity={1}
      onLongPress={() => {
        // setActiveStyle({ backgroundColor: colors.gray4 });
        onMorePressed(item);
      }}
    >
      <TouchableOpacity
        onPress={() => fetchUser({ uid })}
        activeOpacity={0.8}
        style={styles.profilePic}
      >
        <ProfilePic
          uid={uid}
          extUrl={picture}
          size={wp(7.8)}
          style={{ flex: 1 }}
        />
      </TouchableOpacity>
      <View style={styles.nameCommentContainer}>
        <View style={styles.nameTimeContainer}>
          <TouchableOpacity
            onPress={() => fetchUser({ uid })}
            activeOpacity={0.8}
          >
            <Text style={styles.nameText}>{name}</Text>
          </TouchableOpacity>
          <View style={styles.elapsedTimeContainer}>
            <Text style={styles.elapsedTimeText}>{elapsedTime}</Text>
          </View>
        </View>
        <Text
          style={styles.commentText}
        >
          {comment}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const COMMENT_CHAR_LIMIT = 256;

const CommentsModal = ({
  visible, setVisible, numComments, timestamp, uid, expoPushToken, placeId, imgUrl,
  currentComment, myUID, myName, myPicture, navigation, dispatch, startBarAnimation, myExpoPushToken,
}) => {
  const [{ user }] = useContext(Context);

  const inputAnim = useRef(new Animated.Value(0)).current;
  const inputTranslate = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -wp(80)],
  });
  function slideInput(up) {
    Animated.spring(inputAnim, {
      toValue: up,
      speed: 10,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  }

  const [comments, setComments] = useState(null);
  const currNextToken = useRef(null);
  const mounted = useRef(true);
  const disableInnerScroll = useRef(true);

  const fetchComments = async () => {
    if (!uid || !timestamp) return;
    const { promise, getValue, errorMsg } = getPostCommentsQuery(
      {
        uid, timestamp, currNextToken: currNextToken.current,
      },
    );
    const { postComments, nextToken } = await fulfillPromise(promise, getValue, errorMsg);
    if (mounted.current) {
      currNextToken.current = nextToken;
      if (postComments.length > 0) disableInnerScroll.current = false;
      setComments(postComments);
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchComments();
    return () => {
      mounted.current = false;
    };
  }, [timestamp, uid]);

  const flatlistRef = useRef(null);

  const [comment, setComment] = useState(currentComment.current.comment);
  const postComment = async () => {
    const commentToPost = comment.trim();
    if (commentToPost.length === 0) {
      return;
    }
    const date = new Date();
    const timeLocal = date.toISOString();
    const PK = `POST#${timestamp}#${uid}`;
    const commentInput = {
      PK,
      SK: `#COMMENT#${timeLocal}#${myUID}`,
      GSI1: `COMMENT#${uid}`,
      comment: commentToPost,
      placeId,
      timestamp,
      actionTimestamp: timeLocal,
      uid: myUID,
      name: myName,
      picture: myPicture,
      imgUrl,
      placeUserInfo: { uid },
    };

    // Post comment
    try {
      await API.graphql(graphqlOperation(
        createFeastItem,
        { input: commentInput },
      ));
    } catch (e) {
      console.warn('Error posting comment: ', e);
      Alert.alert(
        'Error',
        'Could not post comment. Please try again.',
        [{ text: 'OK' }],
        { cancelable: false },
      );
      return;
    }

    currentComment.current = { uid: null, timestamp: null, comment: '' };
    setComment('');
    fetchComments();
    if (flatlistRef.current && comments.length > 0) {
      flatlistRef.current.scrollToIndex({ index: 0, animated: true });
    }

    // Create comment count object if doesn't exist
    if (!numComments) {
      try {
        await API.graphql(graphqlOperation(
          createFeastItem,
          { input: { PK, SK: '#NUMCOMMENTS', count: 0 } },
        ));
      } catch (err) {
        // retry if not item exists error
        if (err.errors[0].errorType !== 'DynamoDB:ConditionalCheckFailedException') {
          try {
            await API.graphql(graphqlOperation(
              createFeastItem,
              { input: { PK, SK: '#NUMCOMMENTS', count: 0 } },
            ));
          } catch (err2) {
            console.warn('Error creating comment count object: ', err2);
          }
        }
      }
    }

    // Increment comment count
    try {
      await API.graphql(graphqlOperation(
        incrementFeastItem,
        { input: { PK, SK: '#NUMCOMMENTS', count: 1 } },
      ));
    } catch (err) {
      try {
        await API.graphql(graphqlOperation(
          incrementFeastItem,
          { input: { PK, SK: '#NUMCOMMENTS', count: 1 } },
        ));
      } catch (err2) {
        console.warn('Error incrementing comments count: ', err2);
      }
    }

    if (expoPushToken !== myExpoPushToken) {
      // send comment push notification
      sendCommentNotif({ commenter: myName, comment: commentToPost, expoPushToken });
    }

    dispatch({ type: 'SET_RELOAD_NUM_COMMENTS', payload: GET_POST_ID({ uid, timestamp }) });
  };

  const closeModalRef = useRef(() => { });

  const fetchUser = async ({ uid }) => {
    const currUser = await fetchCurrentUserUID({ fetchUID: uid, myUID: user.uid });
    closeModalRef.current();
    navigation.push(
      'ProfileStack',
      { screen: 'Profile', params: { user: currUser } },
    );
  };

  // Calculate scroll thresholds to animate between top/bottom or exit modal
  const topReached = useRef(true);
  const topThreshold = 5;
  const isCloseToTop = ({ layoutMeasurement, contentOffset, contentSize }) => {
    if (topReached.current && contentOffset.y > topThreshold) {
      topReached.current = false;
    }
    if (!topReached.current && contentOffset.y <= topThreshold) {
      topReached.current = true;
    }
  };

  const onMorePressed = (item) => {
    const myPost = uid === myUID;
    const myComment = item.uid === myUID;
    if (!myPost && !myComment) {
      return;
    }
    const options = ['Delete Comment'];
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ['Cancel', ...options],
        cancelButtonIndex: 0,
      },
      (index) => {
        const listIndex = index - 1;
        switch (listIndex) {
          case 0:
            deleteCommentConfirmation({
              item, myUID, fetchComments, closeModalRef, dispatch,
            });
            break;
          default:
            break;
        }
      },
    );
  };

  return (
    <SwipeDownModal
      modalVisible={visible}
      topReached={topReached}
      closeModalRef={closeModalRef}
      disableInnerScroll={disableInnerScroll}
      ContentModalStyle={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
      }}
      ContentModal={(
        <View style={styles.container}>
          <View style={styles.topTextContainer}>
            <Text style={styles.topText}>
              {numComments || 0}
              {' '}
              Comments
            </Text>
          </View>
          {comments === null && <CenterSpinner />}
          {comments && comments.length === 0 && (
            <View style={styles.noCommentsContainer}>
              <Text style={styles.noCommentsText}>
                Be the first to comment!
              </Text>
            </View>
          )}
          {comments && comments.length > 0 && (
            <FlatList
              ref={flatlistRef}
              data={comments}
              renderItem={({ item }) => (
                <CommentItem
                  item={item}
                  fetchUser={fetchUser}
                  onMorePressed={onMorePressed}
                />
              )}
              // scrollEnabled={comments && comments.length > 0}
              keyExtractor={(item) => `${item.actionTimestamp}${item.uid}`}
              showsVerticalScrollIndicator
              contentContainerStyle={{ paddingTop: wp(2), paddingBottom: wp(5) }}
              onScroll={({ nativeEvent }) => isCloseToTop(nativeEvent)}
            />
          )}
          <Animated.View
            style={[styles.bottomInputContainer, { transform: [{ translateY: inputTranslate }] }]}
          >
            <ProfilePic
              uid={user.uid}
              extUrl={user.picture}
              size={wp(7.8)}
              style={styles.profilePic}
            />
            <View style={{ flex: 0.85, marginRight: wp(3.5) }}>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setComment(text)}
                placeholder="Add a comment..."
                placeholderTextColor={colors.tertiary}
                returnKeyType="send"
                onFocus={() => slideInput(1)}
                onEndEditing={() => slideInput(0)}
                onSubmitEditing={postComment}
                blurOnSubmit
                value={comment || null}
                maxLength={COMMENT_CHAR_LIMIT}
                multiline
              />
            </View>
          </Animated.View>
        </View>
      )}
      onClose={() => {
        if (comment !== null) currentComment.current = { uid, timestamp, comment };
        if (startBarAnimation) startBarAnimation();
        setVisible(false);
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: wp(156),
    alignContent: 'center',
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    backgroundColor: '#fff',
  },
  topTextContainer: {
    marginTop: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: {
    fontFamily: 'Medium',
    fontSize: wp(3.5),
    letterSpacing: 0.5,
    color: colors.black,
    paddingTop: wp(0.5),
  },
  noCommentsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noCommentsText: {
    fontFamily: 'Book',
    fontSize: sizes.b3,
    color: colors.black,
  },
  bottomInputContainer: {
    height: wp(22),
    width: '100%',
    flexDirection: 'row',
    paddingTop: wp(2),
    backgroundColor: '#F6F6F6',
  },
  profilePic: {
    flex: 0.15,
    alignItems: 'center',
    marginTop: wp(1),
  },
  textInput: {
    width: '100%',
    alignSelf: 'flex-end',
    marginBottom: wp(10),
    height: wp(10),
    fontFamily: 'Book',
    fontSize: wp(4.1),
    letterSpacing: 0.3,
    backgroundColor: '#fff',
    paddingHorizontal: wp(3),
    paddingTop: wp(2.1),
    borderRadius: wp(2),
  },

  commentItemContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: wp(1.7),
  },
  nameCommentContainer: {
    flex: 0.85,
    alignItems: 'flex-start',
    marginRight: wp(3.5),
  },
  nameTimeContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: colors.black,
  },
  commentText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    color: colors.black,
    lineHeight: wp(5.7),
  },
  elapsedTimeContainer: {
    alignItems: 'center',
  },
  elapsedTimeText: {
    fontFamily: 'Book',
    fontSize: wp(3.5),
    color: colors.tertiary,
    opacity: 0.6,
    paddingRight: wp(2),
    paddingTop: 1,
  },
});

export default CommentsModal;
