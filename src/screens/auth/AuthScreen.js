import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, ImageBackground, Button, Image, Text, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-community/masked-view';
import Amplify, { Auth } from 'aws-amplify';
import * as Linking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { FontAwesome } from '@expo/vector-icons';
import awsconfig from '../components/util/Link';
import {
  colors, sizes, wp, hp, gradients,
} from '../../constants/theme';
import Logo from '../components/util/icons/Logo';
import CenterSpinner from '../components/util/CenterSpinner';

const AuthScreen = ({ navigation }) => {
  SplashScreen.hideAsync();

  const [isLoading, setLoading] = useState(false);

  // const urlOpenerExpo = async (url, redirectUrl) => {
  //     const { type, url: newUrl } = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
  //     if (type === 'success') {
  //         await setLoading(true)
  //         await WebBrowser.dismissBrowser();
  //         if (Platform.OS === 'ios') {
  //             return Linking.openURL(newUrl);
  //         }
  //     }
  // };

  // useEffect(() => {
  //     awsconfig.oauth.urlOpener = urlOpenerExpo;
  //     Amplify.configure(awsconfig);
  // }, [])

  if (isLoading) {
    return <CenterSpinner />;
  }

  return (
    <ImageBackground
      style={styles.container}
      source={require('../../../assets/authbackground.jpg')}
      resizeMode="cover"
    >
      <Logo style={styles.logoIcon} large />
      <MaskedView
        maskElement={
          <Text style={styles.titleText}>Feast</Text>
        }
      >
        <LinearGradient
          colors={gradients.orange.colors}
          start={gradients.orange.start}
          end={gradients.orange.end}
          style={{ width: wp(30), height: wp(15) }}
        />
      </MaskedView>
      <Text style={styles.subTitleText}>
        Food with Friends
      </Text>
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('NameForm')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={gradients.purple.colors}
            start={gradients.purple.start}
            end={gradients.purple.end}
            style={styles.signUpContainer}
          >
            <Text style={styles.buttonText}>
              Sign Up
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.logInContainer}>
          <Text style={styles.logInText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('LogIn')}
          >
            <Text style={styles.logInBtnText}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* <Text style={styles.orText}>Or</Text> */}
      {/* <TouchableOpacity
                style={styles.facebookLoginContainer}
                onPress={() => Auth.federatedLogIn({ provider: 'Facebook' })}
            >
                <Text style={[styles.buttonText, { marginLeft: wp(6) }]}>
                    Continue with Facebook
                </Text>
                <FontAwesome name="facebook-square" style={styles.facebookIcon} />
            </TouchableOpacity> */}
      <TouchableOpacity onPress={() => { }}>
        <Text style={styles.termsText}>TERMS AND CONDITIONS</Text>
      </TouchableOpacity>
      {/* <Button
                title="Logout"
                onPress={() => Auth.signOut()}
                style={styles.fbButton}
            /> */}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
  },
  logoIcon: {
    marginTop: wp(36),
    marginBottom: wp(2),
  },
  titleText: {
    color: colors.primary,
    fontFamily: 'SemiItalic',
    fontSize: wp(11),
    letterSpacing: 0.8,
    alignSelf: 'center',
  },
  subTitleText: {
    color: colors.tertiary,
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    marginTop: -wp(1),
  },
  facebookLoginContainer: {
    width: wp(82),
    height: wp(15),
    marginVertical: wp(12),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#3479E6',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    marginTop: 1,
  },
  logInContainer: {
    width: wp(100),
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: wp(2),
    alignItems: 'flex-end',
  },
  logInText: {
    alignSelf: 'center',
    color: colors.tertiary,
    fontFamily: 'Book',
    fontSize: sizes.b2,
    marginTop: wp(3),
  },
  logInBtnText: {
    color: colors.tertiary,
    fontFamily: 'Semi',
    fontSize: sizes.b2,
    textDecorationLine: 'underline',
  },
  facebookIcon: {
    fontSize: wp(11),
    marginRight: wp(6),
    color: '#fff',
  },
  orText: {
    color: '#fff',
    fontFamily: 'Semi',
    fontSize: sizes.h3,
  },
  bottomContainer: {
    flex: 1,
    marginTop: wp(16),
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  signUpContainer: {
    width: wp(70),
    height: wp(14.5),
    borderRadius: wp(14.5) / 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    color: '#fff',
    fontFamily: 'Medium',
    fontSize: sizes.caption,
    textDecorationLine: 'underline',
    paddingBottom: wp(5),
  },
});

export default AuthScreen;
