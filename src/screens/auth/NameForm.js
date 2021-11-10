import React, { useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, View, Text, Keyboard } from 'react-native';
import { Auth } from 'aws-amplify';
import BackArrow from '../components/util/icons/BackArrow';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import BigButton from '../components/util/BigButton';
import { NameInput } from './Input';
import { colors, sizes, wp, hp } from '../../constants/theme';

const NameForm = ({ navigation }) => {

    const [firstName, changeFirstName] = useState('');
    const [lastName, changeLastName] = useState('');
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
                    <NameInput onChangeFirst={changeFirstName} onChangeLast={changeLastName} firstValue={firstName} lastValue={lastName} />
                </View>
                <View style={styles.buttonContainer}>
                    <BigButton
                        gradient='purple'
                        text='Confirm'
                        disabled={firstName === '' || lastName === '' || error != null}
                        error={error}
                        pressed={() => navigation.navigate('Register', { firstName: firstName, lastName: lastName })}
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
        fontSize: wp(8),
        color: colors.tertiary,
        marginTop: hp(5),
        marginLeft: wp(1)

    },
    subHeaderText: {
        fontFamily: 'Book',
        fontSize: sizes.h3,
        color: colors.tertiary,
        marginLeft: wp(0.5),
        marginTop: wp(1),
        marginLeft: wp(1)
    },
    buttonContainer: {
        height: wp(28),
        width: wp(45),
        marginTop: hp(10),
        alignSelf: 'center',
    }
});

export default NameForm;