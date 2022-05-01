import React, { useState, useContext } from 'react';
import {
  Text, View, StyleSheet, TouchableOpacity,
} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { getUserPostQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import { fetchCurrentUserUID } from '../../api/functions/FetchUserProfile';
import ProfilePic from './ProfilePic';
import StarsRating from './util/StarsRating';
import { Context } from '../../Store';
import {
  colors, sizes, wp, shadows,
} from '../../constants/theme';

const NUM_COLLAPSED_LINES = 3;

const fetchReviewUser = async ({ uid, myUID, navigation }) => {
  const currUser = await fetchCurrentUserUID({ fetchUID: uid, myUID });
  navigation.push(
    'ProfileStack',
    { screen: 'Profile', params: { user: currUser } },
  );
};

const openPost = async ({
  uid, timestamp, navigation, setTooltipActive,
}) => {
  setTooltipActive(false);
  const { promise, getValue, errorMsg } = getUserPostQuery({ uid, timestamp });
  const postDetails = await fulfillPromise(promise, getValue, errorMsg);
  navigation.push('StoryModalModal', {
    screen: 'StoryModal',
    params: {
      stories: [postDetails],
      places: {},
      postOnly: true,
    },
  });
};

const ReviewItem = ({
  item: {
    review,
    rating,
    timestamp,
    placeUserInfo: { name: userName, picture: userPicture, uid },
  },
  myUID,
  navigation,
}) => {
  const [{ bannedUsers }] = useContext(Context);
  const [textExpanded, setTextExpanded] = useState(false);
  const [tooltipActive, setTooltipActive] = useState(false);
  if (bannedUsers.has(uid)) return null;
  return (
    <View style={styles.userReviewContainer}>
      <TouchableOpacity
        style={styles.userPictureContainer}
        activeOpacity={0.7}
        onPress={() => fetchReviewUser({ uid, myUID, navigation })}
      >
        <ProfilePic
          extUrl={userPicture}
          uid={uid}
          size={USER_PIC_SIZE}
          style={styles.userPicture}
        />
      </TouchableOpacity>
      <View style={styles.userNameReviewContainer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => fetchReviewUser({ uid, myUID, navigation })}
        >
          <Text style={styles.reviewTitleText}>{userName}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setTooltipActive(true)}
        >
          <StarsRating
            rating={rating}
            spacing={wp(0.6)}
            size={wp(3.8)}
            containerStyle={styles.starsContainer}
          />
          <Tooltip
            isVisible={tooltipActive}
            content={(
              <TouchableOpacity
                onPress={() => openPost({
                  uid, timestamp, navigation, setTooltipActive,
                })}
              >
                <Text style={styles.tooltipText}>View Post</Text>
              </TouchableOpacity>
            )}
            placement="top"
            backgroundColor={null}
            onClose={() => setTooltipActive(false)}
            childrenWrapperStyle={{ opacity: 0 }}
            disableShadow
            tooltipStyle={styles.tooltipContainer}
          >
            <Text
              style={styles.userReviewText}
              numberOfLines={textExpanded ? null : NUM_COLLAPSED_LINES}
              onPress={() => {
                setTextExpanded(!textExpanded);
                setTooltipActive(true);
              }}
            >
              {review}
            </Text>
          </Tooltip>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const USER_PIC_SIZE = wp(11);
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
    marginVertical: wp(1),
  },
  userPictureContainer: {
    width: USER_PIC_SIZE,
    height: USER_PIC_SIZE,
    borderRadius: USER_PIC_SIZE / 2,
    marginRight: wp(1),
    marginTop: wp(0.4),
    backgroundColor: colors.gray3,
  },
  userPicture: {
    width: USER_PIC_SIZE,
    height: USER_PIC_SIZE,
    borderRadius: USER_PIC_SIZE / 2,
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
  tooltipContainer: {
    ...shadows.base,
  },
  tooltipText: {
    fontSize: sizes.b3,
    lineHeight: wp(4.8),
    fontFamily: 'Medium',
    color: colors.tertiary,
    textAlign: 'center',
    marginHorizontal: wp(2.5),
    marginVertical: wp(0.5),
    paddingTop: 1.5,
  },
});

export default ReviewItem;
