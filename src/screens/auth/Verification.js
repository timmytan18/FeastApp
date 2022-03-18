import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, TouchableOpacity, KeyboardAvoidingView, Keyboard,
} from 'react-native';
import { Auth } from 'aws-amplify';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BackArrow from '../components/util/icons/BackArrow';
import BigButton from '../components/util/BigButton';
import TwoButtonAlert from '../components/util/TwoButtonAlert';
import { VerificationInput } from './Input';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const Verification = ({ navigation, route }) => {
  const { email, back } = route.params;

  const [code, changeCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setError(null),
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  async function resendConfirmationCode() {
    setError(null);
    try {
      await Auth.resendSignUp(email);
    } catch (err) {
      console.warn('error resending code: ', err);
      setError('Error resending code');
    }
  }

  async function confirmSignUp() {
    setError(null);
    setLoading(true);
    try {
      await Auth.confirmSignUp(email, code);
      setLoading(false);
      navigation.navigate('LogIn', { email });
    } catch (err) {
      setLoading(false);
      if (err.code === 'CodeMismatchException') {
        setError('Error: Invalid code');
      } else {
        setError('Verification Error');
      }
    }
  }

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          {back
            && (
              <BackArrow
                color={colors.tertiary}
                size={wp(9.6)}
                pressed={() => navigation.goBack()}
              />
            )}
          <Text style={styles.headerText}>
            Verify Your Identity
          </Text>
          <Text style={styles.subHeaderText}>
            Check your email for a verification code!
          </Text>
          <VerificationInput onChange={changeCode} />
        </View>
        <TouchableOpacity onPress={() => TwoButtonAlert({
          title: 'Resend Code',
          message: `If you have not received the email, please check your spam folder. \n\nTo: ${email}`,
          yesButton: 'Confirm',
          pressed: resendConfirmationCode,
        })}
        >
          <Text style={styles.resendText}>
            Resend Code
          </Text>
        </TouchableOpacity>
        <KeyboardAvoidingView behavior="position" contentContainerStyle={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Verify"
            disabled={code === ''}
            error={error}
            loading={loading}
            pressed={() => confirmSignUp()}
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
    fontSize: wp(7),
    color: colors.tertiary,
    marginTop: wp(8),
    textAlign: 'center',
  },
  subHeaderText: {
    fontFamily: 'Book',
    fontSize: wp(4.7),
    color: colors.tertiary,
    marginTop: wp(2),
    textAlign: 'center',
  },
  resendText: {
    marginTop: wp(4),
    alignSelf: 'center',
    fontFamily: 'Book',
    fontSize: sizes.b1,
    color: colors.accent,
  },
  buttonContainer: {
    height: wp(28),
    width: wp(45),
    marginTop: wp(20),
    alignSelf: 'center',
  },
});

export default Verification;
