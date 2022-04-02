import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import Mail from '../components/util/icons/Mail';
import Lock from '../components/util/icons/Lock';
import Unlock from '../components/util/icons/Unlock';
import BadgeCheck from '../components/util/icons/BadgeCheck';
import Line from '../components/util/Line';
import {
  colors, sizes, wp, wpFull,
} from '../../constants/theme';

const EmailInput = ({
  onChange, passwordInput, verified, checkValidEmail, value,
}) => (
  <View>
    <View style={styles.inputContainer}>
      <View style={[styles.iconContainer, { paddingBottom: wp(0.5) }]}>
        <Mail />
      </View>
      <TextInput
        style={styles.textInput}
        onChangeText={(text) => onChange(text)}
        placeholder="Email address"
        placeholderTextColor={`${colors.tertiary}70`}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={!verified}
        value={value || null}
        autoCompleteType="email"
        onEndEditing={checkValidEmail}
        onSubmitEditing={() => {
          if (passwordInput) { passwordInput.focus(); }
        }}
      />
    </View>
    <Line length={wpFull(100) - (sizes.margin * 2)} color={colors.tertiary} />
  </View>
);

const PasswordInput = ({
  onChange, setPasswordInput, confirmPasswordInput, checkPasswordLength, signIn, verified, value,
}) => (
  <View>
    <View style={[styles.inputContainer, { marginTop: wp(6) }]}>
      <View style={styles.iconContainer}>
        {signIn ? <Lock /> : <Unlock />}
      </View>
      <TextInput
        ref={(input) => { setPasswordInput(input); }}
        style={styles.textInput}
        onChangeText={(text) => onChange(text)}
        placeholder="Password"
        placeholderTextColor={`${colors.tertiary}70`}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        secureTextEntry
        passwordRules="none"
        textContentType="password"
        autoFocus={verified}
        onSubmitEditing={() => (confirmPasswordInput ? confirmPasswordInput.focus() : {})}
        onEndEditing={checkPasswordLength}
        value={value || null}
      />
    </View>
    <Line length={wpFull(100) - (sizes.margin * 2)} color={colors.tertiary} />
  </View>
);

const ConfirmPasswordInput = ({
  onChange, setConfirmPasswordInput, checkMatch, value,
}) => (
  <View>
    <View style={[styles.inputContainer, { marginTop: wp(6) }]}>
      <View style={styles.iconContainer}>
        <Lock />
      </View>
      <TextInput
        ref={(input) => { setConfirmPasswordInput(input); }}
        style={styles.textInput}
        onChangeText={(text) => onChange(text)}
        placeholder="Confirm password"
        placeholderTextColor={`${colors.tertiary}70`}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        secureTextEntry
        textContentType="password"
        onEndEditing={checkMatch}
        value={value || null}
      />
    </View>
    <Line length={wpFull(100) - (sizes.margin * 2)} color={colors.tertiary} />
  </View>
);

const NameInput = ({ onChange, value }) => (
  <View>
    <View style={styles.inputContainer}>
      <TextInput
        style={[styles.textInput, { flex: null, width: wpFull(94) - (sizes.margin), marginLeft: 5 }]}
        onChangeText={(text) => onChange(text)}
        placeholder="Full name"
        value={value || null}
        placeholderTextColor={`${colors.tertiary}70`}
        clearButtonMode="while-editing"
        textContentType="givenName"
        autoFocus
        autoCompleteType="name"
      />
    </View>
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <Line length={wpFull(94) - (sizes.margin)} color={colors.tertiary} />
    </View>
  </View>
);

const VerificationInput = ({ onChange, passwordInput }) => (
  <View>
    <View style={styles.inputContainer}>
      <View style={[styles.iconContainer, { paddingBottom: wp(0.5) }]}>
        <BadgeCheck />
      </View>
      <TextInput
        style={styles.textInput}
        onChangeText={(text) => onChange(text)}
        placeholder="Verification Code"
        placeholderTextColor={`${colors.tertiary}70`}
        autoCapitalize="none"
        clearButtonMode="while-editing"
        textContentType="oneTimeCode"
        autoFocus
        keyboardType="number-pad"
        onSubmitEditing={() => {
          if (passwordInput) { passwordInput.focus(); }
        }}
      />
    </View>
    <Line length={wpFull(100) - (sizes.margin * 2)} color={colors.tertiary} />
  </View>
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(10),
  },
  iconContainer: {
    flex: 0.1,
    height: wp(11),
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: wp(1.5),
  },
  textInput: {
    flex: 0.9,
    height: wp(11),
    marginLeft: wp(2),
    fontFamily: 'Book',
    fontSize: sizes.h3,
    letterSpacing: 0.1,
  },
});

export {
  EmailInput, PasswordInput, ConfirmPasswordInput, NameInput, VerificationInput,
};
