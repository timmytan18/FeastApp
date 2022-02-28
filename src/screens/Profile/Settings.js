import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Platform,
} from 'react-native';
import Amplify, { Auth } from 'aws-amplify';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { getUserEmailQuery } from '../../api/functions/queryFunctions';
import CenterSpinner from '../components/util/CenterSpinner';
import awsconfig from '../components/util/Link';
import Line from '../components/util/Line';
import NextArrow from '../components/util/icons/NextArrow';
import {
  wp, colors, sizes,
} from '../../constants/theme';

const Settings = ({ route }) => {
  const { uid } = route.params;

  const [email, setEmail] = useState('');
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

  const openPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync('https://www.feastapp.io/privacy/');
  };

  const openTermsOfService = () => {
    WebBrowser.openBrowserAsync('https://www.feastapp.io/terms/');
  };

  useEffect(() => {
    const controller = new AbortController();
    awsconfig.oauth.urlOpener = urlOpenerExpo;
    Amplify.configure(awsconfig);

    (async () => {
      const userEmail = await getUserEmailQuery({ uid });
      setEmail(userEmail);
    })();
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return <CenterSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <Text style={[styles.headerText, { fontSize: sizes.h3 }]}>Account</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.textInputTitle}>
            Email
          </Text>
          <View>
            <Text style={styles.textInput}>
              {' '}
              {email}
            </Text>
            <Line length={INPUT_WIDTH} color={colors.tertiary} />
          </View>
        </View>
        <TouchableOpacity style={styles.headerContainer} onPress={openPrivacyPolicy}>
          <Text style={styles.headerText}>Privacy Policy</Text>
          <View style={styles.arrowContainer}>
            <NextArrow color={colors.tertiary} size={wp(3)} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerContainer} onPress={openTermsOfService}>
          <Text style={styles.headerText}>Terms of Service</Text>
          <View style={styles.arrowContainer}>
            <NextArrow color={colors.tertiary} size={wp(3)} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.logOutContainer}>
        <Line length={wp(90)} color={colors.tertiary} stroke={3} />
        <TouchableOpacity onPress={() => Auth.signOut()}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const INPUT_WIDTH = wp(55);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 0.88,
    width: '100%',
    paddingHorizontal: sizes.margin,
    paddingTop: sizes.margin,
  },
  headerText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    color: colors.tertiary,
    marginTop: wp(3),
    marginLeft: wp(3),
    paddingRight: wp(2),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: wp(3),
  },
  arrowContainer: {
    marginBottom: wp(1.5),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(5),
    marginBottom: wp(8),
  },
  textInputTitle: {
    width: wp(21),
    fontFamily: 'Semi',
    fontSize: sizes.b1,
    color: colors.black,
    marginRight: wp(3.8),
    textAlign: 'center',
  },
  textInput: {
    height: wp(7.2),
    width: INPUT_WIDTH,
    fontFamily: 'Book',
    fontSize: sizes.b1,
    color: colors.tertiary,
    letterSpacing: 0.1,
  },
  logOutContainer: {
    flex: 0.12,
    alignItems: 'center',
  },
  logOutText: {
    fontFamily: 'Medium',
    fontSize: sizes.h3,
    color: colors.black,
    marginTop: wp(3),
  },
});

export default Settings;
