import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform, TextInput,
} from 'react-native';
import Modal from 'react-native-modal';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, FlipType, SaveFormat } from 'expo-image-manipulator';
import { API, graphqlOperation } from 'aws-amplify';
import updateProfilePic from '../../api/functions/S3Storage';
import { updateFeastItem } from '../../api/graphql/mutations';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import ProfilePic from '../components/ProfilePic';
import Line from '../components/util/Line';
import CenterSpinner from '../components/util/CenterSpinner';
import { colors, sizes, wp } from '../../constants/theme';

const EditProfile = ({
  editPressed, setEditPressed, user, dispatch, deviceHeight,
}) => {
  const {
    picture, city, PK, SK, uid,
  } = user;
  const [photo, setPhoto] = useState(picture || null);
  const [displayCity, setDisplayCity] = useState(city || null);
  const isLocal = useRef(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    // Update profile picture
    if (picture !== photo) {
      // Store new user profile photo in S3 and DynamoDB
      const newPicture = await updateProfilePic(PK, SK, uid, photo);
      if (newPicture) {
        dispatch({ type: 'SET_USER', payload: { ...user, picture: newPicture } });
      } else {
        setError('Error updating profile picture');
        return;
      }
    }
    // Updated user city
    if (city !== displayCity) {
      try {
        await API.graphql(graphqlOperation(
          updateFeastItem,
          { input: { PK, SK, city: displayCity } },
        ));
        dispatch({ type: 'SET_USER', payload: { ...user, city: displayCity } });
      } catch (err) {
        console.warn('Error updating user city', err);
        setError('Error updating city');
        return;
      }
    }
    setLoading(false);
    hideModal();
  }

  const hideModal = () => {
    setError(null);
    isLocal.current = false;
    setPhoto(picture || null);
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
      deviceHeight={deviceHeight}
      style={{ margin: 0, justifyContent: 'flex-end' }}
    >
      <DismissKeyboardView style={styles.container}>
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
        <View style={styles.centerContainer}>
          <View style={styles.inputContainer}>
            <Text style={styles.textInputTitle}>
              Location
            </Text>
            <View>
              <TextInput
                style={styles.textInput}
                onChangeText={(text) => setDisplayCity(text)}
                placeholder="Ex: Atlanta, GA"
                placeholderTextColor={`${colors.tertiary}70`}
                clearButtonMode="while-editing"
                value={displayCity || null}
                maxLength={50}
              />
              <Line length={INPUT_WIDTH} color={colors.tertiary} />
            </View>
          </View>
        </View>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: '#fff' }]}
            onPress={hideModal}
          >
            <Text style={[styles.actionText, { color: colors.black }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: colors.black }]}
            onPress={() => saveEdits()}
          >
            {!loading && <Text style={[styles.actionText, { color: '#fff' }]}>Save</Text>}
            {loading && <CenterSpinner />}
          </TouchableOpacity>
        </View>
        <View style={{ flex: 0.1 }}>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </DismissKeyboardView>
    </Modal>
  );
};

const INPUT_WIDTH = wp(55);
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '90%',
    alignContent: 'center',
    borderTopLeftRadius: wp(4),
    borderTopRightRadius: wp(4),
    backgroundColor: '#fff',
  },
  topRectangle: {
    alignSelf: 'center',
    width: wp(10),
    height: wp(1.2),
    marginVertical: wp(4),
    borderRadius: wp(0.6),
    backgroundColor: colors.black,
  },
  pfpContainer: {
    paddingTop: wp(1),
    flex: 0.3,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: wp(2.8),
  },
  userPicture: {
    width: wp(26),
    height: wp(26),
    borderRadius: wp(26) / 2,
    marginBottom: wp(4),
  },
  changePfpText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    color: colors.accent,
  },
  centerContainer: {
    flex: 0.5,
    padding: wp(7),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputTitle: {
    width: wp(21),
    fontFamily: 'Semi',
    fontSize: sizes.h4,
    color: colors.black,
    marginRight: wp(3.8),
    textAlign: 'center',
  },
  textInput: {
    height: wp(8.3),
    width: INPUT_WIDTH,
    fontFamily: 'Book',
    fontSize: sizes.b1,
    color: colors.black,
    letterSpacing: 0.1,
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
    marginTop: wp(4),
    color: 'red',
    fontFamily: 'Book',
    fontSize: sizes.b2,
    textAlign: 'center',
  },
});

export default EditProfile;
