import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, Image,
} from 'react-native';
import { Storage } from 'aws-amplify';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import updateProfilePic from '../../api/functions/S3Storage';
import ProfilePic from '../components/ProfilePic';
import {
  colors, gradients, sizes, wp, hp, shadows,
} from '../../constants/theme';

const EditProfile = ({
  editPressed, setEditPressed, user, dispatch,
}) => {
  const [photo, setPhoto] = useState(user.picture ? user.picture : null);
  const isLocal = useRef(false);
  const [error, setError] = useState(null);

  // Resize and compress photo
  async function resize(image) {
    const manipResult = await manipulateAsync(
      image.localUri || image.uri,
      [
        { resize: { height: 200, width: 200 } },
      ],
      { compress: 0.5 },
    );
    isLocal.current = true;
    setPhoto(manipResult.uri);
  }

  // Open camera roll to choose a photo
  const choosePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to update your profile picture!');
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.cancelled) {
      resize(result);
    }
  };

  async function saveEdits() {
    if (user.picture !== photo) {
      // Store new user profile photo in S3 and DynamoDB
      const newPicture = await updateProfilePic(user.PK, user.SK, user.uid, photo);
      if (newPicture) {
        dispatch({ type: 'SET_USER', payload: { ...user, picture: newPicture } });
      }
    }
    hideModal();
  }

  const hideModal = () => {
    setError(null);
    isLocal.current = false;
    setPhoto(user.picture ? user.picture : null);
    setEditPressed(false);
  };

  return (
    <Modal
      isVisible={editPressed}
      backdropOpacity={0.5}
      backdropTransitionOutTiming={0}
      swipeDirection="down"
      onSwipeComplete={hideModal}
      onBackdropPress={hideModal}
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <View style={styles.container}>
        <View style={styles.topRectangle} />
        <View style={styles.pfpContainer}>
          <View style={[styles.userPicture]}>
            <ProfilePic
              extUrl={photo}
              isMe
              isLocal={isLocal.current}
              size={styles.userPicture.width}
              style={styles.userPicture}
            />
          </View>
          <TouchableOpacity onPress={choosePhoto}>
            <Text style={styles.changePfpText}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 0.5 }} />
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: colors.white }]}
            onPress={hideModal}
          >
            <Text style={[styles.actionText, { color: colors.black }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: colors.black }]}
            onPress={() => saveEdits()}
          >
            <Text style={[styles.actionText, { color: colors.white }]}>Save</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 0.1 }}>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '90%',
    alignContent: 'center',
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    backgroundColor: 'white',
  },
  topRectangle: {
    alignSelf: 'center',
    width: wp(10),
    height: wp(1.2),
    marginVertical: hp(2),
    borderRadius: wp(0.6),
    backgroundColor: colors.black,
  },
  pfpContainer: {
    paddingTop: wp(1),
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: hp(1.4),
  },
  userPicture: {
    width: wp(26),
    height: wp(26),
    borderRadius: wp(26) / 2,
    marginBottom: hp(2),
  },
  changePfpText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    color: colors.accent,
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '65%',
    justifyContent: 'space-between',
    alignSelf: 'center',
  },
  actionButton: {
    height: wp(11),
    width: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: wp(3),
  },
  actionText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
  },
  errorText: {
    alignSelf: 'center',
    marginTop: hp(2),
    color: 'red',
    fontFamily: 'Book',
    fontSize: sizes.b2,
    textAlign: 'center',
  },
});

export default EditProfile;
