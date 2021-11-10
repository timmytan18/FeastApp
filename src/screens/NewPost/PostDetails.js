// import React, { useState, useEffect, useContext, useRef } from 'react';
// import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, Animated, Image, ImageBackground, ScrollView } from 'react-native';
// import { Context } from '../../Store';
// import DismissKeyboardView from '../components/util/DismissKeyboard';
// import MapMarker from '../components/util/icons/MapMarker';
// import NextArrow from '../components/util/icons/NextArrow';
// import RatingsInput from '../components/RatingsInput';
// import { colors, gradients, shadows, sizes, header, wp, hp } from '../../constants/theme';

// const PostDetails= ({ navigation, route }) => {

//     const { business, picture, menuItem } = route.params;
//     const [state, dispatch] = useContext(Context);

//     useEffect(() => {
//         navigation.setOptions({
//             headerRight: () => {
//                 return (
//                     <TouchableOpacity
//                         style={styles.shareButtonContainer}
//                         onPress={() => share()}
//                     >
//                         <Text style={styles.shareButtonText}>Share</Text>
//                     </TouchableOpacity>
//                 );
//             },
//         })
//     }, [])

//     function share() {
//         navigation.navigate('Home')
//         console.log(ratings.current)
//     }

//     const [review, setReview] = useState(null);
//     const ratings = useRef({ overall: 4, food: 4, value: 4, service: 4, atmosphere: 4 });

//     function changeRatings(value, type) {
//         if (ratings.current[type] != value) {
//             ratings.current[type] = value;
//         }
//     }

//     return (
//         <SafeAreaView style={styles.container}>
//             <ScrollView>
//             <DismissKeyboardView style={{ margin: wp(4) }}>
//                 <View style={styles.postHeader}>
//                     <Image style={styles.profilePic} source={{ uri: state.user.picture }} resizeMode='contain' />
//                     <View style={styles.headerTextContainer}>
//                         <Text style={styles.nameText}>{state.user.displayName}</Text>
//                         <View style={styles.locationContainer}>
//                             <MapMarker size={wp(4.8)} color={colors.accent} />
//                             <Text style={styles.locationText}>{business.restInfo.name}</Text>
//                         </View>
//                     </View>
//                 </View>
//                 <TouchableOpacity style={styles.tagContainer}>
//                     <Text style={styles.tagText}>Tag group and friends</Text>
//                     <NextArrow color={colors.black} />
//                 </TouchableOpacity>
//                 <TextInput
//                     style={styles.reviewInput}
//                     onChangeText={text => setReview(text)}
//                     value={review}
//                     placeholder='Add a review/caption…'
//                     placeholderTextColor={colors.tertiary}
//                     multiline
//                     maxLength={256}
//                     blurOnSubmit
//                     returnKeyType='done'
//                 />
//                 <ImageBackground style={styles.imageContainer} imageStyle={{ borderRadius: wp(2) }} source={{ uri: picture.uri }}>
//                     {menuItem && <Text style={styles.menuItemText}>{menuItem}</Text>}
//                 </ImageBackground>
//                 <Text style={styles.ratingTitle}>My Ratings</Text>
//                 <View style={styles.ratingsContainer}>
//                     <RatingsInput ratings={ratings} changeRatings={changeRatings} />
//                 </View>
//             </DismissKeyboardView>
//             </ScrollView>
//         </SafeAreaView>
//     );
// }


// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         backgroundColor: 'white',
//     },
//     shareButtonContainer: {
//         flex: 1,
//         paddingRight: sizes.margin,
//         alignItems: 'center',
//         flexDirection: 'row'
//     },
//     shareButtonText: {
//         fontFamily: 'Semi',
//         fontSize: sizes.h3,
//         color: colors.accent,
//         letterSpacing: 0.4
//     },
//     postHeader: {
//         height: hp(7.2),
//         width: '100%',
//         flexDirection: 'row'
//     },
//     profilePic: {
//         height: '90%',
//         aspectRatio: 1,
//         borderRadius: wp(15),
//         alignSelf: 'center'
//     },
//     headerTextContainer: {
//         justifyContent: 'space-between'
//     },
//     nameText: {
//         fontFamily: 'Medium',
//         fontSize: sizes.h4,
//         lineHeight: wp(7),
//         color: colors.black,
//         paddingLeft: wp(3)
//     },
//     locationContainer: {
//         flexDirection: 'row',
//         paddingLeft: wp(2.2),
//         alignItems: 'flex-start'
//     },
//     locationText: {
//         fontFamily: 'Semi',
//         fontSize: sizes.h3,
//         lineHeight: wp(6),
//         textAlignVertical: 'top',
//         color: colors.accent,
//         letterSpacing: 0.3,
//         paddingLeft: wp(1.2)
//     },
//     tagContainer: {
//         flexDirection: 'row',
//         marginTop: wp(4),
//         paddingLeft: wp(1),
//         alignItems: 'center'
//     },
//     tagText: {
//         fontFamily: 'Medium',
//         fontSize: sizes.h4,
//         color: colors.black,
//         paddingRight: wp(1.5),
//         paddingBottom: wp(0.2),
//         letterSpacing: 0.2
//     },
//     reviewInput: {
//         fontFamily: 'Book',
//         fontSize: sizes.h4,
//         color: colors.black,
//         paddingHorizontal: wp(3),
//         paddingTop: wp(2),
//         paddingBottom: wp(2),
//         marginVertical: wp(3),
//         letterSpacing: 0.3,
//         backgroundColor: colors.gray2,
//         borderRadius: wp(2)
//     },
//     imageContainer: {
//         width: '100%',
//         aspectRatio: 1,
//         justifyContent: 'flex-end',
//         // alignItems: 'flex-end',
//         marginBottom: wp(8)
//     },
//     menuItemText: {
//         fontFamily: 'Medium',
//         fontSize: wp(5.6),
//         color: 'white',
//         width: wp(50),
//         paddingBottom: wp(5),
//         paddingLeft: wp(5)
//     },
//     ratingsContainer: {
//         paddingHorizontal: wp(1),
//         marginBottom: hp(5)
//     },
//     ratingTitle: {
//         fontFamily: 'Semi',
//         fontSize: wp(5.5),
//         color: colors.primary,
//         paddingLeft: wp(0.5),
//         marginBottom: -wp(2)
//     }
// });

// export default PostDetails;