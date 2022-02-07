import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import ProgressBar from 'react-native-progress/Bar';
import {
  colors, shadows, sizes, wp, hp,
} from '../../constants/theme';

const Ratings = ({
  feed, food, value, service, atmosphere,
}) => {
  const ratingTextStyle = feed ? styles.ratingTextFeed : styles.ratingText;
  const typeTextStyle = feed ? styles.typeTextFeed : styles.typeText;

  const Bar = ({ rating }) => (
    <View>
      <ProgressBar
        progress={rating / 5}
        width={wp(60)}
        height={wp(4.3)}
        borderRadius={wp(4.3) / 2}
        color={colors.secondary}
        borderColor={colors.gray2}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.subContainer}>
        <Text style={styles.typeText}>Food</Text>
        <Bar rating={food} />
      </View>
      <View style={styles.subContainer}>
        <Text style={styles.typeText}>Value</Text>
        <Bar rating={value} />
      </View>
      <View style={styles.subContainer}>
        <Text style={styles.typeText}>Service</Text>
        <Bar rating={service} />
      </View>
      <View style={styles.subContainer}>
        <Text style={styles.typeText}>Atmosphere</Text>
        <Bar rating={atmosphere} />
      </View>
    </View>
  );
};

// const Ratings = ({ feed, food, value, service, atmosphere }) => {

//     const ratingTextStyle = feed ? styles.ratingTextFeed: styles.ratingText;
//     const typeTextStyle = feed ? styles.typeTextFeed : styles.typeText;

//     return (
//         <View style={styles.container}>
//             <View style={[styles.ratingContainer, { marginRight: wp(1) }]}>
//                 <Text style={ratingTextStyle}>
//                     {food}/5
//                 </Text>
//                 <Text style={[typeTextStyle, { letterSpacing: 0.7 }]}>
//                     Food
//                 </Text>
//             </View>
//             <View style={[styles.ratingContainer, { marginRight: wp(1) }]}>
//                 <Text style={ratingTextStyle}>
//                     {value}/5
//                 </Text>
//                 <Text style={[typeTextStyle, { letterSpacing: 0.5 }]}>
//                     Value
//                 </Text>
//             </View>
//             <View style={styles.ratingContainer}>
//                 <Text style={ratingTextStyle}>
//                     {service}/5
//                 </Text>
//                 <Text style={[typeTextStyle, { letterSpacing: 0.3 }]}>
//                     Service
//                 </Text>
//             </View>
//             <View style={styles.ratingContainer}>
//                 <Text style={ratingTextStyle}>
//                     {atmosphere}/5
//                 </Text>
//                 <Text style={typeTextStyle}>
//                     Atmosphere
//                 </Text>
//             </View>
//         </View>
//     );
// }

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'space-between',
    alignSelf: 'flex-start',
  },
  subContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginVertical: wp(2),
  },
  typeText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    color: colors.black,
    opacity: 0.75,
    marginTop: -wp(0.5),
  },
  // ratingContainer: {
  //     flexDirection: 'column',
  //     alignItems: 'center',
  // },
  // ratingText: {
  //     fontFamily: 'Semi',
  //     fontSize: sizes.h3,
  //     color: colors.secondary
  // },
  // ratingTextFeed: {
  //     fontFamily: 'Semi',
  //     fontSize: sizes.h4,
  //     color: colors.secondary
  // },
  // typeTextFeed: {
  //     fontFamily: 'Medium',
  //     fontSize: sizes.b4,
  //     color: colors.black,
  //     opacity: 0.75,
  //     marginTop: -wp(1),
  // }
});

export default Ratings;
