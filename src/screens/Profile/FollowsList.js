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
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import {
  colors, sizes, wp, header,
} from '../../constants/theme';

const FollowsList = ({ navigation, route }) => {
  const { PK, uid, type } = route.params;
  const [{ user: { uid: myUID, PK: myPK } }] = useContext(Context);

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
      if (type === 'Followers') {
        // Get following users PKs
        ({ promise, getValue, errorMsg } = getFollowingQuery({ uid: myUID, onlyReturnPKs: true }));
        let followingUsers = await fulfillPromise(promise, getValue, errorMsg);
        followingUsers = followingUsers.map((user) => user.uid);
        followingPKs.current = new Set(followingUsers);
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
  }, [PK, type, uid]);

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
    return (
      <TouchableOpacity
        style={styles.userItemContainer}
        activeOpacity={0.5}
        onPress={() => openUser({ user: item })}
        // onPress={() => fetchCurrentUser(item.PK, item.SK, item.picture)}
        key={item.PK}
        id={item.PK}
      >
        <View style={styles.userInfoContainer}>
          <ProfilePic
            uid={item.uid}
            extUrl={item.picture}
            size={wp(10)}
            style={{ marginHorizontal: sizes.margin }}
          />
          <View style={styles.infoContainer}>
            <Text style={styles.userNameText}>{item.name}</Text>
          </View>
        </View>
        {followingPKs.current.has(item.uid)
          && <Text style={styles.followingText}>Following</Text>}
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
            showsVerticalScrollIndicator
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
    paddingHorizontal: wp(3.5),
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
});

export default FollowsList;
