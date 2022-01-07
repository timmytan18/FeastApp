import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import { LinearGradient } from 'expo-linear-gradient';
import { createFeastItem, deleteFeastItem, incrementFeastItem } from '../../api/graphql/mutations';
import TwoButtonAlert from './util/TwoButtonAlert';
import { colors, gradients, shadows, sizes, wp, hp } from '../../constants/theme';

const FollowButton = ({ currentUser, myUser, containerStyle, textStyle }) => {

    // Destructure current user (profile user is viewing) object
    const { PK, SK, uid, name, username, identityId } = currentUser;
    let picture = null;
    if (currentUser.picture) {
        picture = currentUser.picture
    }

    // Create follower object using my info
    const myID = myUser.uid;
    const myPK = myUser.PK;
    const mySK = myUser.SK;
    const follower = {
        PK: myPK,
        SK: mySK,
        name: myUser.name,
        identityId: myUser.identityId,
        followedSK: SK,
        uid: myID
    }
    if (myUser.picture) {
        follower.picture = myUser.picture
    }
    
    const [following, setFollowing] = useState(currentUser.following);

		const changeFollowingConfirmation = () => {
				if (following) {
						TwoButtonAlert({ 
							title: `Unfollow ${currentUser.name}?`,
							yesButton: 'Confirm', 
							pressed: changeFollowing
						})
				} else {
						changeFollowing()
				}
		}

    const changeFollowing = async () => {

        // Add following/unfollowing to dynamo
        const currFollow = following;
        setFollowing(!currFollow)
        const mutation = currFollow ? deleteFeastItem : createFeastItem;
        const input = currFollow ?
            { PK: PK, SK: `#FOLLOWER#${myID}` } :
            { PK: PK, SK: `#FOLLOWER#${myID}`, GSI1: 'USER#', name, username, ...(picture && { picture }), identityId, uid, follower };
        console.log(input)
        try {
            await API.graphql(graphqlOperation(
                mutation,
                { input: input }
            ));
        } catch (err) {
            setFollowing(currFollow)
            console.log(err)
            Alert.alert(
                "Error",
                `Could not ${currFollow ? 'unfollow' : 'follow'}`,
                [{ text: "OK" }],
                { cancelable: false }
            );
            return
        }

        // Increment/decrement follower and following counts
        const one = currFollow ? -1 : 1;
        console.log('UPDATING FOLLOWS')
        console.log(PK)
        console.log(SK)
        console.log(one)
        console.log(myPK)
        console.log(mySK)
        try {
            await API.graphql(graphqlOperation(
                incrementFeastItem,
                { input: { PK: PK, SK: SK, numFollowers: one } }
            ));
            await API.graphql(graphqlOperation(
                incrementFeastItem,
                { input: { PK: myPK, SK: mySK, numFollowing: one } }
            ));
        } catch(err) {
            console.log(err)
        }
    }

    return (
      <View style={containerStyle}>
        {!following && 
            <TouchableOpacity
                onPress={changeFollowingConfirmation}
                activeOpacity={0.6}
                style={{ width: '100%', height: '100%' }}
            >
            <LinearGradient
              colors={gradients.purple.colors}
              start={gradients.purple.start}
              end={gradients.purple.end}
              style={[containerStyle, { width: '100%' }]}
            >
                <Text style={[textStyle, { color: colors.white }]}>Follow</Text>
                </LinearGradient>
            </TouchableOpacity>}
        {following && <TouchableOpacity
            style={[containerStyle, { backgroundColor: colors.gray3, width: '100%' }]}
            onPress={changeFollowingConfirmation}
            activeOpacity={0.6}
          >
            <Text style={[textStyle, { color: colors.black }]}>Following</Text>
        </TouchableOpacity>}
      </View>
    );
}

export default FollowButton;