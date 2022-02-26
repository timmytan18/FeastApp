import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import Amplify, { Auth } from 'aws-amplify';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import CenterSpinner from '../components/util/CenterSpinner';
import awsconfig from '../components/util/Link';
import Line from '../components/util/Line';
import {
  wp, hp, colors, sizes,
} from '../../constants/theme';

const Settings = () => {
  const [isLoading, setLoading] = useState(false);

  const urlOpenerExpo = async (url, redirectUrl) => {
    const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
    if (type === 'success') {
      await setLoading(true);
      await WebBrowser.dismissBrowser();
      if (Platform.OS === 'ios') {
        return Linking.openURL(newUrl);
      }
    }
  };

  useEffect(() => {
    awsconfig.oauth.urlOpener = urlOpenerExpo;
    Amplify.configure(awsconfig);
  }, []);

  if (isLoading) {
    return <CenterSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer} />
      <View style={styles.logOutContainer}>
        <Line length={wp(90)} color={colors.accent} />
        <TouchableOpacity onPress={() => Auth.signOut()}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 0.88,
    backgroundColor: 'red',
  },
  logOutContainer: {
    flex: 0.12,
    alignItems: 'center',
  },
  logOutText: {
    fontFamily: 'Medium',
    fontSize: sizes.b0,
    color: colors.accent,
    marginTop: wp(3),
  },
});

export default Settings;
