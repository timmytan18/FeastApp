import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, Keyboard,
} from 'react-native';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { EmailInput, PasswordInput, ConfirmPasswordInput } from './Input';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const Register = ({ navigation, route }) => {
  const { name } = route.params;

  const [email, changeEmail] = useState('');
  const [password, changePassword] = useState('');
  const [confirmPassword, changeConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

  async function signUp() {
    setLoading(true);
    const currEmail = email.slice().toLowerCase().replace(/\s/g, '');
    try {
      const user = await Auth.signUp({
        username: currEmail,
        password,
        attributes: {
          email: currEmail,
          'custom:name': name,
        },
      });
      setLoading(false);
      navigation.navigate('Verification', { email: user.user.username, back: false });
    } catch (err) {
      setLoading(false);
      console.log(err);
      if (err.code === 'UsernameExistsException') {
        setError('It seems like this email already has an account - try logging in or use another email!');
      } else if (err.code === 'InvalidParameterException') {
        if (!error) {
          setError('Invalid email');
        }
      } else {
        setError('Registration Error');
      }
    }
  }

  const validateEmail = () => {
    const reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    return reg.test(email);
  };

  function checkInvalidInput() {
    return (!validateEmail(email) || password === '' || confirmPassword === ''
      || password !== confirmPassword || password.length < 8 || error != null);
  }

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <BackArrow color={colors.tertiary} size={wp(9.6)} pressed={() => navigation.goBack()} />
          <Text style={styles.headerText}>
            Register
          </Text>
          <EmailInput
            onChange={changeEmail}
            passwordInput={passwordInput}
            checkValidEmail={() => {
              if (validateEmail()) {
                setError(null);
              } else {
                setError('Invalid email');
              }
            }}
          />
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
            value={password}
          />
          <ConfirmPasswordInput
            onChange={changeConfirmPassword}
            setConfirmPasswordInput={setConfirmPasswordInput}
            checkMatch={() => {
              if (password.length < 8) {
                setError('Password must be at least 8 characters');
              } else if (password !== confirmPassword) {
                setError("Passwords don't match");
              } else if (password.length < 8) {
                setError('Password must be at least 8 characters');
                if (!validateEmail()) {
                  setError('Invalid email');
                } else {
                  setError(null);
                }
              }
            }}
            value={confirmPassword}
          />
        </View>
        <View style={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Confirm"
            disabled={checkInvalidInput()}
            error={error}
            loading={loading}
            pressed={() => {
              signUp();
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
    fontSize: wp(9),
    color: colors.tertiary,
    marginTop: wp(10),
  },
  buttonContainer: {
    height: wp(28),
    width: wp(45),
    marginTop: wp(20),
    alignSelf: 'center',
  },
});

export default Register;
