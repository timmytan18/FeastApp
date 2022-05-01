// import React, { useState } from 'react';
// import {
//   View, StyleSheet, TouchableOpacity, Text, ScrollView,
// } from 'react-native';
// import { manipulateAsync } from 'expo-image-manipulator';
// import Crop from 'react-native-avatar-crop';
// import CenterSpinner from '../components/util/CenterSpinner';
// import { colors, wp, sizes } from '../../constants/theme';

// const SCREEN_WIDTH = wp(100);

// const CropModal = ({ route, navigation }) => {
//   const { uri, aspectRatio } = route.params;
//   let crop = async (quality) => ({ uri: '', width: 0, height: 0 });

//   const [loading, setLoading] = useState(false);

//   const cropImage = async ({ cropData: { size, offset } }) => {
//     const { width, height } = size;
//     const { x, y } = offset;
//     const manipResult = await manipulateAsync(uri, [{
//       crop: {
//         height, width, originX: x, originY: y,
//       },
//     }]);
//     return manipResult;
//   };

//   const saveEdits = async () => {
//     setLoading(true);
//     const { cropData, emitSize } = crop();
//     try {
//       const croppedImg = await cropImage({ cropData });
//       navigation.navigate({
//         name: 'UploadImages',
//         params: { croppedImg },
//         merge: true,
//       });
//     } catch {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.center} style={{ backgroundColor: colors.black }}>
//       <Crop
//         source={{ uri }}
//         backgroundColor={colors.black}
//         width={SCREEN_WIDTH}
//         height={SCREEN_WIDTH / aspectRatio}
//         cropShape="rect"
//         cropArea={{ width: SCREEN_WIDTH / 1.2, height: SCREEN_WIDTH / aspectRatio / 1.2 }}
//         onCrop={(cropCallback) => (crop = cropCallback)}
//       />
//       <View style={styles.padding20} />
//       <View style={styles.actionsContainer}>
//         <TouchableOpacity
//           activeOpacity={0.7}
//           style={styles.actionButton}
//           onPress={() => navigation.goBack()}
//         >
//           <Text style={[styles.actionText, { color: '#fff' }]}>Cancel</Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           activeOpacity={0.7}
//           style={[styles.actionButton, { backgroundColor: '#fff' }]}
//           onPress={saveEdits}
//         >
//           {!loading && <Text style={[styles.actionText, { color: colors.black }]}>Save</Text>}
//           {loading && <CenterSpinner />}
//         </TouchableOpacity>
//       </View>
//     </ScrollView>
//   );
// };

// const styles = StyleSheet.create({
//   center: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: colors.black,
//   },
//   btn: {
//     justifyContent: 'center',
//     marginHorizontal: 20,
//     backgroundColor: '#0275D8',
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 4,
//   },
//   btnText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#ffffff',
//   },
//   padding20: {
//     padding: 20,
//   },
//   actionsContainer: {
//     flexDirection: 'row',
//     width: '65%',
//     justifyContent: 'space-between',
//     alignSelf: 'center',
//   },
//   actionButton: {
//     height: wp(11),
//     width: '40%',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: wp(3),
//   },
//   actionText: {
//     fontFamily: 'Medium',
//     fontSize: sizes.h4,
//   },
// });

// export default CropModal;
