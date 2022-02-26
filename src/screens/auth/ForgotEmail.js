import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, Keyboard,
} from 'react-native';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { EmailInput } from './Input';
import {
  colors, sizes, wp, hp,
} from '../../constants/theme';

const ForgotEmail = ({ navigation }) => {
  const [email, changeEmail] = useState('');
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

  async function submitEmail() {
    setLoading(true);
    Auth.forgotPassword(email)
      .then((data) => {
        setLoading(false);
        navigation.navigate('ForgotPassword', { email, back: false });
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        if (err.code === 'UserNotFoundException') {
          setError("Sorry, we don't recognize that email");
        } else if (err.code === 'LimitExceededException') {
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
            A reset password code will be sent to your email.
          </Text>
          <EmailInput onChange={changeEmail} />
        </View>
        <View style={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Submit"
            disabled={email === '' || error != null}
            error={error}
            loading={loading}
            pressed={() => {
              submitEmail();
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
    marginTop: hp(5),
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

export default ForgotEmail;
