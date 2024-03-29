import React, {
  useState, useRef, useEffect,
} from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, Image,
} from 'react-native';
import Tooltip from 'react-native-walkthrough-tooltip';
import { getPlaceDetailsQuery, getUserPostQuery, fulfillPromise } from '../../api/functions/queryFunctions';
import StarsRating from '../components/util/StarsRating';
import BackArrow from '../components/util/icons/BackArrow';
import { MONTHS } from '../../constants/constants';
import {
  colors, sizes, wp, shadows,
} from '../../constants/theme';

const NUM_COLLAPSED_LINES = 3;

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

const ProfileReviewItem = React.memo(({
  item, openPlace, uid, navigation,
}) => {
  const {
    timestamp, review, placeId, imgUrl, s3Photo, name,
  } = item;
  const date = new Date(timestamp);

  const [textExpanded, setTextExpanded] = useState(false);
  const [tooltipActive, setTooltipActive] = useState(false);

  const mounted = useRef(true);

  useEffect(() => () => { mounted.current = false; }, []);

  return (
    <View
      style={styles.reviewItemContainer}
      activeOpacity={0.5}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openPlace({ placeId, placeName: name })}
      >
        <Image
          style={styles.imageContainer}
          source={{ uri: imgUrl || s3Photo }}
        />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => openPlace({ placeId, placeName: name })}
        >
          <Text style={styles.placeNameText}>{name}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTooltipActive(true)} activeOpacity={1}>
          <StarsRating
            rating={item.rating}
            spacing={wp(0.6)}
            size={wp(3.8)}
            starStyle={styles.myStarStyle}
            containerStyle={styles.starsContainer}
          />
        </TouchableOpacity>
        <Tooltip
          isVisible={tooltipActive && mounted.current}
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
          onClose={() => { if (mounted.current) setTooltipActive(false); }}
          childrenWrapperStyle={{ opacity: 0 }}
          disableShadow
          tooltipStyle={styles.tooltipContainer}
        >
          {review !== null && review.length > 0 && (
            <Text
              style={styles.reviewText}
              numberOfLines={textExpanded ? null : NUM_COLLAPSED_LINES}
              onPress={() => {
                setTextExpanded(!textExpanded);
                setTooltipActive(true);
              }}
            >
              {review}
            </Text>
          )}
        </Tooltip>
        <Text style={styles.dateText}>
          {MONTHS[date.getMonth()]}
          {' '}
          {date.getDate()}
          ,
          {' '}
          {date.getFullYear()}
        </Text>
      </View>
    </View>
  );
}, () => true);

const ProfileReviews = ({
  reviews, uid, postRowLength, navigation, route,
}) => {
  if (postRowLength === undefined) ({ reviews, uid } = route.params);
  const place = useRef(null);

  const openPlace = async ({ placeId, placeName }) => {
    if (!place.current || place.current.placeId !== placeId) {
      const { promise, getValue, errorMsg } = getPlaceDetailsQuery({ placeId });
      place.current = await fulfillPromise(promise, getValue, errorMsg);
    }
    navigation.push(
      'PlaceDetail',
      { place: place.current, placeId, placeName },
    );
  };

  const goToAllReviews = () => {
    navigation.push(
      'ProfileReviews',
      { reviews, uid },
    );
  };
  return (
    <View style={styles.container}>
      {reviews
        && (
          <FlatList
            style={styles.flatListContainer}
            data={reviews}
            extraData={reviews}
            renderItem={({ item }) => (
              <ProfileReviewItem
                item={item}
                openPlace={openPlace}
                uid={uid}
                navigation={navigation}
              />
            )}
            keyExtractor={(item) => item.SK}
            showsVerticalScrollIndicator
            onScrollBeginDrag={Keyboard.dismiss}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={<View style={{ height: wp(3) }} />}
            ListFooterComponent={<View style={{ height: wp(3) }} />}
          />
        )}
      {postRowLength !== undefined && (
        <TouchableOpacity
          style={[
            styles.seeMoreContainer,
            postRowLength > 3 && { top: rowHeight * postRowLength - wp(12) },
            postRowLength <= 3 && { bottom: 0 },
          ]}
          activeOpacity={0.9}
          onPress={goToAllReviews}
        >
          <Text style={styles.seeMoreText}>See all reviews</Text>
          <View pointerEvents="none">
            <BackArrow
              color={colors.tertiary}
              size={wp(5)}
              style={styles.downArrow}
            />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const rowHeight = wp(57) + wp(2.5);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: wp(1),
    backgroundColor: '#fff',
  },
  flatListContainer: {
    paddingHorizontal: sizes.margin + wp(1),
    flex: 1,
    width: '100%',
  },
  reviewItemContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: wp(2),
  },
  imageContainer: {
    height: wp(12),
    width: wp(12),
    borderRadius: wp(1.5),
    marginTop: wp(1.8),
    marginRight: wp(4),
  },
  infoContainer: {
    flex: 1.0,
    height: '100%',
    alignItems: 'flex-start',
  },
  placeNameText: {
    fontFamily: 'Semi',
    fontSize: sizes.b2,
    color: colors.black,
    paddingLeft: 1,
  },
  starsContainer: {
    marginVertical: wp(1),
    alignSelf: 'flex-start',
  },
  reviewText: {
    fontSize: wp(3.9),
    fontFamily: 'Book',
    color: colors.black,
    paddingLeft: 2,
  },
  dateText: {
    fontSize: wp(2.9),
    fontFamily: 'Book',
    color: colors.black,
    opacity: 0.6,
    paddingLeft: 1,
    paddingVertical: wp(0.8),
  },
  tooltipContainer: {
    ...shadows.darker,
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
  seeMoreContainer: {
    position: 'absolute',
    alignSelf: 'flex-end',
    flexDirection: 'row',
    right: wp(7.5),
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: wp(3),
    borderRadius: wp(2.5),
    backgroundColor: colors.gray2,
    ...shadows.darker,
  },
  seeMoreText: {
    fontSize: sizes.b2,
    fontFamily: 'Medium',
    color: colors.tertiary,
    marginRight: wp(1.5),
  },
  downArrow: {
    transform: [{ rotate: '180deg' }],
    ...shadows.base,
  },
});

export default ProfileReviews;
