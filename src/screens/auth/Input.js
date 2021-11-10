import React, { useState, useRef } from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import Phone from '../components/util/icons/Phone';
import Lock from '../components/util/icons/Lock';
import Unlock from '../components/util/icons/Unlock';
import BadgeCheck from '../components/util/icons/BadgeCheck';
import Line from '../components/util/Line';
import { colors, sizes, wp, hp } from '../../constants/theme';

const PhoneInput = ({ onChange, passwordInput, verified, checkValidNumber, value }) => {
    return (
        <View>
            <View style={styles.inputContainer}>
                <View style={[styles.iconContainer, { paddingBottom: wp(0.5) }]}>
                    <Phone />
                </View>
                <TextInput
                    style={styles.textInput}
                    onChangeText={text => onChange(text)}
                    placeholder='Phone number'
                    placeholderTextColor={`${colors.tertiary}70`}
                    autoCapitalize='none'
                    clearButtonMode='while-editing'
                    keyboardType='phone-pad'
                    textContentType='telephoneNumber'
                    autoFocus={!verified}
                    value={value ? value : null}
                    autoCompleteType='tel'
                    onEndEditing={checkValidNumber}
                    onSubmitEditing={() => {
                        if (passwordInput) { passwordInput.focus() }
                    }}
                />
            </View>
            <Line length={wp(100) - (sizes.margin * 2)} color={colors.tertiary} />
        </View>
    );
}

const PasswordInput = ({ onChange, setPasswordInput, confirmPasswordInput, checkPasswordLength, signIn, verified, value }) => {
    return (
        <View>
            <View style={[styles.inputContainer, { marginTop: hp(3) }]}>
                <View style={styles.iconContainer}>
                    {signIn ? <Lock /> : <Unlock />}
                </View>
                <TextInput
                    ref={(input) => { setPasswordInput(input) }}
                    style={styles.textInput}
                    onChangeText={text => onChange(text)}
                    placeholder='Password'
                    placeholderTextColor={`${colors.tertiary}70`}
                    autoCapitalize='none'
                    clearButtonMode='while-editing'
                    secureTextEntry={true}
                    passwordRules='none'
                    textContentType='password'
                    autoFocus={verified}
                    onSubmitEditing={() => confirmPasswordInput ? confirmPasswordInput.focus() : {}}
                    onEndEditing={checkPasswordLength}
                    value={value ? value : null}
                />
            </View>
            <Line length={wp(100) - (sizes.margin * 2)} color={colors.tertiary} />
        </View>
    );
}

const ConfirmPasswordInput = ({ onChange, setConfirmPasswordInput, checkMatch, value }) => {
    return (
        <View>
            <View style={[styles.inputContainer, { marginTop: hp(3) }]}>
                <View style={styles.iconContainer}>
                    <Lock />
                </View>
                <TextInput
                    ref={(input) => { setConfirmPasswordInput(input) }}
                    style={styles.textInput}
                    onChangeText={text => onChange(text)}
                    placeholder='Confirm password'
                    placeholderTextColor={`${colors.tertiary}70`}
                    autoCapitalize='none'
                    clearButtonMode='while-editing'
                    secureTextEntry={true}
                    textContentType='password'
                    onEndEditing={checkMatch}
                    value={value ? value : null}
                />
            </View>
            <Line length={wp(100) - (sizes.margin * 2)} color={colors.tertiary} />
        </View>
    );
}

const NameInput = ({ onChangeFirst, onChangeLast, firstValue, lastValue }) => {

    const lastNameInput = useRef(null);

    return (
        <View>
            <View style={styles.inputContainer}>
                <TextInput
                    style={[styles.textInput, { flex: null, width: wp(48) - (sizes.margin), marginLeft: 1 }]}
                    onChangeText={text => onChangeFirst(text)}
                    placeholder='First name'
                    value={firstValue ? firstValue : null}
                    placeholderTextColor={`${colors.tertiary}70`}
                    clearButtonMode='while-editing'
                    textContentType='givenName'
                    autoFocus={true}
                    autoCompleteType='name'
                    onSubmitEditing={() => lastNameInput.current && lastNameInput.current.focus()}
                />
                <TextInput
                    ref={lastNameInput}
                    style={[styles.textInput, { flex: null, width: wp(48) - (sizes.margin), marginLeft: sizes.margin }]}
                    onChangeText={text => onChangeLast(text)}
                    placeholder='Last name'
                    value={lastValue ? lastValue : null}
                    placeholderTextColor={`${colors.tertiary}70`}
                    clearButtonMode='while-editing'
                    textContentType='familyName'
                    autoCompleteType='name'
                />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Line length={wp(48) - (sizes.margin)} color={colors.tertiary} />
                <Line length={wp(48) - (sizes.margin)} color={colors.tertiary} />
            </View>
        </View>
    );
}

const VerificationInput = ({ onChange, passwordInput }) => {
    return (
        <View>
            <View style={styles.inputContainer}>
                <View style={[styles.iconContainer, { paddingBottom: wp(0.5) }]}>
                    <BadgeCheck />
                </View>
                <TextInput
                    style={styles.textInput}
                    onChangeText={text => onChange(text)}
                    placeholder='Verification Code'
                    placeholderTextColor={`${colors.tertiary}70`}
                    autoCapitalize='none'
                    clearButtonMode='while-editing'
                    textContentType='oneTimeCode'
                    autoFocus={true}
                    autoCompleteType='email'
                    onSubmitEditing={() => {
                        if (passwordInput) { passwordInput.focus() }
                    }}
                />
            </View>
            <Line length={wp(100) - (sizes.margin * 2)} color={colors.tertiary} />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: hp(5),
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

export { PhoneInput, PasswordInput, ConfirmPasswordInput, NameInput, VerificationInput };