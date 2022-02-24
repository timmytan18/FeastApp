import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import Yum from './icons/Yum';
import YumNoFill from './icons/YumNoFill';
import {
  colors, shadows, sizes, wp, hp,
} from '../../../constants/theme';

const YumButton = ({ size }) => {
  const [pressed, setPressed] = useState(false);
  const [yumCount, setYumCount] = useState(0);

  const yumPressed = async () => {
    if (pressed) {
      setYumCount(yumCount - 1);
    } else {
      setYumCount(yumCount + 1);
    }
    setPressed(!pressed);
  };

  return (

    <View style={styles.buttonContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.9} onPress={yumPressed}>
          {pressed && <Yum size={size} />}
          {!pressed && <YumNoFill size={size} />}
        </TouchableOpacity>
      </View>
      <Text style={styles.bottomButtonText}>
        {yumCount}
        {' '}
        Yums
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomButtonText: {
    fontSize: sizes.b3,
    fontFamily: 'Book',
    color: '#fff',
    paddingTop: wp(0.7),
  },
});

export default YumButton;
