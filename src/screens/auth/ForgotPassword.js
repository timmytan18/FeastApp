import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, Keyboard,
} from 'react-native';
import { Auth } from 'aws-amplify';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { VerificationInput, PasswordInput, ConfirmPasswordInput } from './Input';
import {
  colors, sizes, wp, hp,
} from '../../constants/theme';

const ForgotPassword = ({ navigation, route }) => {
  const [code, changeCode] = useState('');
  const [password, changePassword] = useState('');
  const [confirmPassword, changeConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const [passwordInput, setPasswordInput] = useState(null);
  const [confirmPasswordInput, setConfirmPasswordInput] = useState(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setError(null),
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  async function resetPassword() {
    Auth.forgotPasswordSubmit(`+1${route.params.phone}`, code, password)
      .then((data) => {
        navigation.navigate('LogIn', { phone: route.params.phone, reset: true });
      })
      .catch((err) => {
        console.warn('Verification code error: ', err);
        if (err.code == 'CodeMismatchException') {
          setError('Error: Invalid verification code');
        } else {
          setError('Error');
        }
      });
  }

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <Text style={styles.headerText}>
            Reset Password
          </Text>
          <Text style={styles.subHeaderText}>
            Check your messages for a verification code
          </Text>
          <VerificationInput onChange={changeCode} passwordInput={passwordInput} />
          <PasswordInput
            onChange={changePassword}
            setPasswordInput={setPasswordInput}
            confirmPasswordInput={confirmPasswordInput}
            checkPasswordLength={() => {
              if (password.length < 8) {
                setError('Password must be at least 8 characters');
              } else {
                setError(null);
              }
            }}
          />
          <ConfirmPasswordInput
            onChange={changeConfirmPassword}
            setConfirmPasswordInput={setConfirmPasswordInput}
            checkMatch={() => {
              if (password.length < 8) {
                setError('Password must be at least 8 characters');
              } else if (password !== confirmPassword) {
                setError("Passwords don't match");
              } else {
                setError(null);
              }
            }}
          />
        </View>
        <View style={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Confirm"
            disabled={code === '' || password === '' || confirmPassword === '' || error != null}
            error={error}
            pressed={() => {
              resetPassword();
              Keyboard.dismiss();
            }}
          />
        </View>
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
    fontSize: wp(8),
    color: colors.tertiary,
    marginTop: hp(4),
  },
  subHeaderText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    color: colors.tertiary,
    marginLeft: wp(0.5),
    marginTop: wp(1),
  },
  buttonContainer: {
    height: wp(28),
    width: wp(45),
    marginTop: hp(10),
    alignSelf: 'center',
  },
});

export default ForgotPassword;
