import React, { useEffect, useContext } from 'react';
import { View, Image, SafeAreaView } from 'react-native';

// import Amplify, { Auth, Hub, API, graphqlOperation } from 'aws-amplify';
import Amplify, { Auth, Hub } from 'aws-amplify';
// import AWSAppSyncClient from 'aws-appsync';
import awsconfig from './aws-exports';

// import { getFeastItem } from './graphql/queries';
// import { updateFeastItem } from './api/graphql/mutations';

// import { Rehydrated } from 'aws-appsync-react';

import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './screens/auth/AuthNavigator';
import { Context } from './Store';

// import { StreamApp } from 'expo-activity-feed';
// import config from './config';

Amplify.configure(awsconfig);

// async function getFbUser(token) {
//     try {
//         const response = await fetch(`https://graph.facebook.com/me?access_token=${token}&fields=
//             picture.type(large),
//             friends
//         `);
//         return await response.json();
//     } catch (e) {
//         console.log(e)
//     }
// }

const Main = () => {
    // const client = new AWSAppSyncClient({
    //     url: awsconfig.aws_appsync_graphqlEndpoint,
    //     region: awsconfig.aws_appsync_region,
    //     auth: {
    //         type: awsconfig.aws_appsync_authenticationType,
    //         apiKey: awsconfig.aws_appsync_apiKey,
    //         credentials: () => Auth.currentCredentials(),
    //         jwtToken: async () =>
    //             (await Auth.currentSession()).getAccessToken().getJwtToken()
    //     },
    //     complexObjectsCredentials: () => Auth.currentCredentials(),
    //     disableOffline: true
    // });

    const [state, dispatch] = useContext(Context);

    useEffect(() => {
        // listen to changes in sign in status
        Hub.listen("auth", ({ payload: { event, data } }) => {
            switch (event) {
                case "signIn":
                    console.log('sign in')
                    getUser().catch((e) => noUser(e))
                    break;
                case "signOut":
                    console.log('sign out')
                    noUser()
                    break;
            }
        });

        getUser().catch((e) => noUser(e))

        // async function updateIdentityId(PK, SK) {
        //     const currentCreds = await Auth.currentCredentials();
        //     console.log(currentCreds)
        //     const identityId = currentCreds.identityId;
        //     try {
        //         await API.graphql(graphqlOperation(
        //             updateFeastItem,
        //             { input: { PK: PK, SK: SK, identityId: identityId } }
        //         ));
        //     } catch(err) {
        //         console.log(err)
        //     }
        //     return identityId;
        // }

        async function getUser() {
            console.log('getting user')
            // Fetch user from DynamoDB
            const cognitoUser = await Auth.currentAuthenticatedUser();
            console.log(cognitoUser)
            const name = cognitoUser.attributes.name.replace(/\s+/g, '');;
            const id = cognitoUser.attributes.sub;
            const pk = `USER#${id}`;
            const sk = `#PROFILE#${name.toLowerCase()}#${id}`;
            console.log(pk)
            console.log(sk)
            // let dynamoUser;
            // try {
            //     dynamoUser = await API.graphql(graphqlOperation(getFeastItem, { PK: pk, SK: sk }));
            // } catch (err) {
            //     console.log(err)
            // }

            // const { PK, SK, email, picture, streamToken, uid } = dynamoUser.data.getFeastItem;
            // let identityId = dynamoUser.data.getFeastItem.identityId;
            // console.log(identityId)
            // if (!identityId) {
            //     identityId = await updateIdentityId(PK, SK)
            // }
            // const user = { PK, SK, email, picture, uid, streamToken, name, username, identityId };
            // const user = { pk, sk, id, name, username };
            const user = { pk, sk, id, name };
            // user.displayName = `${name}`;

            // let pfpError = false;
            // if (picture) {
            //     try {
            //         await Image.prefetch(picture)
            //     } catch (e) {
            //         pfpError = true;
            //     }
            // }

            // Logged in from Facebook and no user picture
            // if (!picture && await cognitoUser.attributes['custom:token_facebook'] || pfpError) {
            //     console.log('No picture')
            //     const fbUser = await getFbUser(await cognitoUser.attributes['custom:token_facebook']);

            //     // Put fb user picture in Dynamo
            //     try {
            //         await API.graphql(graphqlOperation(
            //             updateFeastItem,
            //             { input: { PK: PK, SK: SK, picture: fbUser.picture.data.url } }
            //         ));
            //         user.picture = fbUser.picture.data.url
            //     } catch(err) {
            //         console.log(err)
            //     }
            // }

            // Put user in global state
            dispatch({ type: 'SET_USER', payload: user })
        }

        function noUser(e) {
            console.log("Not signed in")
            console.log(e)
            dispatch({ type: 'SET_USER', payload: 'none' })
        }
    }, [])

    // if (!client || !state.user) {
    //     return (null);
    // }
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
            {/* {state.user === 'none' ? (
                <AuthNavigator />
            ) : (
                <StreamApp
                    token={state.user.streamToken}
                    apiKey="jp9v8yve5r75"
                    appId="104051"
                    token="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoidXNlci1vbmUifQ.nboSc94LTaEPXDmHejGhwY7LR0TfP_UdwyQ2tSm_QYA"
                >
                    <AppNavigator />
                </StreamApp>
            )} */}
        </View>
    );
}

export default Main;
