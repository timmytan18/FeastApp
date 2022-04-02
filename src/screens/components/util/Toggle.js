import React from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  sizes, colors, gradients, wp, wpFull,
} from '../../../constants/theme';

const Toggle = ({
  selectedColor, gradient, leftText, rightText, leftSelected, setLeftSelected,
}) => {
  if (gradient) {
    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={[!leftSelected ? styles.toggleButtonContainer : { flex: 1 }]}
          activeOpacity={1}
          onPress={() => setLeftSelected(true)}
        >
          {leftSelected ? (
            <LinearGradient
              colors={gradients.orange.colors}
              start={gradients.orange.start}
              end={gradients.orange.end}
              style={[styles.toggleButtonContainer, { borderWidth: 1.5, borderColor: '#fff' }]}
            >
              <Text
                style={[
                  styles.toggleButtonText,
                  { fontSize: wp(3.67) },
                  leftSelected && { color: '#fff' },
                ]}
              >
                {leftText}
              </Text>
            </LinearGradient>
          ) : (
            <Text
              style={[
                styles.toggleButtonText,
                { fontSize: wp(3.67) },
                leftSelected && { color: '#fff' },
              ]}
            >
              {leftText}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[leftSelected ? styles.toggleButtonContainer : { flex: 1 }]}
          activeOpacity={1}
          onPress={() => setLeftSelected(false)}
        >
          {!leftSelected ? (
            <LinearGradient
              colors={gradients.orange.colors}
              start={gradients.orange.start}
              end={gradients.orange.end}
              style={[styles.toggleButtonContainer, { borderWidth: 1.5, borderColor: '#fff' }]}
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
            </LinearGradient>
          ) : (
            <Text
              style={[
                styles.toggleButtonText,
                { fontSize: wp(3.67) },
                !leftSelected && { color: '#fff' },
              ]}
            >
              {rightText}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }
  return (
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
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    width: wpFull(44),
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
