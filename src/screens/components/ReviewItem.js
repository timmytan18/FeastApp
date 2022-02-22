import React, {
  useState,
} from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import Stars from 'react-native-stars';
import { getUserProfileQuery, getIsFollowingQuery } from '../../api/functions/queryFunctions';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const NUM_COLLAPSED_LINES = 3;

const fetchReviewUser = async ({ uid, myUID, navigation }) => {
  try {
    const currentUser = await getUserProfileQuery({ uid });
    // Check if I am following the current user
    if (currentUser.uid !== myUID) {
      currentUser.following = await getIsFollowingQuery({ currentUID: uid, myUID });
    }
    navigation.push('Profile', { user: currentUser });
  } catch (err) {
    console.warn('Error fetching current user: ', err);
  }
};

const ReviewItem = ({
  item: {
    review, rating: { overall }, placeUserInfo: { name: userName, picture: userPicture, uid },
  },
  myUID,
  navigation,
}) => {
  const [textExpanded, setTextExpanded] = useState(false);
  // const placeholder = 'Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing. Wow, this restaurant is amazing.';
  if (!review) return null;
  return (
    <View style={styles.userReviewContainer}>
      <TouchableOpacity
        style={styles.userPictureContainer}
        activeOpacity={0.7}
        onPress={() => fetchReviewUser({ uid, myUID, navigation })}
      >
        <Image style={styles.userPicture} source={{ uri: userPicture }} />
      </TouchableOpacity>
      <View style={styles.userNameReviewContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => fetchReviewUser({ uid, myUID, navigation })}
        >
          <Text style={styles.reviewTitleText}>{userName}</Text>
        </TouchableOpacity>
        <View style={[styles.starsContainer, { marginVertical: wp(1) }]}>
          <Stars
            default={overall}
            count={5}
            half
            disabled
            spacing={wp(0.6)}
            fullStar={<StarFull size={wp(3.8)} />}
            halfStar={<StarHalf size={wp(3.8)} />}
            emptyStar={<StarEmpty size={wp(3.8)} />}
          />
        </View>
        <Text
          style={styles.userReviewText}
          numberOfLines={textExpanded ? null : NUM_COLLAPSED_LINES}
          onPress={() => setTextExpanded(!textExpanded)}
        >
          {review}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userReviewContainer: {
    flexDirection: 'row',
    marginBottom: wp(3),
  },
  reviewTitleText: {
    fontSize: sizes.b1,
    fontFamily: 'Semi',
    color: colors.black,
    opacity: 0.9,
    letterSpacing: 0.2,
  },
  starsContainer: {
    flexDirection: 'row',
    marginLeft: -wp(0.3),
  },
  userPictureContainer: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(11) / 2,
    marginRight: wp(1),
    marginTop: wp(0.4),
    backgroundColor: colors.gray3,
  },
  userPicture: {
    width: wp(11),
    height: wp(11),
    borderRadius: wp(11) / 2,
  },
  userNameReviewContainer: {
    flex: 1,
    flexDirection: 'column',
    marginHorizontal: wp(2),
    justifyContent: 'center',
  },
  userReviewText: {
    fontSize: sizes.b2,
    fontFamily: 'Book',
    color: colors.black,
    marginTop: wp(0.25),
  },
});

export default ReviewItem;
