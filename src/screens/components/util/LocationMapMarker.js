import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  colors, shadows, gradients, wp,
} from '../../../constants/theme';

const LocationMapMarker = () => (
  <View style={[styles.container, shadows.base]}>
    <LinearGradient
      style={styles.innerContainer}
      colors={gradients.purple.colors}
      start={gradients.purple.start}
      end={gradients.purple.end}
    />
  </View>
);

const markerSize = wp(6.3);
const borderWidth = 1.7;
const innerSize = markerSize - borderWidth * 4;
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: markerSize,
    width: markerSize,
    borderColor: colors.white,
    borderRadius: markerSize / 2,
    backgroundColor: colors.white,
  },
  innerContainer: {
    height: innerSize,
    width: innerSize,
    borderRadius: innerSize / 2,
  },
});

export default LocationMapMarker;
