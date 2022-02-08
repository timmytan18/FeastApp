import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Slider } from '@miblanchard/react-native-slider';
import { LinearGradient } from 'expo-linear-gradient';
import { RATING_CATEGORIES } from '../../constants/constants';
import {
  colors, gradients, shadows, sizes, wp, hp,
} from '../../constants/theme';

const RatingsInput = ({ ratings, changeRatings }) => {
  function renderSlider(type) {
    return (
      <View style={styles.ratingContainer} key={type}>
        <Text style={styles.ratingText}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
        <View style={styles.sliderContainer}>
          <Slider
            value={ratings.current[type]}
            step={0.5}
            maximumValue={5}
            minimumValue={1}
            onValueChange={(value) => changeRatings({ value: value[0], type })}
            trackClickable={false}
            minimumTrackTintColor={colors.accent2}
            renderThumbComponent={() => (
              <LinearGradient
                style={styles.thumbContainer}
                colors={gradients.purple.colors}
                start={gradients.purple.start}
                end={gradients.purple.end}
              >
                <View style={styles.innerThumb} />
              </LinearGradient>
            )}
          />
        </View>
      </View>
    );
  }

  const sliders = Object.keys(RATING_CATEGORIES).map((type) => renderSlider(type));

  return (
    <View style={styles.ratingsContainer}>
      <View style={styles.numbersContainer}>
        {[1, 2, 3, 4, 5].map((num) => <Text key={num} style={styles.numberText}>{num}</Text>)}
      </View>
      {sliders}
    </View>
  );
};

export default RatingsInput;

const styles = StyleSheet.create({
  ratingsContainer: {
    height: wp(80),
    width: '100%',
    paddingTop: wp(4),
    marginBottom: wp(8),
  },
  thumbContainer: {
    backgroundColor: colors.accent,
    height: wp(6.5),
    width: wp(6.5),
    borderRadius: wp(6.5) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerThumb: {
    backgroundColor: 'white',
    height: wp(2),
    width: wp(2),
    borderRadius: wp(2) / 2,
  },
  numbersContainer: {
    alignSelf: 'flex-end',
    width: wp(52),
    height: wp(7.5),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(2.2),
  },
  numberText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: colors.tertiary,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: wp(1.7),
  },
  ratingText: {
    fontFamily: 'Semi',
    fontSize: sizes.b1,
    color: colors.tertiary,
    paddingBottom: wp(1),
    paddingLeft: wp(0.5),
  },
  sliderContainer: {
    width: wp(52),
  },
});
