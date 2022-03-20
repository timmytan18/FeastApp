import React, {
  useContext, useEffect, useState,
} from 'react';
import {
  Text, StyleSheet, TouchableOpacity, SafeAreaView, View,
} from 'react-native';
import { API, Storage } from 'aws-amplify';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  getUserAllSavedPostsQuery,
  getFollowersByTimeQuery,
  getUserYumsReceivedByTimeQuery,
  fulfillPromise,
} from '../api/functions/queryFunctions';
import Home from '../screens/Home/Home';
import Explore from '../screens/Explore/Explore';
import NewPost from '../screens/NewPost/NewPost';
import Inbox from '../screens/Inbox/Inbox';
import Profile from '../screens/Profile/Profile';
import SearchUsers from '../screens/Explore/SearchUsers';
import StoryModal from '../screens/components/StoryModal';
import Reviews from '../screens/Explore/Reviews';
import FollowsList from '../screens/Profile/FollowsList';
import ProfileReviews from '../screens/Profile/ProfileReviews';
import SavedPosts from '../screens/Profile/SavedPosts';
import PlaceDetail from '../screens/Profile/PlaceDetail';
import Settings from '../screens/Profile/Settings';
import UploadImages from '../screens/NewPost/UploadImages';
import CropModal from '../screens/NewPost/CropModal';
import PostDetails from '../screens/NewPost/PostDetails';
import TabIcon from './TabIcon';
import { HomeIcon, HomeFilledIcon } from './icons/Home';
import { ExploreIcon, ExploreFilledIcon } from './icons/Explore';
import NewPostIcon from './icons/NewPost';
import { InboxIcon, InboxFilledIcon } from './icons/Inbox';
import { ProfileIcon, ProfileFilledIcon } from './icons/Profile';
import BackArrow from '../screens/components/util/icons/BackArrow';
import { GET_SAVED_POST_ID } from '../constants/constants';
import { secureSave, getSecureValue, keys } from '../api/functions/SecureStore';
import { getLocalData, storeLocalData, localDataKeys } from '../api/functions/LocalStorage';
import { Context } from '../Store';
import {
  colors, sizes, header, wp,
} from '../constants/theme';

Storage.configure({ level: 'protected' });

const renderBackArrow = ({ onPress }) => (
  <BackArrow
    color={colors.black}
    size={wp(6.2)}
    style={{ flex: 1, marginLeft: sizes.margin }}
    pressed={onPress}
    containerStyle={styles.backArrowContainer}
  />
);

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
          headerLeft: renderBackArrow,
        }}
      />
      <ProfileStack.Screen
        name="FollowsList"
        component={FollowsList}
        options={{
          headerLeft: renderBackArrow,
        }}
      />
      <ProfileStack.Screen
        name="ProfileReviews"
        component={ProfileReviews}
        options={{
          title: <Text style={header.title}>User Reviews</Text>,
          headerLeft: renderBackArrow,
        }}
      />
      <ProfileStack.Screen
        name="PlaceDetail"
        component={PlaceDetail}
        options={{ headerShown: false }}
      />
      <ProfileStack.Screen
        name="Reviews"
        component={Reviews}
        options={{
          title: <Text style={header.title}>Reviews</Text>,
          headerLeft: renderBackArrow,
        }}
      />
      <ProfileStack.Screen
        name="SavedPosts"
        component={SavedPosts}
        options={{
          title: <Text style={header.title}>Saved</Text>,
          headerLeft: renderBackArrow,
        }}
      />
    </ProfileStack.Navigator>
  );
}

const HomeStack = createStackNavigator();
function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={Home}
      />
      <HomeStack.Screen
        name="SearchUsers"
        component={SearchUsers}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="ProfileStack"
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="PlaceDetail"
        component={PlaceDetail}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="Reviews"
        component={Reviews}
        options={{
          title: <Text style={header.title}>Reviews</Text>,
          headerLeft: renderBackArrow,
        }}
      />
    </HomeStack.Navigator>
  );
}

const ExploreStack = createStackNavigator();
function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator>
      <ExploreStack.Screen
        name="Explore"
        component={Explore}
        options={{ headerShown: false }}
      />
      <ExploreStack.Screen
        name="SearchUsers"
        component={SearchUsers}
        options={{ headerShown: false }}
      />
      <ExploreStack.Screen
        name="ProfileStack"
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
      <ExploreStack.Screen
        name="PlaceDetail"
        component={PlaceDetail}
        options={{ headerShown: false }}
      />
      <ExploreStack.Screen
        name="Reviews"
        component={Reviews}
        options={{
          title: <Text style={header.title}>Reviews</Text>,
          headerLeft: renderBackArrow,
        }}
      />
    </ExploreStack.Navigator>
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
        options={{ headerShown: false, ...ModalTransition }}
      />
      <StoryModalStack.Screen
        name="ProfileStack"
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
      <StoryModalStack.Screen
        name="Reviews"
        component={Reviews}
        options={{
          title: <Text style={header.title}>Reviews</Text>,
          headerLeft: renderBackArrow,
        }}
      />
    </StoryModalStack.Navigator>
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
          title: 'New Post',
          headerTitleStyle: header.title,
        }}
      />
      <NewPostStack.Screen
        name="UploadImages"
        component={UploadImages}
        options={{
          headerLeft: renderBackArrow,
        }}
      />
      <NewPostStack.Screen
        name="CropModal"
        component={CropModal}
        options={{ headerShown: false }}
      />
      <NewPostStack.Screen
        name="PostDetails"
        component={PostDetails}
      />
    </NewPostStack.Navigator>
  );
}

const InboxStack = createStackNavigator();
function InboxStackScreen() {
  return (
    <InboxStack.Navigator>
      <InboxStack.Screen
        name="Inbox"
        component={Inbox}
        options={{
          title: <Text style={header.title}>Inbox</Text>,
        }}
      />
      <InboxStack.Screen
        name="ProfileStack"
        component={ProfileStackScreen}
        options={{ headerShown: false }}
      />
    </InboxStack.Navigator>
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
            outputRange: [0, 0.6, 1],
          }),
        },
        {
          scaleY: current.progress.interpolate({
            inputRange: [0, 0.7, 1],
            outputRange: [0, 0.6, 1],
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
        inputRange: [0.2, 0.8, 1],
        outputRange: [0, 0.5, 1],
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
  state, descriptors, navigation, picture, showBadge, setShowBadge,
}) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;

  if (focusedOptions.tabBarVisible === false) {
    return null;
  }

  const NEW_POST_INDEX = 2;
  const INBOX_INDEX = 3;

  return (
    <SafeAreaView style={styles.tabBar}>
      <View style={styles.tabsContainer}>
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

            if (index === INBOX_INDEX) {
              setShowBadge(false);
            }
          };

          let icon;

          if (index === 0) {
            icon = isFocused
              ? <TabIcon icon={<HomeFilledIcon />} />
              : <TabIcon icon={<HomeIcon />} />;
          } else if (index === 1) {
            icon = isFocused
              ? <TabIcon icon={<ExploreFilledIcon />} focused={isFocused} />
              : <TabIcon icon={<ExploreIcon />} focused={isFocused} />;
          } else if (index === 2) {
            icon = <TabIcon icon={<NewPostIcon />} />;
          } else if (index === 3) {
            icon = isFocused
              ? <TabIcon icon={<InboxFilledIcon />} focused={isFocused} />
              : (
                <View>
                  {showBadge && <View style={styles.badge} />}
                  <TabIcon icon={<InboxIcon />} focused={isFocused} />
                </View>
              );
          } else if (index === 4) {
            icon = isFocused
              ? <TabIcon icon={<ProfileFilledIcon />} image={picture} focused={isFocused} />
              : <TabIcon icon={<ProfileIcon />} image={picture} focused={isFocused} />;
          }

          return (
            <TouchableOpacity style={styles.tab} onPress={onPress} activeOpacity={0.8} key={index}>
              {icon}
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const TabNavigator = ({ picture, showBadge, setShowBadge }) => {
  const Tab = createBottomTabNavigator();
  return (
    <Tab.Navigator
      tabBar={(props) => MyTabBar({
        ...props, picture, showBadge, setShowBadge,
      })}
      tabBarOptions={{
        showLabel: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} />
      <Tab.Screen name="ExploreTab" component={ExploreStackScreen} />
      <Tab.Screen name="NewPostTab" component={NewPostStackScreen} />
      <Tab.Screen name="InboxTab" component={InboxStackScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const [
    { user: { PK: myPK, uid: myUID, picture }, deviceHeight },
    dispatch,
  ] = useContext(Context);
  const RootStack = createStackNavigator();

  const [showBadge, setShowBadge] = useState(false);

  // Fetch any necessary data on main app render
  useEffect(() => {
    (async () => {
      // Get all saved posts
      let promise; let getValue; let errorMsg;
      ({ promise, getValue, errorMsg } = getUserAllSavedPostsQuery({ PK: myPK, noDetails: true }));
      const savedPosts = await fulfillPromise(promise, getValue, errorMsg);
      const savedPostsIds = savedPosts.map(
        ({ placeUserInfo: { uid }, timestamp }) => GET_SAVED_POST_ID({ uid, timestamp }),
      );
      dispatch({
        type: 'SET_SAVED_POSTS',
        payload: { savedPosts: new Set(savedPostsIds) },
      });

      // Get API keys
      if (!(await getSecureValue(keys.BING_KEY)) || !(await getSecureValue(keys.GOOGLE_KEY))) {
        const { BING_KEY, GOOGLE_KEY } = await API.get('feastapi', '/keys');
        await secureSave(keys.BING_KEY, BING_KEY);
        await secureSave(keys.GOOGLE_KEY, GOOGLE_KEY);
      }

      // Check for new notifications
      const NUM_DAYS_TO_FETCH = 8;
      const dateOneWeekAgo = new Date(new Date().setDate(new Date().getDate() - NUM_DAYS_TO_FETCH));
      const oneWeekAgo = dateOneWeekAgo.toISOString();
      // Get new followers
      ({ promise, getValue, errorMsg } = getFollowersByTimeQuery({
        PK: myPK, timestamp: oneWeekAgo, limit: 1,
      }));
      const latestFollow = await fulfillPromise(promise, getValue, errorMsg);
      // Get new yums
      ({ promise, getValue, errorMsg } = getUserYumsReceivedByTimeQuery({
        uid: myUID, timestamp: oneWeekAgo, limit: 1,
      }));
      const latestYum = await fulfillPromise(promise, getValue, errorMsg);
      // Get latest seen notification
      const latestSeenNotif = await getLocalData(localDataKeys.LATEST_NOTIFICATION);
      // console.log(latestFollow[0].updatedAt, latestYum[0].updatedAt, latestSeenNotif);
      // If there are new notifs, show badge
      if ((latestFollow && latestFollow[0]) || (latestYum && latestYum[0])) {
        if (!latestSeenNotif || (latestYum[0].updatedAt.localeCompare(latestSeenNotif) > 0)
          || (latestFollow[0].updatedAt.localeCompare(latestSeenNotif) > 0)) {
          setShowBadge(true);
        }
      }
    })();
  }, [myPK]);

  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Explore"
          options={{ headerShown: false }}
        >
          {() => (
            <TabNavigator
              picture={picture}
              showBadge={showBadge}
              setShowBadge={setShowBadge}
            />
          )}
        </RootStack.Screen>
        <RootStack.Screen
          name="StoryModalModal"
          component={StoryModalStackScreen}
          options={{ headerShown: false, ...ModalTransition }}
        />
        <RootStack.Screen
          name="NewPostModal"
          component={NewPostStackScreen}
          options={{
            headerShown: false,
            ...newPostTransition({ height: deviceHeight }),
          }}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  logoHeader: {
    width: 32,
    height: 32,
    marginBottom: 5,
  },
  tabBar: {
    backgroundColor: '#F9F9F9',
    height: '10%',
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingHorizontal: wp(3),
    height: '100%',
  },
  tab: {
    flex: 0.20,
    paddingTop: wp(2.2),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingRight: wp(8),
  },
  badge: {
    position: 'absolute',
    width: wp(2),
    height: wp(2),
    backgroundColor: colors.accent2,
    borderRadius: wp(1),
    right: -wp(0.5),
    top: -wp(0.5),
  },
});
