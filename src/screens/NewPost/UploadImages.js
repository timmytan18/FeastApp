import React, {
  useState, useEffect, useCallback, useRef, useContext,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, TextInput, Animated, Image, FlatList,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { Auth } from 'aws-amplify';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { manipulateAsync } from 'expo-image-manipulator';
import { getPlaceInDBQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import TwoButtonAlert from '../components/util/TwoButtonAlert';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import Edit from '../components/util/icons/Edit';
import NextArrow from '../components/util/icons/NextArrow';
import FlipCam from '../components/util/icons/FlipCam';
import Flash from '../components/util/icons/Flash';
import FlashOff from '../components/util/icons/FlashOff';
import X from '../components/util/icons/X';
import Cam from '../components/util/icons/Cam';
import Library from '../components/util/icons/Library';
import Dish from '../components/util/icons/Dish';
import { POST_IMAGE_ASPECT } from '../../constants/constants';
import ENV from '../../constants/environment';
import { Context } from '../../Store';
import {
  colors, sizes, header, wp, isPad, wpFull,
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

const endpoint = ENV === 'dev' ? 'scraper' : 'scraper-prod';
const API_GATEWAY_ENDPOINT = `https://fyjcth1v7d.execute-api.us-east-2.amazonaws.com/${ENV}/${endpoint}`;

const UploadImages = ({ navigation, route }) => {
  const mounted = useRef(true);

  // FIND BUSINESS IN DYNAMO
  const { business } = route.params;
  const [{ review, rating }, dispatch] = useContext(Context);
  const insets = useSafeAreaInsets();

  const placeExists = useRef(false);
  const placeCategoriesImgUrl = useRef({ categories: null, imgUrl: null });

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
        const { promise, getValue, errorMsg } = getPlaceInDBQuery(
          { placePK, withCategoriesAndPicture: true },
        );
        const {
          placeInDB, categoriesDB, imgUrlDB,
        } = await fulfillPromise(promise, getValue, errorMsg);
        if (!placeInDB) {
          // Scrape data on screen load if place does not exist
          createPlaceItem();
        } else {
          placeExists.current = true;
          placeCategoriesImgUrl.current = { categories: categoriesDB, imgUrl: imgUrlDB };
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
  const pictureFromPreview = useRef(true);

  useEffect(() => {
    // Clear and reset review and rating
    if (rating) {
      dispatch({
        type: 'SET_REVIEW_RATING',
        payload: { review, rating: null },
      });
    }
  }, [picture]);

  // Menu item input
  const [menuItem, setMenuItem] = useState(null);
  const [inputActive, setInputActive] = useState(false);
  const inputAnim = useRef(new Animated.Value(0)).current;
  const inputTranslate = inputAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -wp(36)],
  });
  function slideInput(up) {
    Animated.spring(inputAnim, {
      toValue: up,
      speed: 10,
      useNativeDriver: true,
    }).start();
  }

  const cropImage = async () => {
    const aspectRatio = POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1];
    let width; let height;
    let originX; let originY;
    if (picture.height >= picture.width) {
      width = picture.width;
      height = picture.width / aspectRatio;
      if (height > picture.height) {
        height = picture.height;
        width = picture.height * aspectRatio;
        originX = (picture.width - width) / 2;
        originY = 0;
      } else {
        originX = 0;
        originY = (picture.height - height) / 2;
      }
    } else {
      width = picture.height * aspectRatio;
      height = picture.height;
      if (width > picture.width) {
        width = picture.width;
        height = picture.width / aspectRatio;
        originX = 0;
        originY = (picture.height - height) / 2;
      } else {
        originX = (picture.width - width) / 2;
        originY = 0;
      }
    }
    const manipResult = await manipulateAsync(
      picture.localUri || picture.uri,
      [{
        crop: {
          height, width, originX, originY,
        },
      }],
    );
    return manipResult;
  };

  // Set navigation with button, set header title to place name
  useEffect(() => {
    const headerRight = () => (
      <TouchableOpacity
        onPress={async () => {
          let croppedImg;
          if (picture) {
            croppedImg = pictureFromPreview
              && picture === currUncroppedImage.current
              ? await cropImage() : ({ ...picture });
          }
          navigation.navigate('PostDetails', {
            business,
            picture: croppedImg,
            menuItem,
            pExists: placeExists.current,
            pCategories: placeCategoriesImgUrl.current,
          });
        }}
      >
        {picture ? (
          <View style={[styles.nextButtonContainer, { opacity: picture ? 1 : 0.5 }]}>
            <Text style={styles.nextButtonText}>Next</Text>
            <NextArrow />
          </View>
        ) : (
          <View style={styles.nextButtonContainer}>
            <Text style={[
              styles.nextButtonText,
              { color: colors.tertiary, fontFamily: 'MediumItalic' },
            ]}
            >
              Skip

            </Text>
          </View>
        )}
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerRight,
      title: business.name,
      headerTitleStyle: header.title,
    });
  }, [business, picture, menuItem, navigation]);

  const pickImage = async () => {
    const image = await ImagePicker.launchImageLibraryAsync(
      {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        aspect: POST_IMAGE_ASPECT,
        quality: 1,
      },
    );
    if (!image.cancelled) {
      delete image.cancelled;
      tentativeCurrUncroppedImage.current = image;
      goToCropModal();
    }
  };

  const currUncroppedImage = useRef(null);
  const tentativeCurrUncroppedImage = useRef(null);
  // Returned cropped image
  useEffect(() => {
    if (route.params?.croppedImg) {
      pictureFromPreview.current = false;
      setPicture(route.params.croppedImg);
      if (tentativeCurrUncroppedImage.current) {
        currUncroppedImage.current = tentativeCurrUncroppedImage.current;
        tentativeCurrUncroppedImage.current = null;
      }
    }
  }, [route.params?.croppedImg]);

  // Open image picker
  useEffect(() => {
    if (route.params?.openImagePicker) {
      pickImage();
      route.params.openImagePicker = false;
    }
  }, [route.params?.openImagePicker]);

  const goToCropModal = () => {
    navigation.navigate('CropModal', {
      uri: tentativeCurrUncroppedImage.current
        ? tentativeCurrUncroppedImage.current.uri : currUncroppedImage.current.uri,
      aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
    });
  };

  const setUncroppedPicture = (pic) => {
    currUncroppedImage.current = pic;
    tentativeCurrUncroppedImage.current = null;
    setPicture(pic);
  };

  const openLibraryPreview = async () => {
    if (!libraryPreview) {
      const { assets } = await MediaLibrary.getAssetsAsync();
      const images = [];
      const numPreview = assets.length;
      for (let i = 3; i < numPreview; i += 4) {
        images.push([assets[i - 3], assets[i - 2], assets[i - 1], assets[i]]);
      }
      if (mounted.current) setLibraryPreview(images);
      if (numPreview) {
        // pictureFromPreview.current = true;
        // if (mounted.current) setUncroppedPicture(assets[0]);
      }
    } else if (libraryPreview.length && libraryPreview[0].length) {
      // pictureFromPreview.current = true;
      // if (mounted.current) setUncroppedPicture(libraryPreview[0][0]);
    }
    if (mounted.current) setTab(LIBRARY_TAB);
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
      pictureFromPreview.current = false;
      if (mounted.current) setPicture(photo);
    }
  };

  const cameraPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasCameraPermission(status === 'granted');
    setPicture(null);
    slideInput(0);
    pictureFromPreview.current = false;
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

  const renderGridItem = ({ item }) => (
    <View style={styles.gridContainer}>
      {item.map((pic) => (
        <TouchableOpacity
          activeOpacity={0.6}
          style={styles.gridItem}
          onPress={() => {
            if (pic !== picture) {
              pictureFromPreview.current = true;
              setUncroppedPicture(pic);
            } else {
              pictureFromPreview.current = false;
              setUncroppedPicture(null);
            }
          }}
          key={pic.uri}
        >
          <Image
            style={[styles.gridImage, pic === picture && styles.gridImageSelected]}
            source={{ uri: pic.uri }}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeAreaContainer, { marginTop: -insets.top }]}>
      <View style={[styles.container, isPad && { paddingHorizontal: sizes.margin }]}>
        <DismissKeyboardView
          style={[styles.camContainer, !picture && tab !== CAMERA_TAB && { height: wp(40) }]}
        >
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
          {!picture && tab !== CAMERA_TAB && (
            <TouchableOpacity
              style={styles.noImageContainer}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              <Text style={styles.noImageText}>Select an image to upload!</Text>
            </TouchableOpacity>
          )}
          {picture && tab !== CAMERA_TAB
            && (
              <View>
                <Image style={styles.camContainer} source={{ uri: picture.uri }} />
                <TouchableOpacity
                  style={styles.editContainer}
                  onPress={goToCropModal}
                  activeOpacity={0.6}
                >
                  <Edit />
                </TouchableOpacity>
              </View>
            )}
          {picture && tab === CAMERA_TAB
            && <Image style={styles.camContainer} source={{ uri: picture.uri }} />}
          {picture && tab === CAMERA_TAB
            && (
              <TouchableOpacity style={styles.xContainer} onPress={() => setPicture(null)}>
                <X color="#fff" size={wp(10)} />
              </TouchableOpacity>
            )}
        </DismissKeyboardView>
        <View style={styles.bottomContainer}>
          {picture && (
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
                onFocus={() => {
                  setInputActive(true);
                  slideInput(1);
                }}
                onEndEditing={() => {
                  setInputActive(false);
                  slideInput(tab === CAMERA_TAB ? 0 : 0.7);
                }}
              />
            </Animated.View>
          )}
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
                  showsHorizontalScrollIndicator={false}
                  ListHeaderComponent={(
                    <TouchableOpacity
                      style={styles.recentsContainer}
                      onPress={pickImage}
                    >
                      <Text style={styles.recentsText}>
                        Recents
                      </Text>
                      <View style={styles.downArrow}>
                        <NextArrow color={colors.black} size={wp(2.6)} />
                      </View>
                    </TouchableOpacity>
                  )}
                  ListFooterComponent={(
                    <TouchableOpacity
                      style={styles.allLibraryContainer}
                      onPress={pickImage}
                      activeOpacity={0.6}
                    >
                      <Text style={styles.allLibraryText}>
                        See All
                      </Text>
                    </TouchableOpacity>
                  )}
                  ListFooterComponentStyle={{ alignItems: 'center', justifyContent: 'center', height: wp(18) }}
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

const bottomTabColor = colors.gray4;
const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: bottomTabColor,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
    borderRadius: wp(2),
  },
  camera: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  camToolsContainer: {
    flex: 0.18,
    paddingVertical: wp(2),
  },
  camTool: {
    alignItems: 'center',
    paddingVertical: wp(1),
  },
  noImageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray2,
    borderRadius: 4,
  },
  noImageText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: colors.tertiary,
    textAlign: 'center',
  },
  editContainer: {
    position: 'absolute',
    top: wpFull(4),
    right: wpFull(4),
    opacity: 0.9,
    backgroundColor: colors.gray4,
    height: wp(13),
    width: wp(13),
    borderRadius: wp(6.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  xContainer: {
    position: 'absolute',
    top: wp(4),
    left: wp(2.5),
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: wp(15),
  },
  itemInputContainer: {
    position: 'absolute',
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    width: '90%',
    height: wp(11.4),
    opacity: 0.7,
    borderRadius: 10,
    backgroundColor: colors.gray3,
    paddingHorizontal: wp(4),
    paddingTop: wp(0.5),
    marginTop: wp(6),
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
    width: wp(18),
    aspectRatio: 1,
    borderRadius: wp(18) / 2,
    borderColor: colors.tertiary,
    borderWidth: wp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: wp(16),
  },
  takePhotoBtnInner: {
    width: wp(14),
    aspectRatio: 1,
    borderRadius: wp(14) / 2,
    backgroundColor: colors.black,
  },
  bottomBar: {
    width: '100%',
    height: wp(15),
    position: 'absolute',
    bottom: 0,
    backgroundColor: bottomTabColor,
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
    paddingTop: 1.2,
  },
  gridContainer: {
    paddingVertical: 1.2,
    width: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  },
  gridItem: {
    width: '24.2%',
    aspectRatio: 1,
  },
  gridImage: {
    flex: 1,
    borderRadius: wp(1),
  },
  gridImageSelected: {
    flex: 1,
    borderRadius: wp(1),
    borderWidth: wp(0.7),
    borderColor: colors.accent,
  },
  recentsContainer: {
    height: wp(12),
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    marginTop: wp(1),
  },
  recentsText: {
    fontFamily: 'Semi',
    fontSize: sizes.b1,
    color: colors.black,
    marginLeft: wp(2),
    marginRight: wp(1.5),
  },
  allLibraryContainer: {
    height: wp(9),
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
    paddingHorizontal: wp(1),
    borderWidth: wp(0.7),
    borderColor: colors.gray2,
    borderRadius: wp(3),
    backgroundColor: colors.gray2,
  },
  allLibraryText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.black,
    marginHorizontal: wp(2),
  },
  downArrow: {
    transform: [{ rotate: '90deg' }],
    paddingLeft: 1.7,
  },
});

export default UploadImages;
