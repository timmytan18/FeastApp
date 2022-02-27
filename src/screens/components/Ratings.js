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
        width={wp(55)}
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
    marginRight: wp(2),
  },
  typeText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
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
