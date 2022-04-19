import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { getPostYumsQuery, getUserExpoPushTokenQuery, fulfillPromise } from '../../../api/functions/queryFunctions';
import { createFeastItem, deleteFeastItem } from '../../../api/graphql/mutations';
import { sendYumNotif } from '../../../api/functions/Notifications';
import Yum from './icons/Yum';
import YumNoFill from './icons/YumNoFill';
import {
  colors, sizes, shadows, wp,
} from '../../../constants/theme';

const YumButton = ({
  size, uid, timestamp, placeId, expoPushToken, myUID, myPK, myName, myPicture, myExpoPushToken,
  picture, showYummedUsersModal, stopBarAnimation, light, small, openYums, refresh,
}) => {
  const [pressed, setPressed] = useState(false);
  const [yums, setYums] = useState([]);
  const mounted = useRef(true);

  // Get yums for this post
  const fetchYums = async () => {
    const { promise, getValue, errorMsg } = await getPostYumsQuery({ uid, timestamp });
    const yumsItems = await fulfillPromise(promise, getValue, errorMsg);
    if (yumsItems) {
      // Check if user has yummed
      let yummed = false;
      for (let i = 0; i < yumsItems.length; i += 1) {
        if (yumsItems[i].uid === myUID) {
          // swap user yum item with last item in array
          [yumsItems[i], yumsItems[yumsItems.length - 1]] = [
            yumsItems[yumsItems.length - 1], yumsItems[i],
          ];
          yummed = true;
          break;
        }
      }
      if (mounted.current) {
        setYums(yumsItems);
        setPressed(yummed);
        if (openYums) {
          showYummedUsersModalPressed({ yumsItems });
        }
      }
    }
  };

  useEffect(() => {
    mounted.current = true;
    fetchYums();
    return () => { mounted.current = false; };
  }, [myUID, placeId, timestamp, uid, refresh]);

  const yumPressed = async () => {
    const date = new Date();
    const timeLocal = date.toISOString();
    const currPressed = pressed;
    setPressed(!currPressed);
    const input = {
      PK: myPK,
      SK: `#YUMPOST#${timestamp}#${uid}`,
      GSI1: `YUMPOST#${uid}`,
      GSI2: `YUMPOST#${uid}`,
      LSI1: `#YUMTIME#${timeLocal}`,
      placeId,
      timestamp,
      uid: myUID,
      name: myName,
      picture: myPicture,
      imgUrl: picture,
      placeUserInfo: {
        uid,
      },
    };

    if (currPressed) {
      // Delete yum
      setYums([...yums.slice(0, -1)]); // Remove yum from array
      try {
        await API.graphql(graphqlOperation(
          deleteFeastItem,
          { input: { PK: input.PK, SK: input.SK } },
        ));
      } catch (err) {
        console.warn('Error deleting yum: ', err);
        fetchYums();
      }
    } else {
      // Create yum
      setYums([...yums, input]); // Add yum to array
      try {
        await API.graphql(graphqlOperation(
          createFeastItem,
          { input },
        ));
        if (!expoPushToken) {
          const {
            promise, getValue, errorMsg,
          } = getUserExpoPushTokenQuery({ uid });
          expoPushToken = await fulfillPromise(promise, getValue, errorMsg);
        }
        if (expoPushToken !== myExpoPushToken) {
          // send yum push notification
          sendYumNotif({ yummer: myName, expoPushToken });
        }
      } catch (err) {
        console.warn('Error creating yum: ', err);
        fetchYums();
      }
    }
  };

  const showYummedUsersModalPressed = ({ yumsItems }) => {
    if (stopBarAnimation) stopBarAnimation();
    showYummedUsersModal({ users: yumsItems || yums });
  };

  return (
    <View style={styles.buttonContainer}>
      <View style={styles.container}>
        <TouchableOpacity
          style={{ width: '100%' }}
          activeOpacity={0.9}
          onPress={yumPressed}
        >
          {pressed && <Yum size={size} />}
          {!pressed && <YumNoFill size={size} color={light ? 'rgba(176, 187, 199, 0.6)' : null} />}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={showYummedUsersModalPressed}
        disabled={!yums.length}
        activeOpacity={0.6}
      >
        <Text style={[
          styles.bottomButtonText,
          yums.length === 0 && { fontFamily: 'Book' },
          small && { color: colors.tertiary, paddingTop: 0 },
          yums.length && { textDecorationLine: 'underline' }]}
        >
          {yums.length}
          {' '}
          {yums.length === 1 ? 'Yum' : 'Yums'}
        </Text>
      </TouchableOpacity>
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
    fontFamily: 'Medium',
    color: '#fff',
    paddingTop: wp(0.7),
    ...shadows.lighter,
  },
});

export default YumButton;
