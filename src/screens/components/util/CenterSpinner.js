import React from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

const CenterSpinner = ({ style, color }) => (
  <View style={[styles.container, { ...style }]}>
    <ActivityIndicator color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CenterSpinner;
