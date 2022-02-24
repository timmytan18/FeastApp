import React from 'react';
import {
  StyleSheet, View, Image, Text,
} from 'react-native';
import ProfilePic from '../ProfilePic';
import { sizes, colors, wp } from '../../../constants/theme';

const UserPictureList = ({ userPics, size, limit }) => {
  const sizeWithBorder = size + imageBorderWidth;
  const imageStyle = {
    width: sizeWithBorder,
    height: sizeWithBorder,
    borderRadius: sizeWithBorder,
    marginRight: -(sizeWithBorder) / 7,
  };
  const uniqueUserPics = Array.from(new Set(userPics)); // unique user pics
  const limitedUserPics = uniqueUserPics.slice(0, limit);
  return (
    <View style={styles.container}>
      {limitedUserPics.map((pic, index) => (
        <View style={[imageStyle, styles.image, { zIndex: -index }]} key={pic}>
          <ProfilePic
            extUrl={pic}
            size={size - imageBorderWidth}
          />
        </View>
      ))}
      {uniqueUserPics.length > limit && (
        <View
          style={[
            imageStyle,
            styles.image,
            { zIndex: -limit },
            styles.plusContainer,
          ]}
        >
          <Text style={styles.plusText}>
            +
            {uniqueUserPics.length - limit}
          </Text>
        </View>
      )}
    </View>
  );
};

const imageBorderWidth = 1.25;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  image: {
    borderWidth: imageBorderWidth,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusContainer: {
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusText: {
    fontFamily: 'Book',
    fontSize: wp(2.6),
    color: '#fff',
    paddingBottom: 1,
  },
});

export default UserPictureList;
