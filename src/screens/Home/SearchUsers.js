import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, SafeAreaView, View, Button, Image, TouchableOpacity, Animated, FlatList, Keyboard } from 'react-native';
import { Context } from '../../Store';
import { API, graphqlOperation, Storage } from 'aws-amplify';
import { searchUsers, getUserProfile, getIsFollowing } from '../../api/graphql/queries';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import SearchBox from '../components/SearchBox';
import ProfilePic from '../components/ProfilePic';
import CenterSpinner from '../components/util/CenterSpinner';
import { colors, gradients, sizes, wp, hp, shadows } from '../../constants/theme';

const SearchUsers = ({ navigation }) => {

    const [state, dispatch] = useContext(Context);
    const [loading, setLoading] = useState(false);
    const PK = state.user.PK;
    const ID = state.user.uid;

    const position = useRef(new Animated.Value(0)).current;
    const [searchByName, setSearchByName] = useState(true)

    const translate = position.interpolate({
        inputRange: [0, 1],
        outputRange: [0, wp(50)]
    })

    const users = [
        {
            PK: '123',
            SK: '123',
            name: 'Robert Carter',
            city: 'Atlanta, GA',
            picture: 'https://s3-media0.fl.yelpcdn.com/bphoto/kJsqljnVkJQOnEwhMJXxDg/o.jpg'
        },
        {
            PK: '321',
            SK: '123',
            name: 'John Smith',
            city: 'Atlanta, GA',
            picture: 'https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
        },
        {
            PK: '214',
            SK: '123',
            name: 'Daniel Craig',
            city: 'Atlanta, GA',
            picture: 'https://images.unsplash.com/photo-1534614971-6be99a7a3ffd?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80'
        },
    ]

    const [usersList, setUsersList] = useState(users);

    // function getProfilePictures(item) {
    //     return new Promise((resolve, reject) => {
    //         if (item.picture) {
    //             resolve(item)
    //         } else {
    //             Storage.get('profile_pic.jpeg', { identityId: item.identityId })
    //                 .then(url => {
    //                     item.picture = url;
    //                     resolve(item)
    //                 })
    //                 .catch(err => {
    //                     console.log(err)
    //                     reject()
    //                 });
    //         }
    //     });
    // }

    const searchForUser = async (query) => {
        if (query) {
            setLoading(true)
            // Query dynamo for users by name or city
            const SK = `${searchByName ? '#PROFILE#' : '#CITY#'}${query.replace(/\s+/g, '').toLowerCase()}`

            let dynamoUsers;
            try {
                dynamoUsers = await API.graphql(graphqlOperation(
                    searchUsers,
                    { GSI1: 'USER#', SK: { beginsWith: SK }, limit: 50 }
                ));
                dynamoUsers = dynamoUsers.data.itemsByGSI1.items;
            } catch (err) {
                console.log(err)
            }

            setUsersList(dynamoUsers)
            setLoading(false)
            // Promise.all(dynamoUsers.map(getProfilePictures)).then((users) => {
            //     setUsersList(users)
            //     setLoading(false)
            // });            
        } else {
            setUsersList(users)
        }
    }

    const fetchCurrentUser = async (currentPK, currentSK, currentProfilePic) => {
      console.log(currentPK, currentSK, currentProfilePic)
        let currentUser;
        try {
            currentUser = await API.graphql(graphqlOperation(
              getUserProfile, { PK: currentPK, SK: { beginsWith: currentSK } }
            ));
            currentUser = currentUser.data.listFeastItems.items[0];
            currentUser.PK = currentPK;
            currentUser.SK = currentSK;
            currentUser.picture = currentProfilePic;

            if (currentPK != PK) {
                const followSK = `#FOLLOWER#${ID}`;
                let following = await API.graphql(graphqlOperation(
                    getIsFollowing,
                    { PK: currentPK, SK: followSK }
                ));
                currentUser.following = following.data.getFeastItem ? true : false;
            }

            navigation.push('Profile', { user: currentUser })

        } catch (err) {
            console.log(err)
        }
    }

    const renderUserItem = ({ item }) => {

        return (
            <TouchableOpacity
                style={styles.userItemContainer}
                activeOpacity={0.5}
                onPress={() => fetchCurrentUser(item.PK, item.SK, item.picture)}
            >
                <View style={styles.userIconContainer}>
                    <ProfilePic
                        extUrl={item.picture}
                        isMe={false}
                        size={USER_ICON_SIZE}
                        style={styles.userIconImage}
                    />
                </View>
                <View style={styles.infoContainer}>
                    <Text style={styles.userNameText}>{item.name}</Text>
                    {item.city && <Text style={styles.userCityText}>{item.city}</Text>}
                </View>
                <View style={styles.distanceContainer}>
                    {/* <Car size={wp(4.5)} />
                    <Text style={styles.distanceText}>{distance} mi</Text> */}
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <DismissKeyboardView style={{ flex: 1 }}>
                <View style={{ overflow: 'hidden', paddingBottom: wp(3), ...shadows.lighter }}>
                    <View style={styles.headerContainer}>
                        <View style={{ flex: 1, paddingHorizontal: sizes.margin }}>
                            <SearchBox
                                completeSearch={searchForUser}
                                placeholder={searchByName ? 'Search for a user' : 'Search for a place'}
                                autofocus={true}
                            />
                        </View>
                        <TouchableOpacity
                            style={styles.cancelContainer}
                            onPress={() => navigation.goBack()}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.tabContainer}>
                        <TouchableOpacity activeOpacity={1} style={styles.tab} onPress={() => {
                            setSearchByName(true)
                            Animated.spring(position, {
                                toValue: 0,
                                speed: 40,
                                bounciness: 2,
                                useNativeDriver: true
                            }).start()
                        }}>
                            <Text style={styles.tabText}>User</Text>
                            <Animated.View style={[styles.slider, { transform: [{ translateX: translate }] }]} />
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={1} style={styles.tab} onPress={() => {
                            setSearchByName(false)
                            Animated.spring(position, {
                                toValue: 1,
                                speed: 40,
                                bounciness: 2,
                                useNativeDriver: true
                            }).start()
                        }}>
                            <Text style={styles.tabText}>Place</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.container}>
                    {!loading &&
                        <FlatList
                            style={{ flex: 1, width: '100%' }}
                            data={usersList}
                            extraData={usersList}
                            renderItem={renderUserItem}
                            keyExtractor={item => item.PK}
                            showsVerticalScrollIndicator={true}
                            onScrollBeginDrag={Keyboard.dismiss}
                            keyboardShouldPersistTaps='handled'
                        />
                    }
                    {loading && <View style={{ flex: 0.2 }}><CenterSpinner /></View>}
                </View>
            </DismissKeyboardView>
        </SafeAreaView>
    );
}

const USER_ICON_SIZE = wp(12);
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
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
    userIconContainer: {
        height: USER_ICON_SIZE,
        width: USER_ICON_SIZE,
        marginHorizontal: sizes.margin,
        borderRadius: USER_ICON_SIZE / 2,
        // backgroundColor: colors.gray
    },
    userIconImage: {
        flex: 1,
        borderRadius: USER_ICON_SIZE / 2,
    },
    userNameText: {
        fontFamily: 'Medium',
        fontSize: sizes.h4,
        color: colors.black,
    },
    userCityText: {
        fontFamily: 'Book',
        fontSize: sizes.b3,
        color: colors.primary,
        lineHeight: sizes.b3 * 1.3,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: hp(1),
        backgroundColor: 'white',
    },
    cancelContainer: {
        alignSelf: 'center',
        paddingRight: wp(5),
        paddingTop: wp(2)
    },
    cancelText: {
        fontFamily: 'Book',
        fontSize: sizes.h4,
        color: colors.black,
    },
    tabText: {
        fontFamily: 'Medium',
        fontSize: sizes.h4,
        color: colors.black,
        paddingBottom: wp(2)
    },
    tabContainer: {
        height: hp(7),
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
    },
    tab: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    slider: {
        position: 'absolute',
        bottom: 0,
        height: wp(1),
        width: wp(40),
        alignSelf: 'center',
        backgroundColor: colors.tertiary,
        borderTopLeftRadius: wp(1),
        borderTopRightRadius: wp(1)
    }
});

export default SearchUsers;