import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TextInput, Keyboard, Alert,
} from 'react-native';
import { API } from 'aws-amplify';
import Modal from 'react-native-modal';
import { getUserEmailQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import BigButton from './util/BigButton';
import {
  colors, shadows, sizes, wp,
} from '../../constants/theme';

const ReportModal = ({
  reportPressed, setReportPressed, onDismiss, sender, post, type,
}) => {
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      if (sender && sender.senderUID) {
        const { promise, getValue, errorMsg } = getUserEmailQuery({ uid: sender.senderUID });
        const userEmail = await fulfillPromise(promise, getValue, errorMsg);
        if (mounted.current) setEmail(userEmail);
      }
    })();
    return () => { mounted.current = false; };
  }, [sender.senderUID]);

  const sendReport = async () => {
    const body = {
      sender,
      email,
      post,
      description,
      type,
    };
    setLoading(true);
    try {
      const res = await API.post('feastapi', '/report', { body });
      if (!res.isSuccessful) throw new Error('Request success, email failed');
    } catch (e) {
      console.warn('Error sending issue report', e);
      setError('Error sending issue report');
      setLoading(false);
      return;
    }
    setLoading(false);
    Alert.alert(
      'Success',
      'Your report has been sent!',
      [{
        text: 'OK',
        onPress: closeModal,
      }],
      { cancelable: false },
    );
  };

  const closeModal = () => {
    Keyboard.dismiss();
    setDescription('');
    setReportPressed(false);
    setError(null);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      isVisible={reportPressed}
      backdropOpacity={0.5}
      backdropTransitionOutTiming={0}
      onBackdropPress={() => closeModal()}
      avoidKeyboard
      style={{ alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={styles.container}>
        <View style={styles.subContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.titleText}>Report an issue</Text>
          </View>
          <View style={styles.reviewContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              keyboardType="default"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={Keyboard.dismiss}
              onFocus={() => setError(null)}
              textAlignVertical="top"
              placeholder="What's wrong?"
              maxLength={500}
              onChangeText={(text) => setDescription(text)}
              value={description}
            />
          </View>
          <View style={{ alignSelf: 'center' }}>
            <BigButton
              text="Confirm"
              width={wp(30)}
              disabled={!description || loading || description.length < 20}
              loading={loading}
              error={error}
              height={wp(12)}
              fontSize={wp(4.8)}
              gradient="purple"
              pressed={sendReport}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;

const styles = StyleSheet.create({
  container: {
    height: wp(96),
    width: wp(89),
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: wp(5),
    paddingVertical: wp(4),
    alignItems: 'center',
    ...shadows.base,
  },
  subContainer: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  titleText: {
    fontSize: sizes.b0,
    fontFamily: 'Semi',
    color: colors.black,
    marginVertical: wp(2),
  },
  reviewContainer: {
    height: wp(50),
    backgroundColor: colors.gray2,
    width: '100%',
    borderRadius: wp(2),
    marginTop: wp(1.5),
    marginBottom: wp(5.6),
    paddingVertical: wp(3),
    paddingHorizontal: wp(4),
  },
  textInput: {
    flex: 1,
    fontFamily: 'Book',
    fontSize: sizes.b1,
    color: colors.black,
    letterSpacing: 0.4,
  },
});

// fetch('http://localhost:3000/report', {
//   method: 'POST', // *GET, POST, PUT, DELETE, etc.
//   mode: 'cors', // no-cors, *cors, same-origin
//   headers: {
//     'Content-Type': 'application/json',
//     // 'Content-Type': 'application/x-www-form-urlencoded',
//   },
//   body: JSON.stringify(body), // body data type must match "Content-Type" header
// })
//   .then((data) => data.json())
//   .then((data) => console.log(data))
//   .catch((err) => console.log('bad', err));
