import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text, Alert,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { getUserAllSavedPostsQuery, fulfillPromise } from '../../../api/functions/queryFunctions';
import { createFeastItem, updateFeastItem, deleteFeastItem } from '../../../graphql/mutations';
import { GET_SAVED_POST_ID } from '../../../constants/constants';
import Save from './icons/Save';
import { colors, sizes, wp } from '../../../constants/theme';

const SaveButton = ({
  isSaved, dispatch, size, post, place, myUID, stopBarAnimation, startBarAnimation, light, small,
}) => {
  const [pressed, setPressed] = useState(isSaved);
  useEffect(() => {
    setPressed(isSaved);
  }, [isSaved]);

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

  const savePressed = async () => {
    const currSaved = !pressed;
    setPressed(currSaved);
    if (currSaved) {
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
          if (stopBarAnimation) stopBarAnimation();
          setPressed(!currSaved);
          Alert.alert(
            'Error',
            'Could not save post. Please try again.',
            [{ text: 'OK', onPress: () => { if (startBarAnimation) startBarAnimation(); } }],
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
        if (stopBarAnimation) stopBarAnimation();
        setPressed(!currSaved);
        Alert.alert(
          'Error',
          'Could not unsave post. Please try again.',
          [{ text: 'OK', onPress: () => { if (startBarAnimation) startBarAnimation(); } }],
          { cancelable: false },
        );
      }
    }
    updateSavedPosts();
  };

  const updateSavedPosts = async () => {
    // Get all saved posts
    const { promise, getValue, errorMsg } = getUserAllSavedPostsQuery({
      PK: savedPostInput.PK, noDetails: true,
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

  return (
    <View style={styles.buttonContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.9} onPress={savePressed} disabled={geo === null}>
          <Save size={size} color={pressed ? colors.accent : light ? 'rgba(176, 187, 199, 0.6)' : '#464A4F'} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.bottomButtonText, small && { color: colors.tertiary, paddingTop: 0 }]}>
        {pressed ? 'Unsave' : 'Save'}
      </Text>
    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomButtonText: {
    fontSize: sizes.b3,
    fontFamily: 'Book',
    color: '#fff',
    paddingTop: wp(0.6),
  },
});

export default SaveButton;
