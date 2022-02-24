import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
} from 'react-native';
import { sizes, colors, wp } from '../../../constants/theme';

const Toggle = ({
  selectedColor, leftText, rightText, leftSelected, setLeftSelected,
}) => (
  <View style={styles.container}>
    <TouchableOpacity
      style={[
        styles.toggleButtonContainer,
        leftSelected && { backgroundColor: selectedColor },
      ]}
      activeOpacity={1}
      onPress={() => setLeftSelected(true)}
    >
      <Text
        style={[
          styles.toggleButtonText,
          leftSelected && { color: '#fff' },
        ]}
      >
        {leftText}
      </Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[
        styles.toggleButtonContainer,
        !leftSelected && { backgroundColor: selectedColor },
      ]}
      activeOpacity={1}
      onPress={() => setLeftSelected(false)}
    >
      <Text
        style={[
          styles.toggleButtonText,
          { fontSize: wp(3.67) },
          !leftSelected && { color: '#fff' },
        ]}
      >
        {rightText}
      </Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wp(44),
    height: wp(8.8),
    borderRadius: wp(2),
    borderWidth: 1.25,
    borderColor: colors.gray2,
    paddingHorizontal: 1.1,
    flexDirection: 'row',
  },
  toggleButtonContainer: {
    flex: 1,
    height: wp(8.8) - 4.5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: wp(2) - 2,
  },
  toggleButtonText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    color: colors.black,
  },
});

export default Toggle;
