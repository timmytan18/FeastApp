import React, { useContext, useRef, useState, useEffect } from 'react';
import { Image, Text, StyleSheet, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Home from '../screens/Home/Home';
import SearchUsers from '../screens/Home/SearchUsers.js';
// import Discover from '../screens/Discover/Discover';
import NewPost from '../screens/NewPost/NewPost';
// import Groups from '../screens/Groups/Groups';
// import Group from '../screens/Groups/Group';
import Profile from '../screens/Profile/Profile';
// import FollowsList from '../screens/Profile/FollowsList';
// import DetailCard from '../screens/components/DetailCard';
// import RestaurantList from '../screens/components/RestaurantList';
import Settings from '../screens/Profile/Settings';
// import UploadImages from '../screens/NewPost/UploadImages';
// import PostDetails from '../screens/NewPost/PostDetails';
import TabIcon from './TabIcon';
import { HomeIcon, HomeFilledIcon } from './icons/Home';
// import { DiscoverIcon, DiscoverFilledIcon } from './icons/Discover';
import NewPostIcon from './icons/NewPost';
// import { GroupsIcon, GroupsFilledIcon } from './icons/Groups';
import { ProfileIcon, ProfileFilledIcon } from './icons/Profile';
import Logo from '../screens/components/util/icons/Logo';
import BackArrow from '../screens/components/util/icons/BackArrow';
// import SearchButton from '../screens/components/util/SearchButton';
// import gql from 'graphql-tag';
// import { listRestaurants } from '../graphql/queries';
// import { useQuery } from '@apollo/react-hooks';
// import CenterSpinner from '../screens/components/util/CenterSpinner';
import { Context } from '../Store';
import { colors, gradients, sizes, header } from '../constants/theme';
import {
    heightPercentageToDP as hp,
    widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const HomeStack = createStackNavigator();
function HomeStackScreen() {
    return (
        <HomeStack.Navigator>
            <HomeStack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
                // options={{
                //     headerTitle: () => (
                //         <Logo style={{ marginBottom: wp(2) }} />
                //     ),
                //     headerLeft: () => (
                //         <LinearGradient
                //             colors={gradients.orange.colors}
                //             start={gradients.orange.start}
                //             end={gradients.orange.end}
                //         >
                //         <Text style={styles.leftHeader}>Feed</Text>
                //         </LinearGradient>
                //     ),
                //     headerRightContainerStyle: { paddingRight: sizes.margin }
                // }}
            />
            <HomeStack.Screen
                name="SearchUsers"
                component={SearchUsers}
                options={{ headerShown: false }}
            />
            <ProfileStack.Screen
                name="Profile"
                component={Profile}
                options={{ headerShown: false }}
            />
            {/* <ProfileStack.Screen
                name="FollowsList"
                component={FollowsList}
                options={{
                    headerLeft: ({ onPress }) => (
                        <BackArrow
                            color={colors.black}
                            size={wp(6.2)}
                            style={{ flex: 1 }}
                            pressed={onPress}
                        />
                    ),
                    headerLeftContainerStyle: { paddingLeft: sizes.margin }
                }}
            /> */}
        </HomeStack.Navigator>
    );
}

// const DiscoverStack = createStackNavigator();
// function DiscoverStackScreen() {
//     return (
//         <DiscoverStack.Navigator>
//             <DiscoverStack.Screen
//                 name="Discover"
//                 component={Discover}
//             />
//         </DiscoverStack.Navigator>
//     );
// }

const NewPostStack = createStackNavigator();
function NewPostStackScreen() {
    return (
        <NewPostStack.Navigator
            screenOptions={{
                title: <Text style={header.title}>New Post</Text>
            }}
        >
            <NewPostStack.Screen
                name="NewPost"
                component={NewPost}
            />
            {/* <NewPostStack.Screen
                name="UploadImages"
                component={UploadImages}
                options={{
                    headerLeft: ({ onPress }) => (
                        <BackArrow
                            color={colors.black}
                            size={wp(6.2)}
                            style={{ flex: 1 }}
                            pressed={onPress}
                        />
                    ),
                    headerLeftContainerStyle: { paddingLeft: sizes.margin }
                }}
            />
            <NewPostStack.Screen
                name="PostDetails"
                component={PostDetails}
                options={{
                    headerLeft: ({ onPress }) => (
                        <BackArrow
                            color={colors.black}
                            size={wp(6.2)}
                            style={{ flex: 1 }}
                            pressed={onPress}
                        />
                    ),
                    headerLeftContainerStyle: { paddingLeft: sizes.margin }
                }}
            /> */}
        </NewPostStack.Navigator>
    );
}

// const GroupsStack = createStackNavigator();
// function GroupsStackScreen() {
//     return (
//         <GroupsStack.Navigator>
//             <GroupsStack.Screen
//                 name="Groups"
//                 component={Groups}
//             />
//             <GroupsStack.Screen
//                 name="Group"
//                 component={Group}
//             />
//         </GroupsStack.Navigator>
//     );
// }

const ProfileStack = createStackNavigator();
function ProfileStackScreen() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen
                name="Profile"
                component={Profile}
                options={{ headerShown: false }}
            />
            {/* <ProfileStack.Screen
                name="RestaurantList"
                component={RestaurantList}
                options={{
                    headerLeft: ({ onPress }) => (
                        <BackArrow
                            color={colors.black}
                            size={wp(6.2)}
                            style={{ flex: 1 }}
                            pressed={onPress}
                        />
                    ),
                    headerLeftContainerStyle: { paddingLeft: sizes.margin }
                }}
            /> */}
            <ProfileStack.Screen
                name="Settings"
                component={Settings}
                options={{
                    title: <Text style={header.title}>Settings</Text>,
                    headerLeft: ({ onPress }) => (
                        <BackArrow
                            color={colors.black}
                            size={wp(6.2)}
                            style={{ flex: 1 }}
                            pressed={onPress}
                        />
                    ),
                    headerLeftContainerStyle: { paddingLeft: sizes.margin }
                }}
            />
            {/* <ProfileStack.Screen
                name="FollowsList"
                component={FollowsList}
                options={{
                    headerLeft: ({ onPress }) => (
                        <BackArrow
                            color={colors.black}
                            size={wp(6.2)}
                            style={{ flex: 1 }}
                            pressed={onPress}
                        />
                    ),
                    headerLeftContainerStyle: { paddingLeft: sizes.margin }
                }}
            /> */}
        </ProfileStack.Navigator>
    );
}

const ModalStack = createStackNavigator();
function ModalStackScreen() {
    return (
        <ModalStack.Navigator>
            <ModalStack.Screen
                name="DetailCard"
                component={DetailCard}
                options={{ headerShown: false }}
            />
        </ModalStack.Navigator>
    );
}

const animConfig = {
    animation: 'spring',
    config: {
        stiffness: 320,
        damping: 20,
        mass: 0.9,
        restDisplacementThreshold: wp(25),
        restSpeedThreshold: 100,
    },
};

const ModalTransition = {
    gestureDirection: 'vertical',
    transitionSpec: {
        open: animConfig,
        close: animConfig,
    },
    cardStyleInterpolator: ({ current, next, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        scaleX: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1]
                        })
                    },
                    {
                        scaleY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3, 1]
                        })
                    },
                    {
                        scale: next
                            ? next.progress.interpolate({
                                inputRange: [0, 1],
                                outputRange: [1, 0.95],
                            })
                            : 1,
                    },
                ],
                opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                }),
            },
        };
    },
}

const newPostAnim = {
    animation: 'spring',
    config: {
        stiffness: 100,
        damping: 20,
        mass: 0.3,
    },
};

const NewPostTransition = {
    transitionSpec: {
        open: newPostAnim,
        close: newPostAnim,
    },
    cardStyleInterpolator: ({ current, next, layouts }) => {
        return {
            cardStyle: {
                transform: [
                    {
                        translateY: current.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [hp(100), 0]
                        })
                    }
                ]
            },
        };
    },
}

export default function AppNavigator() {

    const [state, dispatch] = useContext(Context);
    console.log('App navigator state: ', state);

    // Use useState hook to force update
    const [reload, setReload] = useState(false);

    const Tab = createBottomTabNavigator();

    // Use useRef hook to store TabNavigator
    const TabScreenRef = useRef(
      function TabScreen() {
          return (
              <Tab.Navigator
                  tabBar={props => <MyTabBar {...props} picture={state.user.picture} />}
                  tabBarOptions={{
                      showLabel: false
                  }}
              >
                  <Tab.Screen name="Home" component={HomeStackScreen} />
                  {/* <Tab.Screen name="Discover" component={DiscoverStackScreen} /> */}
                  <Tab.Screen name="NewPost" component={NewPostStackScreen} />
                  {/* <Tab.Screen name="Groups" component={GroupsStackScreen} /> */}
                  <Tab.Screen name="Profile" component={ProfileStackScreen} />
              </Tab.Navigator>
          );
    });

    // Hacky way to update the profile picture in the tab bar if changed
    // Reassign TabScreenRef to a new TabNavigator to change profile picture
    useEffect(() => {
        TabScreenRef.current = 
            (function TabScreen() {
              return (
                  <Tab.Navigator
                      tabBar={props => <MyTabBar {...props} picture={state.user.picture} />}
                      tabBarOptions={{
                          showLabel: false
                      }}
                  >
                      <Tab.Screen name="Home" component={HomeStackScreen} />
                      {/* <Tab.Screen name="Discover" component={DiscoverStackScreen} /> */}
                      <Tab.Screen name="NewPost" component={NewPostStackScreen} />
                      {/* <Tab.Screen name="Groups" component={GroupsStackScreen} /> */}
                      <Tab.Screen name="Profile" component={ProfileStackScreen} />
                  </Tab.Navigator>
              );
          })
        // Force update through reload useState
        setReload(!reload);
    }, [state.user.picture])

    const MyTabBar = ({ state, descriptors, navigation, picture }) => {

        const focusedOptions = descriptors[state.routes[state.index].key].options;

        if (focusedOptions.tabBarVisible === false) {
            return null;
        }

        const NEW_POST_INDEX = 1;

        return (
            <SafeAreaView style={styles.tabBar}>
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: 'tabPress',
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented && index != NEW_POST_INDEX) {
                            navigation.navigate(route.name);
                        } else if (index == NEW_POST_INDEX) {
                            navigation.navigate('NewPostModal', {
                                screen: 'NewPost'
                            })
                        }
                    };

                    let icon;

                    if (index == 0) {
                        // icon = isFocused
                        //     ? <TabIcon icon={<DiscoverFilledIcon />} />
                        //     : <TabIcon icon={<DiscoverIcon />} />
                        icon = isFocused
                              ? <TabIcon icon={<HomeFilledIcon />} />
                              : <TabIcon icon={<HomeIcon />} />
                    } else if (index == 1) {
                        icon = <TabIcon icon={<NewPostIcon />} />
                    } else if (index == 2) {
                        icon = isFocused
                              ? <TabIcon icon={<ProfileFilledIcon />} image={picture} focused={isFocused} />
                              : <TabIcon icon={<ProfileIcon />} image={picture} focused={isFocused} />
                    }
                    // if (index == 0) {
                    //   icon = isFocused
                    //       ? <TabIcon icon={<HomeFilledIcon />} />
                    //       : <TabIcon icon={<HomeIcon />} />
                    // } else if (index == 1) {
                    //     icon = isFocused
                    //         ? <TabIcon icon={<DiscoverFilledIcon />} />
                    //         : <TabIcon icon={<DiscoverIcon />} />
                    // } else if (index == 2) {
                    //     icon = <TabIcon icon={<NewPostIcon />} />
                    // } else if (index == 3) {
                    //     icon = isFocused
                    //         ? <TabIcon icon={<GroupsFilledIcon />} />
                    //         : <TabIcon icon={<GroupsIcon />} />
                    // } else if (index == 4) {
                    //     icon = <TabIcon icon={<ProfileIcon />} image={picture} focused={isFocused} />
                    // }

                    return (
                        <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.8} key={index}>
                            {icon}
                        </TouchableOpacity>
                    );
                })}
            </SafeAreaView>
        );
    }

    const RootStack = createStackNavigator();

    return <NavigationContainer>
        <RootStack.Navigator>
            <RootStack.Screen
                name="Main"
                component={TabScreenRef.current}
                options={{ headerShown: false }}
            />
            {/* <RootStack.Screen
                name="CardModal"
                component={ModalStackScreen}
                options={{ headerShown: false, ...ModalTransition }}
            /> */}
            <RootStack.Screen
                name="NewPostModal"
                component={NewPostStackScreen}
                options={{ headerShown: false, ...NewPostTransition }}
            />
        </RootStack.Navigator>
    </NavigationContainer>;
}

const styles = StyleSheet.create({
    logoHeader: {
        width: 32,
        height: 32,
        marginBottom: 5
    },
    leftHeader: {
        marginLeft: sizes.margin,
        fontFamily: 'Semi',
        fontSize: sizes.h2,
        color: colors.primary,
    },
    tabBar: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        backgroundColor: '#F9F9F9',
        height: '10%',
        width: '100%'
    },
    tab: {
        flex: 0.20,
        paddingTop: hp(1),
        justifyContent: 'center',
        alignItems: 'center'
    }
});