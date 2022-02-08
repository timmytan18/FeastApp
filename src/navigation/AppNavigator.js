import React, {
  useContext, useRef, useState, useEffect,
} from 'react';
import {
  Image, Text, StyleSheet, View, TouchableOpacity, SafeAreaView,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, TransitionSpecs } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Home from '../screens/Home/Home';
import SearchUsers from '../screens/Home/SearchUsers.js';
import StoryModal from '../screens/components/StoryModal';
// import Discover from '../screens/Discover/Discover';
import NewPost from '../screens/NewPost/NewPost';
// import Groups from '../screens/Groups/Groups';
// import Group from '../screens/Groups/Group';
import Profile from '../screens/Profile/Profile';
import FollowsList from '../screens/Profile/FollowsList';
// import DetailCard from '../screens/components/DetailCard';
// import RestaurantList from '../screens/components/RestaurantList';
import Settings from '../screens/Profile/Settings';
import UploadImages from '../screens/NewPost/UploadImages';
import PostDetails from '../screens/NewPost/PostDetails';
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
import {
  colors, gradients, sizes, header, wp, hp,
} from '../constants/theme';

const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={Home}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="SearchUsers"
        component={SearchUsers}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
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
          headerLeftContainerStyle: { paddingLeft: sizes.margin },
        }}
      />
    </HomeStack.Navigator>
  );
}

const NewPostStack = createStackNavigator();
function NewPostStackScreen() {
  return (
    <NewPostStack.Navigator>
      <NewPostStack.Screen
        name="NewPost"
        component={NewPost}
        options={{
          title: 'New Review',
          headerTitleStyle: header.title,
        }}
      />
      <NewPostStack.Screen
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
          headerLeftContainerStyle: { paddingLeft: sizes.margin },
        }}
      />
      <NewPostStack.Screen
        name="PostDetails"
        component={PostDetails}
      />
    </NewPostStack.Navigator>
  );
}

const ProfileStack = createStackNavigator();
function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
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
          headerLeftContainerStyle: { paddingLeft: sizes.margin },
        }}
      />
      <ProfileStack.Screen
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
          headerLeftContainerStyle: { paddingLeft: sizes.margin },
        }}
      />
    </ProfileStack.Navigator>
  );
}

const StoryModalStack = createStackNavigator();
function StoryModalStackScreen() {
  return (
    <StoryModalStack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: '#131617' },
      }}
    >
      <StoryModalStack.Screen
        name="StoryModal"
        component={StoryModal}
        options={{ headerShown: false }}
      />
      <StoryModalStack.Screen
        name="Profile"
        component={Profile}
        options={{
          title: '',
          headerStyle: {
            backgroundColor: 'white',
            shadowOffset: { width: 0, height: 0 },
            height: wp(10),
          },
          headerLeft: null,
        }}
      />
    </StoryModalStack.Navigator>
  );
}

const animConfig = {
  animation: 'spring',
  config: {
    stiffness: 320,
    damping: 20,
    mass: 0.5,
    restDisplacementThreshold: wp(25),
    restSpeedThreshold: 500,
  },
};

const ModalTransition = {
  gestureDirection: 'vertical',
  transitionSpec: {
    open: animConfig,
    close: animConfig,
  },
  cardStyleInterpolator: ({ current, next, layouts }) => ({
    cardStyle: {
      transform: [
        {
          scaleX: current.progress.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [0, 0.3, 1],
          }),
        },
        {
          scaleY: current.progress.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [0, 0.3, 1],
          }),
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
        inputRange: [0, 0.3, 0.8, 1],
        outputRange: [0, 0.1, 0.6, 1],
      }),
    },
  }),
};

const newPostAnim = {
  animation: 'spring',
  config: {
    stiffness: 100,
    damping: 20,
    mass: 0.3,
  },
};

const newPostTransition = ({ height }) => ({
  transitionSpec: {
    open: newPostAnim,
    close: newPostAnim,
  },
  cardStyleInterpolator: ({ current, next, layouts }) => ({
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [height, 0],
          }),
        },
      ],
    },
  }),
});

const MyTabBar = ({
  state, descriptors, navigation, picture,
}) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  const NEW_POST_INDEX = 1;

  return (
    <SafeAreaView style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
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

          if (!isFocused && !event.defaultPrevented && index !== NEW_POST_INDEX) {
            navigation.navigate(route.name);
          } else if (index === NEW_POST_INDEX) {
            navigation.navigate('NewPostModal', {
              screen: 'NewPost',
            });
          }
        };

        let icon;

        if (index === 0) {
          // icon = isFocused
          //     ? <TabIcon icon={<DiscoverFilledIcon />} />
          //     : <TabIcon icon={<DiscoverIcon />} />
          icon = isFocused
            ? <TabIcon icon={<HomeFilledIcon />} />
            : <TabIcon icon={<HomeIcon />} />;
        } else if (index === 1) {
          icon = <TabIcon icon={<NewPostIcon />} />;
        } else if (index === 2) {
          icon = isFocused
            ? <TabIcon icon={<ProfileFilledIcon />} image={picture} focused={isFocused} />
            : <TabIcon icon={<ProfileIcon />} image={picture} focused={isFocused} />;
        }
        // if (index === 0) {
        //   icon = isFocused
        //       ? <TabIcon icon={<HomeFilledIcon />} />
        //       : <TabIcon icon={<HomeIcon />} />
        // } else if (index === 1) {
        //     icon = isFocused
        //         ? <TabIcon icon={<DiscoverFilledIcon />} />
        //         : <TabIcon icon={<DiscoverIcon />} />
        // } else if (index === 2) {
        //     icon = <TabIcon icon={<NewPostIcon />} />
        // } else if (index === 3) {
        //     icon = isFocused
        //         ? <TabIcon icon={<GroupsFilledIcon />} />
        //         : <TabIcon icon={<GroupsIcon />} />
        // } else if (index === 4) {
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
};

const TabNavigator = ({ picture }) => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      tabBar={(props) => MyTabBar({ ...props, picture })}
      tabBarOptions={{
        showLabel: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="NewPost" component={NewPostStackScreen} />
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default function AppNavigator() {
  const [state, dispatch] = useContext(Context);
  console.log('App navigator state: ', state);

  const RootStack = createStackNavigator();

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Home"
          options={{ headerShown: false }}
        >
          {() => <TabNavigator picture={state.user.picture} />}
        </RootStack.Screen>
        <RootStack.Screen
          name="StoryModal"
          component={StoryModalStackScreen}
          options={{ headerShown: false, ...ModalTransition }}
        />
        <RootStack.Screen
          name="NewPostModal"
          component={NewPostStackScreen}
          options={{
            headerShown: false,
            ...newPostTransition({ height: state.deviceHeight }),
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  logoHeader: {
    width: 32,
    height: 32,
    marginBottom: 5,
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
    width: '100%',
  },
  tab: {
    flex: 0.20,
    paddingTop: wp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
});
