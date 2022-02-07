import React, { useState, useRef } from 'react';
import {
  StyleSheet, View, TouchableOpacity, Text,
} from 'react-native';
import Save from './icons/Save';
import {
  colors, shadows, sizes, wp, hp,
} from '../../../constants/theme';

const SaveButton = ({ numYums, setNumYums, size }) => {
  const [pressed, setPressed] = useState(false);

  const savePressed = async () => {
    setPressed(!pressed);
  };

  return (
    <View style={styles.buttonContainer}>
      <View style={styles.container}>
        <TouchableOpacity style={{ width: '100%' }} activeOpacity={0.9} onPress={savePressed}>
          <Save size={size} color={pressed ? colors.accent : '#464A4F'} />
        </TouchableOpacity>
      </View>
      <Text style={styles.bottomButtonText}>{pressed ? 'Unsave' : 'Save'}</Text>
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
    color: 'white',
    paddingTop: wp(0.6),
  },
});

export default SaveButton;
