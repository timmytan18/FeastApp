import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
} from 'react-native';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import * as WebBrowser from 'expo-web-browser';
import { updateFeastItem } from '../../api/graphql/mutations';
import { getUserEmailQuery, getAllPostsQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import Line from '../components/util/Line';
import NextArrow from '../components/util/icons/NextArrow';
import TwoButtonAlert from '../components/util/TwoButtonAlert';
import { clearAllLocalData } from '../../api/functions/LocalStorage';
import {
  wp, colors, sizes,
} from '../../constants/theme';

const alterDb = async () => {
  const { promise, getValue, errorMsg } = getAllPostsQuery({});
  const posts = await fulfillPromise(promise, getValue, errorMsg);
  console.log(posts);

  posts.forEach(async ({ PK, SK, timestamp }) => {
    try {
      await API.graphql(graphqlOperation(
        updateFeastItem,
        { input: { PK, SK, LSI1: `#POSTTIME#${timestamp}` } },
      ));
    } catch (err) {
      console.warn('Error updating identityId', err);
    }
  });
};

const Settings = ({ route }) => {
  const { uid } = route.params;

  const [email, setEmail] = useState('');
  // const mounted = useRef(true);

  const openPrivacyPolicy = () => {
    WebBrowser.openBrowserAsync('https://www.feastapp.io/privacy/');
  };

  const openTermsOfService = () => {
    WebBrowser.openBrowserAsync('https://www.feastapp.io/terms/');
  };

  useEffect(() => {
    (async () => {
      const { promise, getValue, errorMsg } = getUserEmailQuery({ uid });
      const userEmail = await fulfillPromise(promise, getValue, errorMsg);
      // if (mounted.current)
      setEmail(userEmail);
    })();
    // return () => { mounted.current = false; };
  }, [uid]);

  const signOutConfirmation = () => {
    TwoButtonAlert({
      title: 'Log Out',
      yesButton: 'Confirm',
      pressed: async () => {
        await signOut();
        await clearAllLocalData();
        // await alterDb();
      },
    });
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
    } catch (e) {
      console.warn('Error signing out', e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainContainer}>
        <Text style={[styles.headerText, { fontSize: sizes.h3 }]}>Account</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.textInputTitle}>
            Email
          </Text>
          <View>
            <Text style={styles.textInput}>
              {' '}
              {email}
            </Text>
            <Line length={INPUT_WIDTH} color={colors.tertiary} />
          </View>
        </View>
        <TouchableOpacity style={styles.headerContainer} onPress={openPrivacyPolicy}>
          <Text style={styles.headerText}>Privacy Policy</Text>
          <View style={styles.arrowContainer}>
            <NextArrow color={colors.tertiary} size={wp(3)} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerContainer} onPress={openTermsOfService}>
          <Text style={styles.headerText}>Terms of Service</Text>
          <View style={styles.arrowContainer}>
            <NextArrow color={colors.tertiary} size={wp(3)} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.logOutContainer}>
        <Line length={wp(90)} color={colors.tertiary} stroke={3} />
        <TouchableOpacity onPress={signOutConfirmation}>
          <Text style={styles.logOutText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const INPUT_WIDTH = wp(55);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 0.88,
    width: '100%',
    paddingHorizontal: sizes.margin,
    paddingTop: sizes.margin,
  },
  headerText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    color: colors.tertiary,
    marginTop: wp(3),
    marginLeft: wp(3),
    paddingRight: wp(2),
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: wp(3),
  },
  arrowContainer: {
    marginBottom: wp(1.5),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: wp(5),
    marginBottom: wp(8),
  },
  textInputTitle: {
    width: wp(21),
    fontFamily: 'Semi',
    fontSize: sizes.b1,
    color: colors.black,
    marginRight: wp(3.8),
    textAlign: 'center',
  },
  textInput: {
    height: wp(7.2),
    width: INPUT_WIDTH,
    fontFamily: 'Book',
    fontSize: sizes.b1,
    color: colors.tertiary,
    letterSpacing: 0.1,
  },
  logOutContainer: {
    flex: 0.12,
    alignItems: 'center',
  },
  logOutText: {
    fontFamily: 'Medium',
    fontSize: sizes.h3,
    color: colors.black,
    marginTop: wp(3),
  },
});

export default Settings;
