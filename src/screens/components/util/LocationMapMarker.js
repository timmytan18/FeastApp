import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePic from '../ProfilePic';
import {
  colors, shadows, gradients, wp, sizes,
} from '../../../constants/theme';

const LocationMapMarker = ({
  isUser, userPic, name, isDarkMode,
}) => {
  const gradient = isUser ? gradients.purple : gradients.orange;
  return (
    <View style={styles.rootContainer}>
      {userPic && (
        <View style={[styles.userContainer, shadows.base]}>
          <ProfilePic
            extUrl={userPic}
            size={userInnerSize}
            style={styles.userInnerContainer}
          />
        </View>
      )}
      {!userPic && (
        <View style={[styles.container, shadows.base]}>
          <LinearGradient
            style={styles.innerContainer}
            colors={gradient.colors}
            start={gradient.start}
            end={gradient.end}
          />
        </View>
      )}
      {name && (
        <View>
          <Text
            style={[
              styles.nameText, styles.textWithShadow,
              { color: isDarkMode ? 'white' : colors.black },
            ]}
          >
            {name}
          </Text>
        </View>
      )}
    </View>
  );
};

const markerSize = wp(6.3);
const borderWidth = 1.7;
const innerSize = markerSize - borderWidth * 4;

const userMarkerSize = wp(7.2);
const userBorderWidth = 0.9;
const userInnerSize = markerSize - userBorderWidth * 4;

const styles = StyleSheet.create({
  rootContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  userContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: userMarkerSize,
    width: userMarkerSize,
    borderColor: colors.white,
    borderRadius: userMarkerSize / 2,
    backgroundColor: colors.white,
  },
  userInnerContainer: {
    height: userInnerSize,
    width: userInnerSize,
    borderRadius: userInnerSize / 2,
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.black,
  },
  textWithShadow: {
    textShadowColor: 'rgba(255, 197, 41, 0.75)',
    textShadowOffset: { width: -2, height: 2 },
    textShadowRadius: 10,
  },
});

export default LocationMapMarker;
