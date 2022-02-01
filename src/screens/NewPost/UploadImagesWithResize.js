import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Animated, Image, FlatList, PanResponder,
} from 'react-native';
import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { Auth } from 'aws-amplify';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { getPlaceInDBQuery } from '../../api/functions/queryFunctions';
import TwoButtonAlert from '../components/util/TwoButtonAlert';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import NextArrow from '../components/util/icons/NextArrow';
import FlipCam from '../components/util/icons/FlipCam';
import Flash from '../components/util/icons/Flash';
import FlashOff from '../components/util/icons/FlashOff';
import X from '../components/util/icons/X';
import Cam from '../components/util/icons/Cam';
import Library from '../components/util/icons/Library';
import Dish from '../components/util/icons/Dish';
import {
  colors, sizes, header, wp, hp,
} from '../../constants/theme';

const propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      business: PropTypes.shape({
        placeId: PropTypes.string,
        geocodePoints: PropTypes.arrayOf(
          PropTypes.shape({
            coordinates: PropTypes.arrayOf(PropTypes.number),
          }),
        ),
        Address: PropTypes.shape({
          locality: PropTypes.string, // city
          adminDistrict: PropTypes.string, // state
          countryRegion: PropTypes.string,
          addressLine: PropTypes.string,
          postalCode: PropTypes.string,
        }),
        name: PropTypes.string,
      }),
    }),
  }).isRequired,
};

const API_GATEWAY_ENDPOINT = 'https://fyjcth1v7d.execute-api.us-east-2.amazonaws.com/dev/scraper';

const UploadImages = ({ navigation, route }) => {
  // FIND BUSINESS IN DYNAMO
  const { business } = route.params;

  const placeExists = useRef(false);
  const placeCategories = useRef(null);

  // Fetch place from DB if exists, if not, scrape and create new place
  useEffect(() => {
    // Destructure place attributes
    const {
      placeId,
      name,
      Address: {
        locality: city, // city
        adminDistrict: region, // state
        countryRegion: country,
        addressLine: address,
        postalCode: postcode,
      },
      geocodePoints: [{ coordinates: [placeLat, placeLng] }],
    } = business;

    const placePK = `PLACE#${placeId}`;
    // Remove nonalphanumeric chars from name (spaces, punctionation, underscores, etc.)
    const strippedName = name.replace(/[^0-9a-z]/gi, '').toLowerCase();
    const hash = geohash.encode(placeLat, placeLng);

    // Send place data to API Gateway for lambda function to scrape
    async function createPlaceItem() {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const token = cognitoUser.signInUserSession.idToken.jwtToken;
      const data = {
        placeId,
        geohash: hash,
        strippedName,
        name,
        address,
        city,
        region,
        zip: postcode,
        country,
      };
      console.log(JSON.stringify(data));

      try {
        await fetch(API_GATEWAY_ENDPOINT, {
          method: 'PUT',
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
      } catch (e) {
        console.warn('Error running scraper: ', e);
      }
    }

    // Check if place exists in DynamoDB
    async function checkPlaceInDB() {
      try {
        const { placeInDB, categoriesDB } = await getPlaceInDBQuery(
          { placePK, withCategories: true },
        );
        if (!placeInDB) {
          // Scrape data on screen load if place does not exist
          createPlaceItem();
        } else {
          console.log('Place already in DB');
          placeExists.current = true;
          placeCategories.current = categoriesDB;
        }
      } catch (e) {
        console.warn('Error fetching Dynamo place data: ', e);
      }
    }

    // Check if place in DB and fetch categories when component mounts
    if (!placeExists.current) {
      checkPlaceInDB();
    }
  }, [business]);

  // Tab
  const CAMERA_TAB = 'camera';
  const LIBRARY_TAB = 'library';
  const [tab, setTab] = useState(CAMERA_TAB);

  // Camera
  const camera = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);

  // Library
  const [hasLibraryPermission, setHasLibraryPermission] = useState(null);
  const [libraryPreview, setLibraryPreview] = useState(null);

  // Picture
  const [picture, setPicture] = useState(null);
  const pictureToEdit = useRef(null);
  const [editorVisible, setEditorVisible] = useState(false);

  // Menu item input
  const [menuItem, setMenuItem] = useState(null);
  const inputAnim = useRef(new Animated.Value(0)).current;
  const inputTranslate = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -hp(18)],
  });
  function slideInput(up) {
    Animated.spring(inputAnim, {
      toValue: up,
      speed: 10,
      useNativeDriver: true,
    }).start();
  }

  const pan = useRef(new Animated.ValueXY()).current;
  const currOffset = useRef(0);
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
        // console.log(currOffset.current + gestureState.dy);
        // console.log(pictureToEdit.current.height - wp(99));
        // if (currOffset.current + gestureState.dy <= 0
        //   && (currOffset.current + gestureState.dy) >= (-1
        //     * ((pictureToEdit.current.height / pictureToEdit.current.width) * wp(99) - wp(99)))) {

        // }

        pan.setValue({ x: 0, y: currOffset.current + gestureState.dy });
      },
      onPanResponderRelease: (evt, gestureState) => {
        const bottom = -1
          * ((pictureToEdit.current.height / pictureToEdit.current.width)
            * wp(99) - wp(99));
        console.log('bottom', bottom);
        console.log('value', currOffset.current + pan.y._value);
        if (currOffset.current + pan.y._value > 0) {
          console.log('top');
          currOffset.current = 0;
          pan.setValue({ x: 0, y: 0 });
        } else if (currOffset.current + pan.y._value < bottom) {
          console.log('bottom');
          currOffset.current = bottom + pan.y._value;
          pan.setValue({ x: 0, y: bottom });
        } else {
          console.log('middle');
          currOffset.current = pan.y._value;
        }
        // if (currOffset.current + pan.y._value <= 0
        //   && (currOffset.current + pan.y._value) >= (-1
        //     * ((pictureToEdit.current.height / pictureToEdit.current.width) * wp(99) - wp(99)))) {
        //   currOffset.current = pan.y._value;
        // }
      },
    }),
  ).current;

  // Set navigation with button, set header title to place name
  useEffect(() => {
    const headerRight = () => (
      <TouchableOpacity
        style={[styles.nextButtonContainer, { opacity: picture ? 1 : 0.5 }]}
        disabled={!picture}
        onPress={() => navigation.navigate('PostDetails', {
          business,
          picture,
          menuItem,
          pExists: placeExists.current,
          pCategories: placeCategories.current,
        })}
      >
        <Text style={styles.nextButtonText}>Next</Text>
        <NextArrow />
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerRight,
      title: business.name,
      headerTitleStyle: header.title,
    });
  }, [business, picture, menuItem, navigation]);

  const cropAndSetImage = async (img) => {
    currOffset.current = 0;
    pan.setValue({ x: 0, y: 0 });
    pictureToEdit.current = img;
    // setEditorVisible(true);
    setPicture(img);
  };

  const openLibraryPreview = async () => {
    if (!libraryPreview) {
      const { assets } = await MediaLibrary.getAssetsAsync();
      const images = [];
      for (let i = 1; i < assets.length; i += 2) {
        images.push([assets[i - 1], assets[i]]);
      }
      setLibraryPreview(images);
      if (assets.length) {
        cropAndSetImage(assets[0]);
      }
    } else if (libraryPreview.length && libraryPreview[0].length) {
      cropAndSetImage(libraryPreview[0][0]);
    }
    setTab(LIBRARY_TAB);
    slideInput(0.7);
  };

  // Camera roll permissions, open camera roll preview
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      setHasLibraryPermission(status === 'granted');
    })();
    openLibraryPreview();
  }, []);

  const takePicture = async () => {
    if (camera.current) {
      const photo = await camera.current.takePictureAsync({ quality: 1 });
      setPicture(photo);
    }
  };

  const cameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
    setPicture(null);
    slideInput(0);
    setTab(CAMERA_TAB);
  };

  const BottomBar = useCallback(() => (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={[styles.tabContainer, { opacity: tab === LIBRARY_TAB ? 1 : 0.4 }]}
        onPress={() => {
          if (tab !== LIBRARY_TAB) {
            if (picture) {
              TwoButtonAlert({
                title: 'Discard current picture?',
                yesButton: 'Confirm',
                pressed: () => {
                  openLibraryPreview();
                },
              });
            } else {
              openLibraryPreview();
            }
          }
        }}
      >
        <Library />
        <Text style={styles.tabText}>Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabContainer, { opacity: tab === CAMERA_TAB ? 1 : 0.4 }]}
        onPress={() => {
          if (tab !== CAMERA_TAB) {
            cameraPermissions();
          }
        }}
      >
        <Cam />
        <Text style={styles.tabText}>Camera</Text>
      </TouchableOpacity>
    </View>
  ), [picture, tab]);

  if (hasLibraryPermission === null) {
    return <View />;
  }

  if (hasLibraryPermission === false) {
    return <Text>No access to camera</Text>;
  }

  const renderGridItem = ({ item }) => {
    const gridStyleTop = item[0] === picture
      ? [styles.gridImage, { borderWidth: wp(0.7), borderColor: colors.accent }]
      : styles.gridImage;
    const gridStyleBottom = item[1] === picture
      ? [styles.gridImage, { borderWidth: wp(0.7), borderColor: colors.accent }]
      : styles.gridImage;
    return (
      <View style={styles.gridContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridItem}
          onPress={() => cropAndSetImage(item[0])}
        >
          <Image style={gridStyleTop} source={{ uri: item[0].uri }} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridItem}
          onPress={() => cropAndSetImage(item[1])}
        >
          <Image style={gridStyleBottom} source={{ uri: item[1].uri }} />
        </TouchableOpacity>
      </View>
    );
  };

  const pickImage = async () => {
    const image = await ImagePicker.launchImageLibraryAsync(
      {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: [1, 1],
        allowsEditing: true,
        quality: 1,
      },
    );
    if (!image.cancelled) {
      delete image.cancelled;
      setPicture(image);
    }
  };

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <View style={styles.container}>
        <DismissKeyboardView style={styles.camContainer}>
          {!picture && tab === CAMERA_TAB
            && (
              <Camera
                style={styles.camera}
                type={type}
                flashMode={flash}
                ref={(ref) => { camera.current = ref; }}
                ratio="1:1"
              >
                <View style={styles.camToolsContainer}>
                  <TouchableOpacity
                    style={styles.camTool}
                    onPress={() => {
                      setType(
                        type === Camera.Constants.Type.back
                          ? Camera.Constants.Type.front
                          : Camera.Constants.Type.back,
                      );
                    }}
                  >
                    <FlipCam />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.camTool}
                    onPress={() => {
                      setFlash(
                        flash === Camera.Constants.FlashMode.off
                          ? Camera.Constants.FlashMode.on
                          : Camera.Constants.FlashMode.off,
                      );
                    }}
                  >
                    {flash === Camera.Constants.FlashMode.on && <Flash />}
                    {flash === Camera.Constants.FlashMode.off && <FlashOff />}
                  </TouchableOpacity>
                </View>
              </Camera>
            )}
          {picture && tab !== CAMERA_TAB
            && (
              <View
                style={styles.camContainer}
                activeOpacity={0.9}
                onPress={pickImage}
              >
                <Animated.View
                  style={[{
                    transform: [{ translateY: pan.y }],
                    backgroundColor: 'blue',
                  }, styles.camContainer, { aspectRatio: picture.width / picture.height }]}
                  {...panResponder.panHandlers}
                >
                  <Image
                    style={[styles.camContainer, { aspectRatio: picture.width / picture.height }]}
                    source={{ uri: picture.uri }}
                    resizeMode="cover"
                  />
                </Animated.View>
              </View>
            )}
          {picture && tab === CAMERA_TAB
            && <Image style={styles.camContainer} source={{ uri: picture.uri }} />}
          {picture && tab === CAMERA_TAB
            && (
              <TouchableOpacity style={styles.xContainer} onPress={() => setPicture(null)}>
                <X color="white" size={wp(10)} />
              </TouchableOpacity>
            )}
        </DismissKeyboardView>
        <View style={styles.bottomContainer}>
          <Animated.View
            style={[styles.itemInputContainer, { transform: [{ translateY: inputTranslate }] }]}
          >
            <View style={styles.dishIconContainer}>
              <Dish />
            </View>
            <TextInput
              style={styles.itemInput}
              onChangeText={(text) => setMenuItem(text)}
              value={menuItem}
              placeholder="What's this menu item? (optional)"
              placeholderTextColor={colors.tertiary}
              onFocus={() => slideInput(1)}
              onEndEditing={() => (tab === CAMERA_TAB ? slideInput(0) : slideInput(0.7))}
            />
          </Animated.View>
          {tab === CAMERA_TAB
            && (
              <TouchableOpacity
                style={styles.takePhotoBtnOuter}
                onPress={() => takePicture()}
                activeOpacity={0.8}
              >
                <View style={styles.takePhotoBtnInner} />
              </TouchableOpacity>
            )}
          {tab === LIBRARY_TAB
            && (
              <View style={styles.previewContainer}>
                <FlatList
                  contentContainerStyle={{ paddingLeft: wp(0.5) }}
                  data={libraryPreview}
                  renderItem={renderGridItem}
                  keyExtractor={(item) => item[0].id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  ListFooterComponent={(
                    <TouchableOpacity
                      style={styles.allLibraryContainer}
                      onPress={pickImage}
                    >
                      <View style={styles.allLibrary}>
                        <Text style={styles.allLibraryText}>
                          See All
                          {'\n'}
                          Photos
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  ListFooterComponentStyle={{ alignItems: 'center', justifyContent: 'center' }}
                />
              </View>
            )}
          <BottomBar />
        </View>
      </View>
    </SafeAreaView>
  );
};

UploadImages.propTypes = propTypes;

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: colors.gray2,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  nextButtonContainer: {
    flex: 1,
    paddingRight: sizes.margin,
    alignItems: 'center',
    flexDirection: 'row',
  },
  nextButtonText: {
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    color: colors.accent,
    paddingRight: wp(1),
    letterSpacing: 0.4,
  },
  camContainer: {
    width: wp(99),
    aspectRatio: 1,
  },
  camera: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  camToolsContainer: {
    flex: 0.18,
    paddingVertical: hp(1),
  },
  camTool: {
    alignItems: 'center',
    paddingVertical: hp(0.5),
  },
  xContainer: {
    position: 'absolute',
    top: hp(2),
    left: wp(2.5),
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: hp(7),
    backgroundColor: 'white',
  },
  itemInputContainer: {
    position: 'absolute',
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: '90%',
    height: hp(5.7),
    opacity: 0.7,
    borderRadius: 10,
    backgroundColor: colors.gray3,
    paddingHorizontal: wp(4),
    paddingTop: wp(0.5),
    marginTop: hp(3),
  },
  dishIconContainer: {
    opacity: 0.85,
    paddingBottom: wp(1),
    marginRight: wp(2.2),
  },
  itemInput: {
    flex: 1,
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: colors.black,
    letterSpacing: 0.4,
  },
  takePhotoBtnOuter: {
    width: wp(20),
    aspectRatio: 1,
    borderRadius: wp(20) / 2,
    borderColor: colors.black,
    borderWidth: wp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: hp(8),
  },
  takePhotoBtnInner: {
    width: wp(16),
    aspectRatio: 1,
    borderRadius: wp(16) / 2,
    backgroundColor: colors.black,
  },
  bottomBar: {
    width: '100%',
    height: hp(7),
    position: 'absolute',
    bottom: 0,
    backgroundColor: colors.gray2,
    flexDirection: 'row',
  },
  tabContainer: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: colors.tertiary,
    paddingLeft: wp(3),
    paddingTop: wp(1),
  },
  previewContainer: {
    flex: 1,
  },
  gridContainer: {
    height: '100%',
    aspectRatio: 0.5,
    justifyContent: 'space-evenly',
  },
  gridItem: {
    height: '48%',
    width: '97%',
  },
  gridImage: {
    flex: 1,
    borderRadius: wp(1),
  },
  allLibraryContainer: {
    height: wp(45),
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allLibrary: {
    width: '50%',
    aspectRatio: 1,
    borderRadius: wp(30),
    backgroundColor: colors.gray3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allLibraryText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.tertiary,
    textAlign: 'center',
  },
});

export default UploadImages;
