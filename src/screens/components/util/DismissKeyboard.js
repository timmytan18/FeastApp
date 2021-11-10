import React from 'react';
import { TouchableWithoutFeedback, Keyboard, View } from 'react-native';

const DismissKeyboardView = ({ children, ...props }) => {
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View {...props}>
                {children}
            </View>
        </TouchableWithoutFeedback>
    );
}

export default DismissKeyboardView;