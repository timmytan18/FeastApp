import React, { useState, useEffect } from 'react';
import {
  StyleSheet, SafeAreaView, View, Text, Keyboard,
} from 'react-native';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { NameInput } from './Input';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const NameForm = ({ navigation }) => {
  const [name, changeName] = useState('');
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

  function onChangeName(name) {
    changeName(name.replace(/[^a-zA-Z ]/g, '').replace(/\s\s+/g, ' ')); // remove non-letters and repeating spaces
  }

  const onSubmit = () => {
    const nameTrimmed = name.trim(); // remove leading and trailing spaces
    navigation.navigate('Register', { name: nameTrimmed });
  };

  return (
    <DismissKeyboardView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <View>
          <BackArrow color={colors.tertiary} size={wp(9.6)} pressed={() => navigation.goBack()} />
          <Text style={styles.headerText}>
            Hi there!
          </Text>
          <Text style={styles.subHeaderText}>
            What's your name?
          </Text>
          <NameInput onChange={onChangeName} value={name} />
        </View>
        <View style={styles.buttonContainer}>
          <BigButton
            gradient="purple"
            text="Next"
            disabled={name === '' || error != null}
            error={error}
            pressed={onSubmit}
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
    marginLeft: wp(1),

  },
  subHeaderText: {
    fontFamily: 'Book',
    fontSize: sizes.h3,
    color: colors.tertiary,
    marginTop: wp(1),
    marginLeft: wp(1),
  },
  buttonContainer: {
    height: wp(28),
    width: wp(45),
    marginTop: wp(20),
    alignSelf: 'center',
  },
});

export default NameForm;
