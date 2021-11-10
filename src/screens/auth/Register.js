import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Keyboard } from 'react-native';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { PhoneInput, PasswordInput, ConfirmPasswordInput } from './Input';
import { colors, sizes, wp, hp } from '../../constants/theme';

const Register = ({ navigation, route }) => {

    const firstName = route.params.firstName;
    const lastName = route.params.lastName;

    const [phone, changePhone] = useState('');
    const [password, changePassword] = useState('');
    const [confirmPassword, changeConfirmPassword] = useState('');
    const [error, setError] = useState(null);

    const [passwordInput, setPasswordInput] = useState(null);
    const [confirmPasswordInput, setConfirmPasswordInput] = useState(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setError(null)
        );

        return () => {
            keyboardDidShowListener.remove()
        }
    }, [])

    async function signUp() {
        const phoneCopy = phone.slice().replace(/\D/g,'');
        console.log(phoneCopy)
        try {
            const user = await Auth.signUp({
                username: `+1${phoneCopy}`,
                password: password,
                attributes: {
                    phone_number: `+1${phoneCopy}`,
                    'custom:first_name': firstName,
                    'custom:last_name': lastName
                }
            });
            console.log(user)
            navigation.navigate('Verification', { phone: phoneCopy, back: false })
        } catch (err) {
            console.log('error signing up:', err);
            if (err.code == 'UsernameExistsException') {
                setError('Hmm, it seems like this phone number already has an account, try logging in or use another number!')
            } else if (err.code == 'InvalidParameterException') {
                if (!error) {
                    setError('Invalid phone number')
                }
            } else {
                setError('Registration Error')
            }
        }
    }

    function checkInvalidInput() {
        return (phone.length < 10 || password === '' || confirmPassword === '' || password !== confirmPassword || error != null)
    }

    return (
        <DismissKeyboardView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View>
                    <BackArrow color={colors.tertiary} size={wp(9.6)} pressed={() => navigation.goBack()} />
                    <Text style={styles.headerText}>
                        Register
                    </Text>
                    <PhoneInput onChange={changePhone} passwordInput={passwordInput} checkValidNumber={() => {
                        if (phone.length < 10) {
                            setError("Invalid phone number")
                        } else {
                            setError(null)
                        }
                    }} />
                    <PasswordInput onChange={changePassword} setPasswordInput={setPasswordInput} confirmPasswordInput={confirmPasswordInput} checkPasswordLength={() => {
                        if (password.length < 8) {
                            setError("Password must be at least 8 characters")
                        } else {
                            setError(null)
                        }
                    }} value={password} />
                    <ConfirmPasswordInput onChange={changeConfirmPassword} setConfirmPasswordInput={setConfirmPasswordInput} checkMatch={() => {
                        if (phone.length < 10) {
                            setError("Invalid phone number")
                        } else if (password.length < 8) {
                            setError("Password must be at least 8 characters")
                        }
                        else if (password !== confirmPassword) {
                            setError("Passwords don't match")
                        } else {
                            setError(null)
                        }
                    }} value={confirmPassword} />
                </View>
                <View style={styles.buttonContainer}>
                    <BigButton
                        gradient='purple'
                        text='Confirm'
                        disabled={checkInvalidInput()}
                        error={error}
                        pressed={() => {
                            signUp()
                            Keyboard.dismiss()
                        }}
                    />
                </View>
            </SafeAreaView>
        </DismissKeyboardView>
    );
}

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
        marginTop: hp(5)
    },
    buttonContainer: {
        height: wp(28),
        width: wp(45),
        marginTop: hp(10),
        alignSelf: 'center',
    }
});

export default Register;