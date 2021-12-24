import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { getUser, getFollowers, getFollowing, getIsFollowing } from '../../api/graphql/queries';
import ProfilePic from '../components/ProfilePic';
import CenterSpinner from '../components/util/CenterSpinner';
import { colors, gradients, sizes, wp, hp, shadows, header } from '../../constants/theme';

const FollowsList = ({ navigation, route }) => {

    const { PK, uid, type } = route.params;

    const [usersList, setUsersList] = useState(null);

    useEffect(() => {
        navigation.setOptions({
            title: <Text style={header.title}>{type}</Text>
        })
    }, [])
    
    // useEffect(() => {
        
    //     // function getProfilePictures(item) {
    //     //     if (type == 'Followers') {
    //     //         item = item.follower;
    //     //     }
    //     //     return new Promise((resolve, reject) => {
    //     //         if (item.picture) {
    //     //             resolve(item)
    //     //         } else {
    //     //             Storage.get('profile_pic.jpeg', { level: 'protected', identityId: item.identityId })
    //     //                 .then(url => {
    //     //                     item.picture = url;
    //     //                     resolve(item)
    //     //                 })
    //     //                 .catch(err => {
    //     //                     console.log(err)
    //     //                     reject()
    //     //                 });
    //     //         }
    //     //     });
    //     // }

    //     (async () => {
    //         let dynamoUsers;
    //         if (type == 'Followers') {
    //             try {
    //                 dynamoUsers = await API.graphql(graphqlOperation(
    //                     getFollowers,
    //                     { PK: PK, SK: { beginsWith: '#FOLLOWER#' }, limit: 50 }
    //                 ));
    //                 dynamoUsers = dynamoUsers.data.listFeastItems.items;
    //             } catch (err){
    //                 console.log(err)
    //             }
    //         } else if (type == 'Following') {
    //             try {
    //                 dynamoUsers = await API.graphql(graphqlOperation(
    //                     getFollowing,
    //                     { GSI1: 'USER#', SK: { beginsWith: `#FOLLOWER#${uid}` }, limit: 50 }
    //                 ));
    //                 dynamoUsers = dynamoUsers.data.itemsByGSI1.items;
    //             } catch (err){
    //                 console.log(err)
    //             }
    //         }
    //         console.log(dynamoUsers)
    //         setUsersList(dynamoUsers)
    //         // Promise.all(dynamoUsers.map(getProfilePictures)).then((users) => {
    //         //     console.log(users)
    //         //     setUsersList(users)
    //         // });          
    //     })();
    // }, [])

    // const fetchCurrentUser = async (currentPK, currentSK, currentProfilePic) => {
    //     let currentUser;
    //     try {
    //         currentUser = await API.graphql(graphqlOperation(
    //             getUser,
    //             { PK: currentPK, SK: currentSK }
    //         ));

    //         currentUser = currentUser.data.getFeastItem;
    //         currentUser.PK = currentPK;
    //         currentUser.SK = currentSK;
    //         currentUser.picture = currentProfilePic;
    //         currentUser.displayName = `${currentUser.name}`;

    //         if (type != 'Following') {
    //             const followSK = `#FOLLOWER#${uid}`;
    //             let following = await API.graphql(graphqlOperation(
    //                 getIsFollowing,
    //                 { PK: currentPK, SK: followSK }
    //             ));
    //             following = following.data.getFeastItem ? true : false;
    //             currentUser.following = following;
    //         } else {
    //             currentUser.following = true;
    //         }
    //         navigation.push('Profile', { user: currentUser })
            
    //     } catch (err) {
    //         console.log(err)
    //     }
    // }

    const renderUserItem = ({ item }) => {

        if (type == 'Following') {
            item.SK = item.follower.followedSK; // set current sk to who user is following's sk
        } else {
            item = item.follower;
        }

        console.log(item)
        
        return (
            <TouchableOpacity
                style={styles.userItemContainer}
                activeOpacity={0.5}
                onPress={() => fetchCurrentUser(item.PK, item.SK, item.picture)}
            >
                <ProfilePic
                    uid={item.uid}
                    extUrl={item.picture}
                    size={wp(10)}
                    style={{ marginHorizontal: sizes.margin }}
                />
                <View style={styles.infoContainer}>
                    <Text style={styles.userNameText}>{item.name}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.container}>
            {!usersList && <View style={{ flex: 0.2 }}><CenterSpinner /></View>}
            {usersList &&
                <FlatList
                    style={{ flex: 1, width: '100%' }}
                    data={usersList}
                    extraData={usersList}
                    renderItem={renderUserItem}
                    keyExtractor={item => {type == 'Following' ? item.PK : item.follower.PK }}
                    showsVerticalScrollIndicator={true}
                    onScrollBeginDrag={Keyboard.dismiss}
                    keyboardShouldPersistTaps='handled'
                    ListHeaderComponent={<View style={{ height: wp(3) }} />}
                    ListFooterComponent={<View style={{ height: wp(3) }} />}
                />
            }
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: wp(3.5),
        backgroundColor: 'white'
    },
    userItemContainer: {
        flex: 1,
        height: wp(17),
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },
    userNameText: {
        fontFamily: 'Semi',
        fontSize: sizes.h4,
        color: colors.black,
    }
});

export default FollowsList;