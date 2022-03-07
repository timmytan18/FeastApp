import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import ProfilePic from '../screens/components/ProfilePic';
import { colors, wp } from '../constants/theme';

const TabIcon = ({
  icon, image, focused, size,
}) => {
  const width = size || wp(7.2);
  const imageStyle = focused
    ? styles.imageFocused
    : { ...styles.image, width, height: width };

  return (
    <View style={styles.container}>
      {image
        ? (
          <ProfilePic
            extUrl={image}
            isMe
            size={imageStyle.width}
            style={imageStyle}
          />
        )
        : icon}
      {focused
        && <View style={[styles.image, image ? styles.circleBorder : styles.noImageFocused]} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: wp(7.2),
    height: wp(7.2),
    borderRadius: wp(3.6),
  },
  imageFocused: {
    width: wp(5.8),
    height: wp(5.8),
    borderRadius: wp(2.9),
  },
  circleBorder: {
    position: 'absolute',
    borderWidth: 1.3,
    borderColor: colors.black,
  },
  noImageFocused: {
    position: 'absolute',
  },
});

export default TabIcon;
