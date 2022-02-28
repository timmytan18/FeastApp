import React, { useEffect, useContext } from 'react';
import { View, Image } from 'react-native';

import Amplify, {
  Auth, Hub, API, graphqlOperation,
} from 'aws-amplify';
import { useSafeAreaFrame } from 'react-native-safe-area-context'; // device height
import awsconfig from './aws-exports';

import { getUserProfileQuery } from './api/functions/queryFunctions';
import { updateFeastItem } from './api/graphql/mutations';

import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './screens/auth/AuthNavigator';
import { Context } from './Store';

Amplify.configure(awsconfig);
API.configure(awsconfig);

const Main = () => {
  const [state, dispatch] = useContext(Context);
  const frame = useSafeAreaFrame();

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
          noUser();
      }
    });

    // set device height
    dispatch({ type: 'SET_DEVICE_HEIGHT', payload: frame.height });

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
      const dynamoUser = await getUserProfileQuery({ uid: id });

      // identityId (S3), city, picture can be null
      const {
        PK, SK, uid, name, city, picture,
      } = dynamoUser;
      let { identityId } = dynamoUser;
      if (!identityId) {
        identityId = await updateIdentityId(PK, SK);
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

      if (picture) {
        try {
          await Image.prefetch(picture);
        } catch (e) {
          console.log('Error prefetching profile picture:', e);
        }
      }

      // Put user in global state
      dispatch({ type: 'SET_USER', payload: user });
    }

    function noUser(e) {
      dispatch({ type: 'SET_USER', payload: 'none' });
    }

    getUser().catch((e) => noUser(e));
  }, [dispatch]);

  if (!state.user) {
    return (null);
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
