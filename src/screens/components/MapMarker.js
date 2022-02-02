import React from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePic from './ProfilePic';
import {
  colors, sizes, gradients, wp,
} from '../../constants/theme';
import { } from 'react-native-gesture-handler';

const propTypes = {
  name: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  userPic: PropTypes.string,
  category: PropTypes.string,
};

const defaultProps = {
  userPic: null,
  category: null,
};

const MapMarker = ({
  name, lat, lng, userPic, category,
}) => (
  <View style={styles.container}>
    <LinearGradient
      colors={gradients.purple.colors}
      start={gradients.purple.start}
      end={gradients.purple.end}
      style={styles.gradientContainer}
    >
      <View style={styles.markerContainer}>
        <ProfilePic
          extUrl={userPic}
          size={imageSize}
          style={styles.imageContainer}
        />
      </View>
    </LinearGradient>
    <View>
      <Text style={[styles.nameText, styles.textWithShadow]}>{name}</Text>
    </View>
    {category && (
      <View>
        <Text style={[styles.categoryText, styles.textWithShadow]}>{category}</Text>
      </View>
    )}
  </View>
);

MapMarker.propTypes = propTypes;
MapMarker.defaultProps = defaultProps;

const markerSize = wp(11);
const markerWithGradientSize = markerSize + wp(1.2);
const borderWidth = 1;
const imageSize = markerSize - borderWidth * 4;
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    height: markerWithGradientSize,
    width: markerWithGradientSize,
    borderRadius: markerWithGradientSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: wp(1),
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: markerSize,
    width: markerSize,
    borderRadius: markerSize / 2,
    backgroundColor: colors.white,
  },
  imageContainer: {
    height: imageSize,
    width: imageSize,
    borderRadius: imageSize / 2,
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
  },
  categoryText: {
    fontFamily: 'Book',
    fontSize: sizes.caption,
    lineHeight: sizes.caption * 1.3,
  },
  textWithShadow: {
    textShadowColor: 'rgba(255, 197, 41, 0.75)',
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 10,
  },
});

export default MapMarker;
