// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Animated, Image, FlatList } from 'react-native';
// import { API, graphqlOperation, Auth } from 'aws-amplify';
// import { Camera } from 'expo-camera';
// import * as ImagePicker from 'expo-image-picker';
// import * as MediaLibrary from 'expo-media-library';
// import { gridLocator } from '../../api/functions/GridLocator';
// import { getBusiness } from '../../api/graphql/queries';
// import DismissKeyboardView from '../components/util/DismissKeyboard';
// import NextArrow from '../components/util/icons/NextArrow';
// import FlipCam from '../components/util/icons/FlipCam';
// import Flash from '../components/util/icons/Flash';
// import FlashOff from '../components/util/icons/FlashOff';
// import X from '../components/util/icons/X';
// import Cam from '../components/util/icons/Cam';
// import Library from '../components/util/icons/Library';
// import { colors, gradients, shadows, sizes, header, wp, hp } from '../../constants/theme';

// const UploadImages = ({ navigation, route }) => {

//     // FIND BUSINESS IN DYNAMO
//     const [business, setBusiness] = useState(null);

//     useEffect(() => {
//         console.log(route.params.business)
//         const { currLat, currLng } = route.params;
//         const { id, name, location, categories } = route.params.business;
//         const { address, city, state, postalCode, cc, lat, lng } = location;
//         const { latitude, longitude } = lat && lng ? gridLocator(lat, lng) : gridLocator(currLat, currLng);
//         const grid = `GRID#${latitude}#${longitude}`;

//         const PK = `BIZ#${id}`;
//         const SK = '#PROFILE';

//         (async () => {
//             try {
//                 let biz = await API.graphql(graphqlOperation(
//                     getBusiness, { PK: PK, SK: { beginsWith: SK }, limit: 200 }
//                 ));
//                 console.log(biz.data.listFeastItems.items)
//                 if (!biz.data.listFeastItems.items.length) {
//                     createBizItem()
//                 } else {
//                     console.log('Business already in dynamo')
//                 }
//             } catch (e) {
//                 console.log('Fetch Dynamo business data error', e)
//             }
//         })()

//         async function createBizItem() {
//             const cognitoUser = await Auth.currentAuthenticatedUser();
//             const token = cognitoUser.signInUserSession.idToken.jwtToken;
//             const category = categories[0].name;
//             const data = { id, name, address, city, state, zip: postalCode, country: cc, category, grid };
//             console.log(JSON.stringify(data))

//             try {
//                 await fetch('https://u1hvq6emd0.execute-api.us-east-1.amazonaws.com/dev/scrape-business', {
//                     method: 'PUT',
//                     headers: {
//                         'Authorization': token,
//                         'Content-Type': 'application/json'
//                     },
//                     body: JSON.stringify(data)
//                 });
//             } catch (e) {
//                 console.log('Could not run scraper', e)
//             }
//         }

//     }, [])


//     // Tab
//     const CAMERA_TAB = 'camera';
//     const LIBRARY_TAB = 'library';
//     const [tab, setTab] = useState(CAMERA_TAB);

//     // Camera
//     const camera = useRef(null);
//     const [hasCameraPermission, setHasCameraPermission] = useState(null);
//     const [type, setType] = useState(Camera.Constants.Type.back);
//     const [flash, setFlash] = useState(Camera.Constants.FlashMode.off);

//     // Library
//     const [hasLibraryPermission, setHasLibraryPermission] = useState(null);
//     const [libraryPreview, setLibraryPreview] = useState(null);

//     // Picture
//     const [picture, setPicture] = useState(null);

//     // Menu item input
//     const [menuItem, setMenuItem] = useState(null);
//     const inputAnim = useRef(new Animated.Value(0)).current;
//     const inputTranslate = inputAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: [0, -hp(18)]
//     })
//     function slideInput(up) {
//         Animated.spring(inputAnim, {
//             toValue: up,
//             speed: 10
//         }).start()
//     }

//     useEffect(() => {
//         if (picture) {
//             navigation.setOptions({
//                 headerRight: () => {
//                     return (
//                         <TouchableOpacity
//                             style={styles.nextButtonContainer}
//                             onPress={() => navigation.navigate('PostDetails', {
//                                 business: business,
//                                 picture: picture,
//                                 menuItem: menuItem
//                             })}
//                         >
//                             <Text style={styles.nextButtonText}>Next</Text>
//                             <NextArrow />
//                         </TouchableOpacity>
//                     );
//                 },
//             })
//         } else {
//             navigation.setOptions({
//                 headerRight: () => {
//                     return (
//                         <TouchableOpacity
//                             disabled
//                             style={[styles.nextButtonContainer, { opacity: 0.5 }]}
//                         >
//                             <Text style={styles.nextButtonText}>Next</Text>
//                             <NextArrow />
//                         </TouchableOpacity>
//                     );
//                 },
//             })
//         }
//     }, [business, picture, menuItem])


//     useEffect(() => {
//         (async () => {
//             const { status } = await ImagePicker.requestCameraRollPermissionsAsync();
//             setHasLibraryPermission(status === 'granted');
//         })()
//         openLibraryPreview()
//     }, []);

//     async function openLibraryPreview() {
//         const { assets } = await MediaLibrary.getAssetsAsync();
//         const images = [];
//         for (let i = 0; i < assets.length; i += 2) {
//             images.push([assets[i], assets[i + 1]])
//         }
//         setLibraryPreview(images)
//         setPicture(assets[0])
//         setTab(LIBRARY_TAB)
//         slideInput(0.7)
//     }

//     async function takePicture() {
//         if (camera.current) {
//             let photo = await camera.current.takePictureAsync({ quality: 1 });
//             setPicture(photo);
//             console.log(photo)
//         }
//     }

//     if (hasLibraryPermission === null) {
//         return <View />;
//     }

//     if (hasLibraryPermission === false) {
//         return <Text>No access to camera</Text>;
//     }

//     async function cameraPermissions() {
//         // const image = await ImagePicker.launchCameraAsync({ aspect: [1,1], allowsEditing: true, quality: 1 })
//         // if (!image.cancelled) {
//         //     delete image.cancelled
//         //     setPicture(image)
//         // }
//         const { status } = await Camera.requestPermissionsAsync();
//         setHasCameraPermission(status === 'granted');
//         setPicture(null)
//         slideInput(0)
//         setTab(CAMERA_TAB)
//     }

//     const BottomBar = () => (
//         <View style={styles.bottomBar}>
//             <TouchableOpacity
//                 style={[styles.tabContainer, { opacity: tab == LIBRARY_TAB ? 1 : 0.4 }]}
//                 onPress={() => {
//                     if (tab !== LIBRARY_TAB) {
//                         openLibraryPreview()
//                     }
//                 }}
//             >
//                 <Library />
//                 <Text style={styles.tabText}>Library</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//                 style={[styles.tabContainer, { opacity: tab == CAMERA_TAB ? 1 : 0.4 }]}
//                 onPress={() => {
//                     if (tab !== CAMERA_TAB) {
//                         cameraPermissions()
//                     }
//                 }}
//             >
//                 <Cam />
//                 <Text style={styles.tabText}>Camera</Text>
//             </TouchableOpacity>
//         </View>
//     );

//     const renderGridItem = ({ item }) => {
//         const gridStyleTop = item[0] == picture
//             ? [styles.gridImage, { borderWidth: wp(0.7), borderColor: colors.accent }]
//             : styles.gridImage;
//         const gridStyleBottom = item[1] == picture
//             ? [styles.gridImage, { borderWidth: wp(0.7), borderColor: colors.accent }]
//             : styles.gridImage;
//         return (
//             <View style={styles.gridContainer}>
//                 <TouchableOpacity activeOpacity={0.6} style={styles.gridItem} onPress={() => setPicture(item[0])}>
//                     <Image style={gridStyleTop} source={{ uri: item[0].uri }} />
//                 </TouchableOpacity>
//                 <TouchableOpacity activeOpacity={0.6} style={styles.gridItem} onPress={() => setPicture(item[1])}>
//                     <Image style={gridStyleBottom} source={{ uri: item[1].uri }} />
//                 </TouchableOpacity>
//             </View>
//         );
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <DismissKeyboardView style={styles.camContainer}>
//                 {!picture &&
//                     <Camera
//                         style={styles.camera}
//                         type={type}
//                         ref={ref => { camera.current = ref }}
//                         ratio='1:1'
//                     >
//                         <View style={styles.camToolsContainer}>
//                             <TouchableOpacity
//                                 style={styles.camTool}
//                                 onPress={() => {
//                                     console.log('switch cam')
//                                     setType(
//                                         type === Camera.Constants.Type.back
//                                             ? Camera.Constants.Type.front
//                                             : Camera.Constants.Type.back
//                                     );
//                                 }}>
//                                 <FlipCam />
//                             </TouchableOpacity>
//                             <TouchableOpacity
//                                 style={styles.camTool}
//                                 onPress={() => {
//                                     setFlash(
//                                         flash == Camera.Constants.FlashMode.off
//                                             ? Camera.Constants.FlashMode.on
//                                             : Camera.Constants.FlashMode.off
//                                     )
//                                 }}>
//                                 {flash == Camera.Constants.FlashMode.on && <Flash />}
//                                 {flash == Camera.Constants.FlashMode.off && <FlashOff />}
//                             </TouchableOpacity>
//                         </View>
//                     </Camera>
//                 }
//                 {picture && <Image style={styles.camContainer} source={{ uri: picture.uri }} />}
//                 {picture && tab == CAMERA_TAB &&
//                     <TouchableOpacity style={styles.xContainer} onPress={() => setPicture(null)}>
//                         <X color='white' size={wp(10)} />
//                     </TouchableOpacity>
//                 }
//             </DismissKeyboardView>
//             <View style={styles.bottomContainer}>
//                 <Animated.View style={[styles.itemInputContainer, { transform: [{ translateY: inputTranslate }] }]}>
//                     <TextInput
//                         style={styles.itemInput}
//                         onChangeText={text => setMenuItem(text)}
//                         value={menuItem}
//                         placeholder="What's this menu item? (optional)"
//                         placeholderTextColor={colors.tertiary}
//                         onFocus={() => slideInput(1)}
//                         onEndEditing={() => tab == CAMERA_TAB ? slideInput(0) : slideInput(0.7)}
//                     />
//                 </Animated.View>
//                 {tab == CAMERA_TAB &&
//                     <TouchableOpacity
//                         style={styles.takePhotoBtnOuter}
//                         onPress={() => takePicture()}
//                     >
//                         <View style={styles.takePhotoBtnInner} />
//                     </TouchableOpacity>
//                 }
//                 {tab == LIBRARY_TAB &&
//                     <View style={styles.previewContainer}>
//                         <FlatList
//                             // style={styles.previewContainer}
//                             contentContainerStyle={{ paddingLeft: wp(0.5) }}
//                             data={libraryPreview}
//                             renderItem={renderGridItem}
//                             keyExtractor={item => item[0].id}
//                             horizontal
//                             showsHorizontalScrollIndicator={false}
//                             // onEndReached={() => getNextResults()}
//                             // onEndReachedThreshold={0.1}
//                             ListFooterComponent={
//                                 <TouchableOpacity
//                                     style={styles.allLibraryContainer}
//                                     onPress={async () => {
//                                         const image = await ImagePicker.launchImageLibraryAsync({ aspect: [1, 1], allowsEditing: true, quality: 1 });
//                                         if (!image.cancelled) {
//                                             delete image.cancelled
//                                             setPicture(image)
//                                         }
//                                     }}
//                                 >
//                                     <View style={styles.allLibrary}>
//                                         <Text style={styles.allLibraryText}>See All Photos</Text>
//                                     </View>
//                                 </TouchableOpacity>
//                             }
//                         />
//                     </View>
//                 }
//                 <BottomBar />
//             </View>
//         </SafeAreaView>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'white',
//         alignItems: 'center'
//     },
//     nextButtonContainer: {
//         flex: 1,
//         paddingRight: sizes.margin,
//         alignItems: 'center',
//         flexDirection: 'row'
//     },
//     nextButtonText: {
//         fontFamily: 'Semi',
//         fontSize: sizes.h3,
//         color: colors.accent,
//         paddingRight: wp(1),
//         letterSpacing: 0.4
//     },
//     camContainer: {
//         width: wp(99),
//         aspectRatio: 1,
//         // marginVertical: wp(1)
//     },
//     camera: {
//         flex: 1,
//         flexDirection: 'row',
//         justifyContent: 'flex-end'
//     },
//     camToolsContainer: {
//         flex: 0.18,
//         paddingVertical: hp(1)
//     },
//     camTool: {
//         alignItems: 'center',
//         paddingVertical: hp(0.5)
//     },
//     xContainer: {
//         position: 'absolute',
//         top: hp(2),
//         left: wp(2.5)
//     },
//     bottomContainer: {
//         flex: 1,
//         justifyContent: 'center',
//         flexDirection: 'row',
//         paddingBottom: hp(7),
//     },
//     itemInputContainer: {
//         position: 'absolute',
//         width: '90%',
//         height: hp(6.5),
//         opacity: 0.7,
//         marginTop: hp(3),
//         marginBottom: hp(2.5),
//         borderRadius: 10,
//         backgroundColor: colors.gray3,
//         paddingHorizontal: wp(4),
//         paddingTop: wp(0.5),
//     },
//     itemInput: {
//         flex: 1,
//         fontFamily: 'Medium',
//         fontSize: sizes.b1,
//         color: colors.black,
//         letterSpacing: 0.4
//     },
//     takePhotoBtnOuter: {
//         width: wp(22),
//         aspectRatio: 1,
//         borderRadius: wp(23) / 2,
//         borderColor: colors.accent,
//         borderWidth: wp(1.2),
//         alignItems: 'center',
//         justifyContent: 'center',
//         alignSelf: 'flex-end',
//         marginBottom: hp(3)
//     },
//     takePhotoBtnInner: {
//         width: wp(14),
//         aspectRatio: 1,
//         borderRadius: wp(14) / 2,
//         backgroundColor: colors.accent2
//     },
//     bottomBar: {
//         width: '100%',
//         height: hp(7),
//         position: 'absolute',
//         bottom: 0,
//         backgroundColor: colors.gray2,
//         flexDirection: 'row'
//     },
//     tabContainer: {
//         flex: 0.5,
//         alignItems: 'center',
//         justifyContent: 'center',
//         flexDirection: 'row'
//     },
//     tabText: {
//         fontFamily: 'Medium',
//         fontSize: sizes.b1,
//         color: colors.tertiary,
//         paddingLeft: wp(3),
//         paddingTop: wp(1)
//     },
//     previewContainer: {
//         flex: 1,
//         // margin: wp(1),
//     },
//     gridContainer: {
//         height: '100%',
//         aspectRatio: 0.5,
//         justifyContent: 'space-evenly'
//     },
//     gridItem: {
//         height: '48%',
//         width: '97%'
//         // margin: wp(0.5)
//         // borderRadius: wp(2),
//         // paddingHorizontal: '1%'
//     },
//     gridImage: {
//         flex: 1,
//         borderRadius: wp(1)
//     },
//     allLibraryContainer: {
//         height: '100%',
//         aspectRatio: 1,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     allLibrary: {
//         width: '50%',
//         aspectRatio: 1,
//         borderRadius: wp(30),
//         backgroundColor: colors.gray2,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//     allLibraryText: {
//         fontFamily: 'Medium',
//         fontSize: sizes.b1,
//         color: colors.tertiary,
//         textAlign: 'center'
//     }
// });

// export default UploadImages;