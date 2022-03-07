import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, TouchableOpacity, KeyboardAvoidingView, Keyboard,
} from 'react-native';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { EmailInput, PasswordInput } from './Input';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const LogIn = ({ navigation, route }) => {
  const [email, changeEmail] = useState('');
  const [password, changePassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [passwordInput, setPasswordInput] = useState(null);

  const verified = !!((route.params && route.params.email));
  const resetPassword = route.params && route.params.reset;

  useEffect(() => {
    if (verified) {
      changeEmail(route.params.email);
      navigation.setOptions({ gestureEnabled: false });
    }

    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setError(null),
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, [verified]);

  async function signIn() {
    setLoading(true);
    const currEmail = email.slice().toLowerCase().replace(/\s/g, '');
    try {
      const user = await Auth.signIn(currEmail, password);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      if (err.code === 'UserNotConfirmedException') {
        navigation.navigate('Verification', { email, back: true });
      } else if (err.code === 'UserNotFoundException') {
        setError("Sorry, we don't recognize that email");
      } else if (err.code === 'NotAuthorizedException') {
        setError("Email and password don't match");
      } else {
        setError('Log In Error');
      }
    }
  }

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          {!verified && <BackArrow color={colors.tertiary} size={wp(9.6)} pressed={() => navigation.goBack()} />}
          <Text style={[styles.headerText, { marginTop: verified ? wp(8) : wp(10) }]}>
            Log In
          </Text>
          {verified
            && (
              <Text style={styles.securityText}>
                You have successfully
                {resetPassword ? ' reset your password. ' : ' verified your account. '}
                For your security, please sign in now.
              </Text>
            )}
          <EmailInput onChange={changeEmail} passwordInput={passwordInput} verified={verified} value={verified ? route.params.email : null} />
          <PasswordInput onChange={changePassword} setPasswordInput={setPasswordInput} signIn verified={verified} />
          <TouchableOpacity style={styles.troubleContainer} onPress={() => navigation.navigate('ForgotEmail')}>
            <Text style={styles.troubleText}>
              Trouble Logging In?
            </Text>
          </TouchableOpacity>
        </View>
        <KeyboardAvoidingView behavior="position" contentContainerStyle={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Log In"
            loading={loading}
            disabled={email === '' || password === ''}
            error={error}
            pressed={() => {
              signIn();
              Keyboard.dismiss();
            }}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </DismissKeyboardView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: sizes.margin,
    marginVertical: sizes.margin * 3,
  },
  headerText: {
    fontFamily: 'Semi',
    fontSize: wp(9),
    color: colors.tertiary,
  },
  securityText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    color: colors.tertiary,
    marginLeft: wp(0.5),
    marginTop: wp(1),
  },
  troubleContainer: {
    width: wp(42),
    alignSelf: 'flex-end',
  },
  troubleText: {
    marginTop: wp(4),
    alignSelf: 'flex-end',
    fontFamily: 'Book',
    fontSize: sizes.b2,
    color: colors.accent,
  },
  buttonContainer: {
    height: wp(28),
    width: wp(45),
    marginTop: wp(20),
    alignSelf: 'center',
  },
});

export default LogIn;
