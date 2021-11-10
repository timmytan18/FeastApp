import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, Text, SafeAreaView, View, Image, TouchableOpacity, Animated, SectionList } from 'react-native';
// import { API, graphqlOperation, Storage } from 'aws-amplify';
// import { getNumFollows } from '../../api/graphql/queries';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Context } from '../../Store';
import EditProfile from './EditProfile';
import ProfilePic from '../components/ProfilePic';
import { link } from '../components/OpenLink';
import MoreView from '../components/MoreView';
import FollowButton from '../components/FollowButton';
import More from '../components/util/icons/More';
import ThreeDots from '../components/util/icons/ThreeDots';
import HeartEyes from '../components/util/icons/HeartEyes';
import Heart from '../components/util/icons/Heart';
import Gear from '../components/util/icons/Gear';
import Utensils from '../components/util/icons/Utensils';
import MapMarker from '../components/util/icons/MapMarker';
import Instagram from '../components/util/icons/Instagram';
import BackArrow from '../components/util/icons/BackArrow';
import CenterSpinner from '../components/util/CenterSpinner';
import { colors, gradients, sizes, wp, hp, shadows } from '../../constants/theme';

const Profile = ({ navigation, route }) => {

    const [state, dispatch] = useContext(Context);
    const [isLoading, setLoading] = useState(false);
    const headerHeight = state.headerHeight - getStatusBarHeight();

    const [refreshing, setRefreshing] = useState(false);
    const numRefresh = useRef(0);
    const [morePressed, setMorePressed] = useState(false);
    const [editPressed, setEditPressed] = useState(false);

    const onTab = !(route && route.params && route.params.user);
    const isMe = !(!onTab && route.params.user.PK != state.user.PK);
    const user = isMe ? state.user : route.params.user;

    const [numFollows, setNumFollows] = useState([0, 0]);

    // async function getNumberFollows() {
    //     let num = [1, 1];
    //     try {
    //         let res = await API.graphql(graphqlOperation(
    //             getNumFollows,
    //             { PK: user.PK, SK: user.SK }
    //         ));
    //         res = res.data.getFeastItem;
    //         num = [res.numFollowers, res.numFollowing]            
    //     } catch (err) {
    //         console.log(err)
    //     }
    //     return num;
    // }

    // useEffect(() => {
    //     (async () => {
    //         const num = await getNumberFollows();
    //         setNumFollows(num)
    //         setRefreshing(false)
    //     })();
    // }, [numRefresh.current])

    if (isLoading) {
        return <CenterSpinner />
    }

    const moreItems = [
        {
            onPress: () => navigation.navigate('RestaurantList', { type: 'favorites' }),
            icon: <HeartEyes size={wp(7)} />,
            label: 'My Favorites'
        },
        {
            onPress: () => navigation.navigate('RestaurantList', { type: 'likes' }),
            icon: <Heart />,
            label: 'My Likes'
        },
        {
            onPress: () => navigation.navigate('Settings'),
            icon: <Gear />,
            label: 'Settings',
            end: true
        },
    ];

    const renderTopContainer = () => {
        return (
            <View style={styles.topContainer}>
                <View style={{ ...shadows.lighter }}>
                    <View style={[styles.headerContainer, { height: headerHeight }]}>
                        <View style={styles.headerTitleContainer}>
                            {!onTab && <View style={styles.backArrowContainer}>
                                <BackArrow
                                    color={colors.black}
                                    size={wp(5.5)}
                                    style={{ flex: 1 }}
                                    pressed={() => navigation.goBack()}
                                />
                            </View>}
                            <Text style={styles.headerTitle}>
                                {user.displayName}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.moreButton}
                            onPress={() => setMorePressed(true)}
                        >
                            {isMe ? <More /> : <View style={{ paddingTop: 3 }}><ThreeDots rotated={true} size={wp(4.6)} /></View>}
                        </TouchableOpacity>
                    </View>
                    <View style={styles.topProfileContainer}>
                        <View style={{ flexDirection: 'row', flex: 0.7, justifyContent: 'center' }}>
                            <View style={styles.pfpContainer}>
                                <ProfilePic
                                    uid={user.uid}
                                    extUrl={user.picture}
                                    size={wp(19)}
                                    style={styles.userPicture}
                                />
                                <Text style={styles.locationText}>Atlanta, GA</Text>
                            </View>
                            <View style={styles.infoContainer}>
                                <View style={styles.followContainer}>
                                    <TouchableOpacity
                                        style={styles.followButton}
                                        onPress={() =>
                                            navigation.push(
                                                'FollowsList',
                                                { PK: user.PK, uid: user.uid, type: 'Followers' }
                                            )
                                        }
                                    >
                                        <Text style={styles.followCountText}>{numFollows[0]}</Text>
                                        <Text style={styles.followText}>Followers</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.followButton}
                                        onPress={() =>
                                            navigation.push(
                                                'FollowsList',
                                                { PK: user.PK, uid: user.uid, identityId: user.identityId, type: 'Following' }
                                            )
                                        }
                                    >
                                        <Text style={styles.followCountText}>{numFollows[1]}</Text>
                                        <Text style={styles.followText}>Following</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.followButton}
                                    >
                                        <Text style={styles.followCountText}>13</Text>
                                        <Text style={styles.followText}>Restaurants</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={styles.actionsContainer}>
                                    {isMe &&
                                    <TouchableOpacity
                                        style={[styles.editContainer, { backgroundColor: colors.gray3 }]}
                                        onPress={() => setEditPressed(true)}
                                    >
                                        <Text style={[styles.editText, { color: colors.black }]}>Edit Profile</Text>
                                    </TouchableOpacity>}
                                    {!isMe &&
                                        <FollowButton
                                            currentUser={user}
                                            myUser={state.user}
                                        />
                                    }
                                    <TouchableOpacity style={styles.socialContainer} onPress={() => link('INSTAGRAM', user.instagram)}>
                                        <Instagram />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity activeOpacity={1} style={styles.tab} onPress={() => {
                                Animated.spring(position, {
                                    toValue: 0,
                                    speed: 40,
                                    bounciness: 2
                                }).start()
                            }}>
                                <View style={styles.tabIcon}><Utensils /></View>
                                <Animated.View style={[styles.slider, { transform: [{ translateX: translate }] }]} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={1} style={styles.tab} onPress={() => {
                                Animated.spring(position, {
                                    toValue: 1,
                                    speed: 40,
                                    bounciness: 2
                                }).start()
                            }}>
                                <View style={styles.tabIcon}><MapMarker /></View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    const renderItem = (item) => {
        return <View style={{ backgroundColor: 'red' }} />
    }


    const position = useRef(new Animated.Value(0)).current;

    const translate = position.interpolate({
        inputRange: [0, 1],
        outputRange: [0, wp(100) / 2 - wp(3) * 2]
    })

    // placeholders
    user.instagram = 'tim0_otan'

    const ratings = 4.5;
    const photo = 'https://s3-media0.fl.yelpcdn.com/bphoto/a2hkhqRpe2tWE2_Gb9ZhyA/o.jpg';
    const businessName = 'Pho King Midtown';
    const post = { ratings, photo, businessName }
    const data = [{ title: 'profile', data: [post, post, post, post, post] }]

    async function getUserExample() {
        let picture;
        try {
            picture = await Storage.get('profile_pic.jpeg', { 
                level: 'protected',
                identityId: 'us-east-1:aa1501cc-1832-499b-910e-5939a9657ba8'
            })
        } catch (err) {
            console.log(err)
        }
        setExamplePic(picture)
        console.log(picture)
    }

    const [examplePic, setExamplePic] = useState(null);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <MoreView items={moreItems} morePressed={morePressed} setMorePressed={setMorePressed} />
            <EditProfile editPressed={editPressed} setEditPressed={setEditPressed} user={user} />
            <SectionList
                sections={data}
                keyExtractor={(item, index) => item.businessName + index}
                renderItem={({ item }) => renderItem(item)}
                renderSectionHeader={renderTopContainer}
                refreshing={refreshing}
                onRefresh={() => {
                    numRefresh.current++;
                    setRefreshing(true)
                }}
            />
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={() => getUserExample()}>
                    <Text style={styles.userText}>
                        {user.displayName}
                    </Text>
                </TouchableOpacity>
                <View style={[styles.userPicture, { backgroundColor: colors.gray }]}>
                    {examplePic && <Image resizeMode='cover' style={styles.userPicture} source={{ uri: examplePic }} />}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topContainer: {
        overflow: 'hidden',
        flex: 1,
        paddingBottom: wp(2.4)
    },
    bottomContainer: {
        flex: 0.62,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white'
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    headerTitle: {
        fontFamily: 'Semi',
        fontSize: wp(6.2),
        color: colors.primary,
        paddingLeft: wp(5)
    },
    backArrowContainer: {
        paddingBottom: wp(2),
        marginLeft: sizes.margin
    },
    moreButton: {
        alignSelf: 'center',
        paddingRight: wp(5),
        paddingTop: wp(2)
    },
    topProfileContainer: {
        height: '80%',
        width: wp(100),
        backgroundColor: 'white',
        borderBottomLeftRadius: wp(4),
        borderBottomRightRadius: wp(4),
        flexDirection: 'column'
    },
    pfpContainer: {
        paddingTop: wp(3),
        marginLeft: wp(1),
        flex: 0.3,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: hp(1.4)
    },
    userPicture: {
        marginBottom: hp(1.1)
    },
    locationText: {
        fontFamily: 'Medium',
        fontSize: sizes.b2,
        color: colors.primary
    },
    infoContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: hp(1.4) + 0.3 * sizes.b2,
        marginRight: wp(1),
    },
    followContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginRight: wp(3),
    },
    followButton: {
        width: '33%',
        alignItems: 'center'
    },
    followCountText: {
        fontFamily: 'Semi',
        fontSize: wp(4.8),
        color: colors.accent,
    },
    followText: {
        fontFamily: 'Book',
        fontSize: sizes.b3,
        color: colors.black,
        marginTop: -wp(1),
        letterSpacing: 0.3,
    },
    actionsContainer: {
        width: wp(68),
        paddingHorizontal: wp(3),
        flexDirection: 'row',
        paddingTop: wp(3) + hp(0.2)
    },
    editContainer: {
        width: '73%',
        height: hp(3) + wp(5),
        borderRadius: wp(2),
        alignItems: 'center',
        justifyContent: 'center'
    },
    editText: {
        fontFamily: 'Medium',
        fontSize: sizes.b1,
        paddingTop: wp(0.3)
    },
    socialContainer: {
        width: hp(3) + wp(5),
        height: hp(3) + wp(5),
        marginLeft: wp(2.5)
    },
    tabContainer: {
        flex: 0.3,
        marginHorizontal: wp(6),
        flexDirection: 'row',
    },
    tab: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    tabIcon: {
        paddingBottom: wp(3.5)
    },
    slider: {
        position: 'absolute',
        bottom: 0,
        height: wp(1),
        width: '100%',
        alignSelf: 'flex-end',
        backgroundColor: colors.black,
        borderTopLeftRadius: wp(1),
        borderTopRightRadius: wp(1)
    }
});

export default Profile;