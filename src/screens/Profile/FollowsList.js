import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard,
} from 'react-native';
import {
  getFollowingQuery,
  getFollowersQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import { fetchCurrentUser } from '../../api/functions/FetchUserProfile';
import ProfilePic from '../components/ProfilePic';
import FollowButton from '../components/FollowButton';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import {
  colors, sizes, wp, header,
} from '../../constants/theme';

const FollowsList = ({ navigation, route }) => {
  const { PK, uid, type } = route.params;
  const [{ user, bannedUsers, reloadProfileTrigger }] = useContext(Context);
  const { uid: myUID, PK: myPK } = user;

  const [usersList, setUsersList] = useState(null);
  const followingPKs = useRef(new Set());

  const mounted = useRef(true);

  useEffect(() => {
    navigation.setOptions({
      title: <Text style={header.title}>{type}</Text>,
    });
  }, [navigation, type]);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      let dynamoUsers = null;
      let promise; let getValue; let errorMsg;
      // Get following users PKs
      if (uid !== myUID || type === 'Followers') {
        ({ promise, getValue, errorMsg } = getFollowingQuery({ uid: myUID, onlyReturnPKs: true }));
        let followingUsers = await fulfillPromise(promise, getValue, errorMsg);
        followingUsers = followingUsers.map((fUser) => fUser.uid);
        followingPKs.current = new Set(followingUsers);
      }
      if (type === 'Followers') {
        // Get followers
        ({ promise, getValue, errorMsg } = getFollowersQuery({ PK }));
      } else if (type === 'Following') {
        ({ promise, getValue, errorMsg } = getFollowingQuery({ uid }));
      }
      dynamoUsers = await fulfillPromise(promise, getValue, errorMsg);
      dynamoUsers.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); // sort by most recent
      if (mounted.current) setUsersList(dynamoUsers);
    })();
    return () => { mounted.current = false; };
  }, [PK, type, uid, reloadProfileTrigger, myUID]);

  const openUser = async ({ user }) => {
    const currUser = await fetchCurrentUser({
      currentPK: user.PK,
      currentSK: user.SK,
      currentProfilePic: user.picture,
      myUID,
      myPK,
      navigation,
    });
    navigation.push('Profile', { user: currUser });
  };

  const renderUserItem = ({ item }) => {
    if (type === 'Following') {
      item.SK = item.follower.followedSK; // set current sk to who user is following's sk
    } else {
      item = item.follower;
    }
    if (bannedUsers.has(item.uid)) return null;
    return (
      <TouchableOpacity
        style={styles.userItemContainer}
        activeOpacity={1}
        onPress={() => openUser({ user: item })}
        key={item.PK}
        id={item.PK}
      >
        <View style={styles.userInfoContainer}>
          <ProfilePic
            uid={item.uid}
            extUrl={item.picture}
            size={wp(10)}
            style={{ marginRight: sizes.margin }}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.userNameText}>{item.name}</Text>
          </View>
        </View>
        {(followingPKs.current.has(item.uid) || (uid === myUID && type === 'Following'))
          && <Text style={styles.followingText}>Following</Text>}
        {myUID !== item.uid && (!followingPKs.current.has(item.uid) && (uid !== myUID || type !== 'Following'))
          && (
            <FollowButton
              currentUser={item}
              myUser={user}
              containerStyle={styles.followContainer}
              textStyle={styles.followText}
            />
          )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {!usersList && <View style={{ flex: 0.2 }}><CenterSpinner /></View>}
      {usersList
        && (
          <FlatList
            style={{ flex: 1, width: '100%' }}
            data={usersList}
            extraData={usersList}
            renderItem={renderUserItem}
            keyExtractor={(item) => (type === 'Following' ? item.PK : item.follower.PK)}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={Keyboard.dismiss}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={<View style={{ height: wp(3) }} />}
            ListFooterComponent={<View style={{ height: wp(3) }} />}
          />
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: sizes.margin + wp(1),
    paddingRight: sizes.margin,
    backgroundColor: '#fff',
  },
  userItemContainer: {
    flex: 1,
    height: wp(17),
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfoContainer: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  userNameText: {
    fontFamily: 'Medium',
    letterSpacing: 0.22,
    fontSize: sizes.h4,
    color: colors.black,
  },
  followingText: {
    fontFamily: 'BookItalic',
    marginRight: wp(5),
    alignSelf: 'center',
    fontSize: sizes.b3,
    color: colors.tertiary,
  },
  followContainer: {
    width: '26%',
    height: wp(8.25),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  followText: {
    fontFamily: 'Medium',
    fontSize: sizes.b3,
    paddingTop: wp(0.3),
  },
});

export default FollowsList;
