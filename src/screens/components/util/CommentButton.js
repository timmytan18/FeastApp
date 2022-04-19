import React, {
  useState, useRef, useEffect, useContext,
} from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import { getPostNumCommentsQuery, fulfillPromise } from '../../../api/functions/queryFunctions';
import Comment from './icons/Comment';
import { GET_POST_ID } from '../../../constants/constants';
import { Context } from '../../../Store';
import {
  colors, sizes, shadows, wp,
} from '../../../constants/theme';

const CommentButton = ({
  openComments, uid, expoPushToken, timestamp, placeId, imgUrl, size, small, light, refresh, dispatch,
}) => {
  const [{ reloadNumCommentsId }] = useContext(Context);

  const [numComments, setNumComments] = useState(0);
  const mounted = useRef(true);

  const getNumComments = async () => {
    const { promise, getValue, errorMsg } = getPostNumCommentsQuery({ uid, timestamp });
    const currNumComments = await fulfillPromise(promise, getValue, errorMsg);
    if (currNumComments !== null && mounted.current) {
      setNumComments(currNumComments);
    }
  };

  useEffect(() => {
    mounted.current = true;
    // Get number of comments for post
    getNumComments();
    return () => { mounted.current = false; };
  }, [timestamp, uid, refresh]);

  useEffect(() => {
    mounted.current = true;
    // Get number of comments for post if it has changed
    if (reloadNumCommentsId !== null
      && reloadNumCommentsId === GET_POST_ID({ uid, timestamp })) {
      getNumComments();
      dispatch({ type: 'SET_RELOAD_NUM_COMMENTS', payload: null });
    }
    return () => { mounted.current = false; };
  }, [reloadNumCommentsId]);

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      activeOpacity={0.4}
      onPress={() => openComments({
        uid, expoPushToken, timestamp, numComments, placeId, imgUrl,
      })}
    >
      <View style={styles.container}>
        <Comment size={size || (small ? wp(8.5) : wp(10.8))} color={light ? colors.gray : '#fff'} />
      </View>
      <Text style={[
        styles.bottomButtonText,
        small && { color: colors.tertiary }]}
      >
        {numComments}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontSize: sizes.b3,
    fontFamily: 'Book',
    color: '#fff',
    marginTop: -1.5,
    ...shadows.lighter,
  },
});

export default CommentButton;
