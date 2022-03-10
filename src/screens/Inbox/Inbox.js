import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  Animated, StatusBar, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PropTypes from 'prop-types';
import { Storage } from 'aws-amplify';
import { Context } from '../../Store';
import {
  colors, gradients, sizes, wp, shadows,
} from '../../constants/theme';

const Inbox = ({ navigation, route }) => {
  // Set necessary data
  const [state, dispatch] = useContext(Context);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={{ fontFamily: 'Book', fontSize: sizes.h4, marginBottom: wp(10) }}>
        Coming soon!
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Inbox;
