import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { getPostYumsQuery } from '../../../api/functions/queryFunctions';
import { createFeastItem, deleteFeastItem } from '../../../api/graphql/mutations';
import Yum from './icons/Yum';
import YumNoFill from './icons/YumNoFill';
import { sizes, wp } from '../../../constants/theme';

const YumButton = ({
  size, uid, timestamp, placeId, myUID, myPK, myName,
  myPicture, showYummedUsersModal, stopBarAnimation,
}) => {
  const [pressed, setPressed] = useState(false);
  const [yums, setYums] = useState([]);

  useEffect(() => {
    // Fetch yums
    (async () => {
      const yumsItems = await getPostYumsQuery({ uid, timestamp });
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
        setYums(yumsItems);
        setPressed(yummed);
      }
    })();
  }, [myUID, placeId, timestamp, uid]);

  const yumPressed = async () => {
    const input = {
      PK: myPK,
      SK: `#YUMPOST#${timestamp}#${uid}`,
      GSI1: `YUMPOST#${uid}`,
      placeId,
      timestamp,
      uid: myUID,
      name: myName,
      picture: myPicture,
      placeUserInfo: {
        uid,
      },
    };

    if (pressed) {
      // Delete yum
      setYums([...yums.slice(0, -1)]); // Remove yum from array
      try {
        await API.graphql(graphqlOperation(
          deleteFeastItem,
          { input: { PK: input.PK, SK: input.SK } },
        ));
      } catch (err) {
        console.warn('Error deleting yum: ', err);
      }
    } else {
      // Create yum
      setYums([...yums, input]); // Add yum to array
      try {
        await API.graphql(graphqlOperation(
          createFeastItem,
          { input },
        ));
      } catch (err) {
        console.warn('Error creating yum: ', err);
      }
    }

    setPressed(!pressed);
  };

  const showYummedUsersModalPressed = () => {
    stopBarAnimation();
    showYummedUsersModal({ users: yums });
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
          {!pressed && <YumNoFill size={size} />}
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={showYummedUsersModalPressed}
        disabled={!yums.length}
        activeOpacity={0.6}
      >
        <Text style={styles.bottomButtonText}>
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
  },
});

export default YumButton;
