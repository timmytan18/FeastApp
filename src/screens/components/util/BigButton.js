import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import CenterSpinner from './CenterSpinner';
import {
  colors, gradients, sizes, wp, hp,
} from '../../../constants/theme';

const BigButton = ({
  color, text, pressed, disabled, error, width, height, fontSize, gradient, loading,
}) => {
  if (!height) { height = wp(14); }
  if (!width) { width = wp(45); }

  if (gradient) {
    return (
      <View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={{ height, width }} disabled={disabled} onPress={pressed}>
          <LinearGradient
            colors={gradients[gradient].colors}
            start={gradients[gradient].start}
            end={gradients[gradient].end}
            style={[styles.button, {
              height,
              width,
              borderRadius: height / 2,
              opacity: disabled ? 0.5 : 1,
            }]}
          >
            {loading ? <CenterSpinner size={height} color={color} />
              : (
                <Text style={[styles.buttonText, { fontSize: fontSize || sizes.h2 }]}>
                  {text}
                </Text>
              )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      <TouchableOpacity
        style={[styles.button, {
          height,
          width,
          borderRadius: height / 2,
          backgroundColor: disabled && !gradient ? `${color}60` : color,
        }]}
        disabled={disabled}
        onPress={pressed}
      >
        {loading ? <CenterSpinner size={height} color={color} />
          : (
            <Text style={[styles.buttonText, { fontSize: fontSize || sizes.h2 }]}>
              {text}
            </Text>
          )}
      </TouchableOpacity>
    </View>
  );
};

export default BigButton;

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Semi',
    color: '#fff',
  },
  errorText: {
    alignSelf: 'center',
    paddingBottom: wp(2),
    color: 'red',
    fontFamily: 'Book',
    fontSize: sizes.b2,
    textAlign: 'center',
  },
});
