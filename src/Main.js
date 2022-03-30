import React, { useEffect, useState, useContext } from 'react';
import { View, Image } from 'react-native';

import Amplify, {
  Auth, Hub, API, graphqlOperation,
} from 'aws-amplify';
import { useSafeAreaFrame } from 'react-native-safe-area-context'; // device height
import awsconfig from './aws-exports';

import { getUserProfileQuery, fulfillPromise } from './api/functions/queryFunctions';
import { updateFeastItem } from './api/graphql/mutations';

import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './screens/auth/AuthNavigator';
import { Context } from './Store';

import splash from '../assets/splash.png';

Amplify.configure(awsconfig);
API.configure(awsconfig);

const Main = () => {
  const [state, dispatch] = useContext(Context);
  const frame = useSafeAreaFrame();

  async function updateIdentityId(PK, SK) {
    const currentCreds = await Auth.currentCredentials();
    const { identityId } = currentCreds;
    try {
      await API.graphql(graphqlOperation(
        updateFeastItem,
        { input: { PK, SK, identityId } },
      ));
    } catch (err) {
      console.warn('Error updating identityId', err);
    }
    return identityId;
  }

  async function getUser() {
    // Fetch user Cognito credentials
    const cognitoUser = await Auth.currentAuthenticatedUser();
    const id = cognitoUser.attributes.sub;

    // Fetch user profile from DynamoDB
    const { promise, getValue, errorMsg } = getUserProfileQuery({ uid: id });
    const dynamoUser = await fulfillPromise(promise, getValue, errorMsg);

    // identityId (S3), city, picture can be null
    const {
      PK, SK, uid, name, city,
    } = dynamoUser;
    let { identityId, picture } = dynamoUser;
    if (!identityId) {
      identityId = await updateIdentityId(PK, SK);
    }
    if (!picture) {
      const { aws_user_files_s3_bucket: bucket } = awsconfig;
      const key = `profile_images/${uid}`;
      const url = `https://${bucket}.s3.amazonaws.com/public/${key}?${new Date()}`;
      picture = url;
    }
    const user = {
      PK,
      SK,
      uid,
      name,
      identityId,
      city,
      picture,
      // s3Picture is used to store user picture in DB for other items
      // state.user.picture can be overwritten when updating picture from local storage
      s3Picture: picture,
    };

    // Put user in global state
    dispatch({ type: 'SET_USER', payload: user });
  }

  function noUser(e) {
    dispatch({ type: 'SET_USER', payload: 'none' });
  }

  useEffect(() => {
    // listen to changes in sign in status
    Hub.listen('auth', ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          getUser().catch((e) => noUser(e));
          break;
        case 'signOut':
          noUser();
          break;
        default:
          getUser().catch((e) => noUser(e));
      }
    });

    // set device height
    dispatch({ type: 'SET_DEVICE_HEIGHT', payload: frame.height });

    (async () => {
      try {
        await getUser();
      } catch (e) {
        noUser(e);
      }
      setAppReady(true);
    })();
  }, []);

  const [appReady, setAppReady] = useState(false);

  if (!state.user || !appReady) {
    return (
      <View style={{ flex: 1 }}>
        <Image source={splash} resizeMode="cover" style={{ height: '100%', width: '100%' }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      {state.user === 'none' ? (
        <AuthNavigator />
      ) : (
        <AppNavigator />
      )}
    </View>
  );
};

export default Main;
