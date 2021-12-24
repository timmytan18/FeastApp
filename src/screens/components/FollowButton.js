import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Alert } from 'react-native';
// import { StreamApp } from 'expo-activity-feed';
import { API, graphqlOperation } from 'aws-amplify';
// import { createFeastItem, deleteFeastItem, incrementFeastItem } from '../../api/graphql/mutations';
import { colors, shadows, sizes, wp, hp } from '../../constants/theme';


const FollowButton = (props) => {
    // return (
    //     <StreamApp.Consumer>
    //         {(appCtx) => {
    //             return <FollowButtonInner {...props} {...appCtx} />;
    //         }}
    //     </StreamApp.Consumer>
    // );
    return <FollowButtonInner {...props} {...appCtx} />
}

const FollowButtonInner = ({ client, currentUser, myUser }) => {

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

    const changeFollowing = async () => {

        // // Add following/unfollowing to dynamo
        // const currFollow = following;
        // setFollowing(!currFollow)
        // const mutation = currFollow ? deleteFeastItem : createFeastItem;
        // const input = currFollow ?
        //     { PK: PK, SK: `#FOLLOWER#${myID}` } :
        //     { PK: PK, SK: `#FOLLOWER#${myID}`, GSI1: 'USER#', name, username, ...(picture && { picture }), identityId, uid, follower };
        // console.log(input)
        // try {
        //     await API.graphql(graphqlOperation(
        //         mutation,
        //         { input: input }
        //     ));
        // } catch (err) {
        //     setFollowing(currFollow)
        //     console.log(err)
        //     Alert.alert(
        //         "Error",
        //         `Could not ${currFollow ? 'unfollow' : 'follow'}`,
        //         [{ text: "OK" }],
        //         { cancelable: false }
        //     );
        //     return
        // }

        // // Increment/decrement follower and following counts
        // const one = currFollow ? -1 : 1;
        // console.log('UPDATING FOLLOWS')
        // console.log(PK)
        // console.log(SK)
        // console.log(one)
        // console.log(myPK)
        // console.log(mySK)
        // try {
        //     await API.graphql(graphqlOperation(
        //         incrementFeastItem,
        //         { input: { PK: PK, SK: SK, numFollowers: one } }
        //     ));
        //     await API.graphql(graphqlOperation(
        //         incrementFeastItem,
        //         { input: { PK: myPK, SK: mySK, numFollowing: one } }
        //     ));
        // } catch(err) {
        //     console.log(err)
        // }

        // // Add following to Stream
        // const myTimeline = client.feed('timeline', myID)
        // const userFeed = uid;
        // if (currFollow) { // unfollow
        //     await myTimeline.unfollow('user', userFeed);
        // } else{
        //     await myTimeline.follow('user', userFeed);
        // }
    }

    return (
        <TouchableOpacity
            style={[styles.followContainer, { backgroundColor: following ? colors.gray3 : colors.accent }]}
            onPress={changeFollowing}
            activeOpacity={0.6}
        >
            <Text style={[styles.followText, { color: following ? colors.black : colors.white }]}>{following ? 'Following' : 'Follow'}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    followContainer: {
        width: '73%',
        height: hp(3) + wp(5),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center'
    },
    followText: {
        fontFamily: 'Medium',
        fontSize: sizes.b1,
        paddingTop: wp(0.3)
    }
});

export default FollowButton;