import React from 'react';
import {
  StyleSheet, View, Text,
} from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIndicator } from 'react-native-indicators';
import ProfilePic from './ProfilePic';
import {
  sizes, gradients, wp,
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
  name, placeId, lat, lng, uid, userPic, category,
  loadingStories, visible, numOtherMarkers, isNew, onlyHasOld,
}) => {
  const visibilityStyle = visible ? {} : { width: 0 };
  const borderGradient = isNew ? gradients.purple : gradients.gray;
  // const numIconGradient = onlyHasOld ? gradients.gray : gradients.purple;
  return (
    <View style={styles.container}>
      {/* {visible && numOtherMarkers > 0 && (
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={numIconGradient.colors}
            start={numIconGradient.start}
            end={numIconGradient.end}
            style={styles.badgeInnerContainer}
          >
            <Text style={styles.badgeText}>
              +
              {numOtherMarkers}
            </Text>
          </LinearGradient>
        </View>
      )} */}
      <LinearGradient
        colors={borderGradient.colors}
        start={borderGradient.start}
        end={borderGradient.end}
        style={styles.gradientContainer}
      // style={[styles.gradientContainer, visibilityStyle]}
      >
        {loadingStories && loadingStories === placeId && (
          <MaterialIndicator
            style={{
              position: 'absolute', zIndex: 1,
            }}
            size={markerWithGradientSize}
            color="#fff"
            trackWidth={gradientSize}
          />
        )}
        <View style={styles.markerContainer}>
          <ProfilePic
            extUrl={userPic}
            uid={uid}
            size={imageSize}
            style={styles.imageContainer}
          />
        </View>
      </LinearGradient>
      <View>
        <Text
          style={[styles.nameText, styles.textWithShadow, visibilityStyle]}
          numberOfLines={1}
        >
          {name}
        </Text>
      </View>
      {category && (
        <View>
          <Text
            style={[styles.categoryText, styles.textWithShadow, visibilityStyle]}
          >
            {category}
          </Text>
        </View>
      )}
    </View>
  );
};

function areEqual(prevProps, nextProps) {
  // Rerender if marker is currently loading or if marker was previously loading and now is not
  // Rerender if marker is currently visible and was previously not or vice versa
  // Rerender if number of other markers in grid changed
  if ((nextProps.placeId === nextProps.loadingStories)
    || (prevProps.placeId === prevProps.loadingStories
      && nextProps.loadingStories === 'none')
    || (nextProps.visible !== prevProps.visible)
    // || (nextProps.numOtherMarkers !== prevProps.numOtherMarkers)
    || (nextProps.isNew !== prevProps.isNew)) {
    return false;
  }
  return true;
}

MapMarker.propTypes = propTypes;
MapMarker.defaultProps = defaultProps;

const containerWidth = wp(25);

const badgeSize = wp(6);
const badgeInnerSize = wp(5);

const markerSize = wp(11);
const gradientSize = wp(1.2);
const markerWithGradientSize = markerSize + gradientSize;
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
    backgroundColor: '#fff',
  },
  imageContainer: {
    height: imageSize,
    width: imageSize,
    borderRadius: imageSize / 2,
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    width: containerWidth,
    textAlign: 'center',
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
  badgeContainer: {
    position: 'absolute',
    zIndex: 1,
    top: -badgeSize / 3,
    left: containerWidth / 2 + badgeSize / 6,
    width: badgeSize,
    height: badgeSize,
    borderRadius: badgeSize / 2,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeInnerContainer: {
    width: badgeInnerSize,
    height: badgeInnerSize,
    borderRadius: badgeInnerSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'Medium',
    fontSize: wp(2.5),
    color: '#fff',
    paddingBottom: 1,
  },
});

export default React.memo(MapMarker, areEqual);
