import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, Keyboard,
} from 'react-native';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { PhoneInput, PasswordInput, ConfirmPasswordInput } from './Input';
import {
  colors, sizes, wp, hp,
} from '../../constants/theme';

const ForgotPhone = ({ navigation }) => {
  const [phone, changePhone] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setError(null),
    );

    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);

  async function submitPhone() {
    const phoneCopy = phone.slice().replace(/\D/g, '');
    console.log(phoneCopy);
    Auth.forgotPassword(`+1${phoneCopy}`)
      .then((data) => {
        console.log(data);
        navigation.navigate('ForgotPassword', { phone: phoneCopy, back: false });
      })
      .catch((err) => {
        console.warn('Phone number error: ', err);
        if (err.code == 'UserNotFoundException') {
          setError("Sorry, we don't recognize that phone number");
        } else if (err.code == 'LimitExceededException') {
          setError('Sorry, attempt limit exceeded. Please try again after some time.');
        } else {
          setError('Error');
        }
      });
  }

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <BackArrow color={colors.tertiary} size={wp(9.6)} pressed={() => navigation.goBack()} />
          <Text style={styles.headerText}>
            Forgot Password
          </Text>
          <Text style={styles.subHeaderText}>
            A reset password code will be sent to your messages
          </Text>
          <PhoneInput onChange={changePhone} />
        </View>
        <View style={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Submit"
            disabled={phone === '' || error != null}
            error={error}
            pressed={() => {
              console.log('pressed');
              submitPhone();
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
    marginTop: wp(10),
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
    marginTop: wp(20),
    alignSelf: 'center',
  },
});

export default ForgotPhone;
