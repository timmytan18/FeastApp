import React, {
  useState, useContext, useRef, useEffect,
} from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated, FlatList, Keyboard, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Context } from '../../Store';
import {
  searchUsersQuery,
  searchPlacesQuery,
  getPlaceDetailsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import { fetchCurrentUser } from '../../api/functions/FetchUserProfile';
import DismissKeyboardView from '../components/util/DismissKeyboard';
import SearchBox from '../components/SearchBox';
import ProfilePic from '../components/ProfilePic';
import CenterSpinner from '../components/util/CenterSpinner';
import {
  colors, sizes, wp, shadows,
} from '../../constants/theme';

const SearchUsers = ({ navigation }) => {
  const [{ user: { PK: myPK, uid: myUID } }] = useContext(Context);
  const [loading, setLoading] = useState(false);

  const position = useRef(new Animated.Value(0)).current;
  const [searchByUser, setSearchByUser] = useState(true);

  const translate = position.interpolate({
    inputRange: [0, 1],
    outputRange: [0, wp(50)],
  });

  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const [searchList, setSearchList] = useState([]);

  const fetchSearchItems = async (query) => {
    if (query) {
      setLoading(true);
      const name = query.replace(/\s+/g, '').toLowerCase();
      const { promise, getValue, errorMsg } = searchByUser
        ? searchUsersQuery({ name }) : searchPlacesQuery({ name });
      const itemList = await fulfillPromise(promise, getValue, errorMsg);
      if (!mounted.current) return;
      setSearchList(itemList);
      setLoading(false);
    } else {
      setSearchList([]);
    }
  };

  const openPlace = async ({ placeId }) => {
    const { promise, getValue, errorMsg } = getPlaceDetailsQuery({ placeId });
    const place = await fulfillPromise(promise, getValue, errorMsg);
    navigation.push('PlaceDetail', { place, placeId, placeName: place.name });
  };

  const openUser = async ({ user }) => {
    const currUser = await fetchCurrentUser({
      currentPK: user.PK,
      currentSK: user.SK,
      currentProfilePic: user.picture,
      myUID,
      myPK,
    });
    navigation.push(
      'ProfileStack',
      { screen: 'Profile', params: { user: currUser } },
    );
  };

  const renderSearchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItemContainer}
      activeOpacity={0.5}
      onPress={() => (
        searchByUser
          ? openUser({ user: item })
          : openPlace({ placeId: item.placeId }))}
    >
      <View style={[
        styles.userIconContainer,
        !searchByUser && { borderRadius: PLACE_ICON_BORDER_RADIUS },
      ]}
      >
        {searchByUser && (
          <ProfilePic
            extUrl={item.picture}
            uid={item.uid}
            isMe={false}
            size={USER_ICON_SIZE}
            style={styles.userIconImage}
          />
        )}
        {!searchByUser && (
          <View style={styles.placeIconImage}>
            <Image source={{ uri: item.placeInfo.imgUrl }} style={styles.placeIconImage} />
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.userNameText}>{item.name}</Text>
        {item.city && <Text style={styles.userCityText}>{item.city}</Text>}
      </View>
    </TouchableOpacity>
  );

  const changeTab = ({ toLeft }) => {
    setSearchList([]);
    setSearchByUser(toLeft);
    Animated.spring(position, {
      toValue: toLeft ? 0 : 1,
      speed: 40,
      bounciness: 2,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <DismissKeyboardView style={{ flex: 1 }}>
        <View style={{ overflow: 'hidden', paddingBottom: wp(3), ...shadows.lighter }}>
          <View style={styles.headerContainer}>
            <View style={{ flex: 1, paddingHorizontal: sizes.margin }}>
              <SearchBox
                completeSearch={fetchSearchItems}
                placeholder={`Search for a ${searchByUser ? 'user' : 'place'}`}
                autofocus
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
            <TouchableOpacity
              activeOpacity={1}
              style={styles.tab}
              onPress={() => changeTab({ toLeft: true })}
            >
              <Text style={styles.tabText}>User</Text>
              <Animated.View style={[styles.slider, { transform: [{ translateX: translate }] }]} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={1}
              style={styles.tab}
              onPress={() => changeTab({ toLeft: false })}
            >
              <Text style={styles.tabText}>Place</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.container}>
          {!loading
            && (
              <FlatList
                style={{ flex: 1, width: '100%' }}
                data={searchList}
                extraData={searchList}
                renderItem={renderSearchItem}
                keyExtractor={(item) => item.uid || item.placeId}
                showsVerticalScrollIndicator
                onScrollBeginDrag={Keyboard.dismiss}
                keyboardShouldPersistTaps="handled"
              />
            )}
          {loading && <View style={{ flex: 0.2 }}><CenterSpinner /></View>}
        </View>
      </DismissKeyboardView>
    </SafeAreaView>
  );
};

const USER_ICON_SIZE = wp(12);
const PLACE_ICON_BORDER_RADIUS = wp(1.5);
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
    justifyContent: 'flex-start',
  },
  userIconContainer: {
    height: USER_ICON_SIZE,
    width: USER_ICON_SIZE,
    marginHorizontal: sizes.margin,
    borderRadius: USER_ICON_SIZE / 2,
  },
  userIconImage: {
    flex: 1,
    borderRadius: USER_ICON_SIZE / 2,
  },
  placeIconImage: {
    flex: 1,
    borderRadius: PLACE_ICON_BORDER_RADIUS,
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
    paddingTop: wp(2),
    backgroundColor: '#fff',
  },
  cancelContainer: {
    alignSelf: 'center',
    paddingRight: wp(5),
    paddingTop: wp(2),
  },
  cancelText: {
    fontFamily: 'Book',
    fontSize: sizes.h4,
    color: colors.black,
  },
  tabText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    color: colors.black,
    paddingBottom: wp(2),
  },
  tabContainer: {
    height: wp(14),
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
  },
  tab: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  slider: {
    position: 'absolute',
    bottom: 0,
    height: wp(1),
    width: wp(40),
    alignSelf: 'center',
    backgroundColor: colors.tertiary,
    borderTopLeftRadius: wp(1),
    borderTopRightRadius: wp(1),
  },
});

export default SearchUsers;
