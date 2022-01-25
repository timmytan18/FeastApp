import React from 'react';
import {
  StyleSheet, View, Text,
} from 'react-native';
import PropTypes from 'prop-types';
import ProfilePic from './ProfilePic';
import { colors, sizes, wp } from '../../constants/theme';

const propTypes = {
  name: PropTypes.string.isRequired,
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
  userPic: PropTypes.string,
  category: PropTypes.string,
};

const defaultProps = {
  userPic: null,
  category: 'Food/Drink',
};

const MapMarker = ({
  name, lat, lng, userPic, category,
}) => (
  <View style={styles.container}>
    <View style={styles.markerContainer}>
      <ProfilePic
        extUrl={userPic}
        size={imageSize}
        style={styles.imageContainer}
      />
    </View>
    <View>
      <Text style={styles.nameText}>{name}</Text>
    </View>
    {category && (
      <View>
        <Text style={styles.categoryText}>{category}</Text>
      </View>
    )}
  </View>
);

MapMarker.propTypes = propTypes;
MapMarker.defaultProps = defaultProps;

const markerSize = wp(12);
const borderWidth = 2;
const imageSize = markerSize - borderWidth * 4;
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: markerSize,
    width: markerSize,
    borderRadius: markerSize / 2,
    borderWidth,
    borderColor: colors.accent,
    backgroundColor: colors.white,
    marginBottom: wp(1),
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
  },
});

export default MapMarker;
