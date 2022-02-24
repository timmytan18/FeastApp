import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapMarkerRating from './util/icons/MapMarkerRating';
import {
  colors, shadows, gradients, wp, sizes,
} from '../../constants/theme';

const RatingMapMarker = ({
  name, rating, isDarkMode, visible,
}) => (
  <View style={[styles.rootContainer]}>
    {/* <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>+12</Text>
        </View> */}
    <View style={[styles.container, shadows.even]}>
      <Text style={styles.ratingText}>
        {(Math.round(rating * 2 * 100) / 100).toFixed(1)}
      </Text>
      <MapMarkerRating color={colors.tertiary} />
    </View>
    {name && (
      <View>
        <Text
          style={[
            styles.nameText, styles.textWithShadow,
            { color: isDarkMode ? 'white' : colors.black, opacity: visible ? 1 : 0 },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
    )}
  </View>
);

function areEqual(prevProps, nextProps) {
  // Rerender if marker is currently visible and was previously not or vice versa
  return prevProps.visible === nextProps.visible;
}

const containerWidth = wp(25);
const badgeSize = wp(6);

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingText: {
    position: 'absolute',
    top: wp(2.45),
    fontFamily: 'Medium',
    fontSize: wp(3.1),
    color: colors.white,
    zIndex: 1,
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.black,
    width: containerWidth,
    textAlign: 'center',
  },
  textWithShadow: {
    textShadowColor: 'rgba(255, 197, 41, 0.75)',
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 10,
  },
  badgeContainer: {
    position: 'absolute',
    zIndex: 1,
    top: -badgeSize / 3,
    left: containerWidth / 2 + badgeSize / 4,
    width: badgeSize,
    height: badgeSize,
    borderRadius: badgeSize / 2,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Medium',
    fontSize: wp(2.5),
    color: colors.black,
    paddingBottom: 1,
  },
});

export default React.memo(RatingMapMarker, areEqual);
