import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, KeyboardAvoidingView, Keyboard } from 'react-native';
import { Auth } from 'aws-amplify';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BackArrow from '../components/util/icons/BackArrow';
import BigButton from '../components/util/BigButton';
import TwoButtonAlert from '../components/util/TwoButtonAlert';
import { VerificationInput } from './Input';
import { colors, sizes, wp, hp } from '../../constants/theme';

const Verification = ({ navigation, route }) => {

    const [code, changeCode] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            () => setError(null)
        );

        return () => {
            keyboardDidShowListener.remove()
        }
    }, [])

    async function resendConfirmationCode() {
        setError(null)
        try {
            await Auth.resendSignUp(`+1${route.params.phone}`);
            console.log('code resent succesfully');
        } catch (err) {
            console.log('error resending code: ', err);
            setError(`Error resending code`)
        }
    }

    async function confirmSignUp() {
        setError(null)
        try {
            await Auth.confirmSignUp(`+1${route.params.phone}`, code);
            navigation.navigate('LogIn', { phone: route.params.phone })
        } catch (err) {
            console.log('error confirming sign up', err);
            if (err.code == 'CodeMismatchException') {
                setError(`Error: Invalid code`)
            } else {
                setError('Verification Error')
            }
        }
    }

    return (
        <DismissKeyboardView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View>
                    {route.params.back && <BackArrow color={colors.tertiary} size={wp(9.6)} pressed={() => navigation.goBack()} />}
                    <Text style={styles.headerText}>
                        Verify Your Identity
                    </Text>
                    <Text style={styles.subHeaderText}>
                        Check your messages for a verification code!
                    </Text>
                    <VerificationInput onChange={changeCode} />
                </View>
                <TouchableOpacity onPress={() =>
                    TwoButtonAlert({ title: 'Resend Code', message: `To: ${route.params.phone}`, yesButton: 'Confirm', pressed: resendConfirmationCode })
                }>
                    <Text style={styles.resendText}>
                        Resend Code
                    </Text>
                </TouchableOpacity>
                <KeyboardAvoidingView behavior='position' contentContainerStyle={styles.buttonContainer}>
                    <BigButton
                        gradient='purple'
                        text='Verify'
                        disabled={code === ''}
                        error={error}
                        pressed={() => confirmSignUp()}
                    />
                </KeyboardAvoidingView>
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
        fontSize: wp(7),
        color: colors.tertiary,
        marginTop: hp(4),
        textAlign: 'center'
    },
    subHeaderText: {
        fontFamily: 'Book',
        fontSize: wp(4.7),
        color: colors.tertiary,
        marginTop: hp(1),
        textAlign: 'center'
    },
    resendText: {
        marginTop: hp(2),
        alignSelf: 'center',
        fontFamily: 'Book',
        fontSize: sizes.b1,
        color: colors.accent,
    },
    buttonContainer: {
        height: wp(28),
        width: wp(45),
        marginTop: hp(10),
        alignSelf: 'center',
    }
});

export default Verification;