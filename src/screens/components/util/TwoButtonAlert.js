import React from 'react';
import { Alert } from 'react-native';

function TwoButtonAlert({
  title, message, yesButton, pressed, onCancel,
}) {
  return (
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          onPress: () => {
            onCancel
              ? onCancel()
              : console.log('Cancel Pressed');
          },
          style: 'cancel',
        },
        { text: yesButton, onPress: () => pressed() },
      ],
      { cancelable: false },
    )
  );
}

export default TwoButtonAlert;
