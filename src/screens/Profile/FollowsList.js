import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard,
} from 'react-native';
import { API, graphqlOperation } from 'aws-amplify';
import {
  getUserProfileQuery, getFollowingQuery, getIsFollowingQuery, getFollowersQuery,
} from '../../api/functions/queryFunctions';
import ProfilePic from '../components/ProfilePic';
import CenterSpinner from '../components/util/CenterSpinner';
import {
  colors, sizes, wp, header,
} from '../../constants/theme';

const FollowsList = ({ navigation, route }) => {
  const { PK, uid, type } = route.params;

  const [usersList, setUsersList] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: <Text style={header.title}>{type}</Text>,
    });
  }, [navigation, type]);

  useEffect(() => {
    (async () => {
      let dynamoUsers;
      if (type === 'Followers') {
        dynamoUsers = await getFollowersQuery({ PK });
      } else if (type === 'Following') {
        dynamoUsers = await getFollowingQuery({ uid });
      }
      console.log(dynamoUsers);
      setUsersList(dynamoUsers);
    })();
  }, [PK, type, uid]);

  const fetchCurrentUser = async (currentPK, currentSK, currentProfilePic) => {
    try {
      const currentUser = await getUserProfileQuery({ PK: currentPK, SK: currentSK });
      currentUser.PK = currentPK;
      currentUser.SK = currentSK;
      currentUser.picture = currentProfilePic;

      // Check if my user is following the current user, even if showing list of following users
      // Accounts of edge case of viewing profile immediately after unfollowing
      currentUser.following = await getIsFollowingQuery({ currentPK, myUID: uid });
      console.log(currentUser);
      navigation.push('Profile', { user: currentUser });
    } catch (err) {
      console.warn('Error fetching current user: ', err);
    }
  };

  const renderUserItem = ({ item }) => {
    if (type === 'Following') {
      item.SK = item.follower.followedSK; // set current sk to who user is following's sk
    } else {
      item = item.follower;
    }

    console.log(item);

    return (
      <TouchableOpacity
        style={styles.userItemContainer}
        activeOpacity={0.5}
        onPress={() => fetchCurrentUser(item.PK, item.SK, item.picture)}
        key={item.PK}
        id={item.PK}
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
    backgroundColor: 'white',
  },
  userItemContainer: {
    flex: 1,
    height: wp(17),
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  userNameText: {
    fontFamily: 'Semi',
    fontSize: sizes.h4,
    color: colors.black,
  },
});

export default FollowsList;
