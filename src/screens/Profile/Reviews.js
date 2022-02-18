import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import {
  StyleSheet, Text, View, FlatList, TouchableOpacity, Keyboard, Image,
} from 'react-native';
import Stars from 'react-native-stars';
import { getPlaceDetailsQuery } from '../../api/functions/queryFunctions';
import { StarFull, StarHalf, StarEmpty } from '../components/util/icons/Star';
import CenterSpinner from '../components/util/CenterSpinner';
import { MONTHS } from '../../constants/constants';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const NUM_COLLAPSED_LINES = 3;

const ReviewItem = ({ item, openPlace }) => {
  const {
    timestamp, review, placeId, imgUrl, s3Photo, name,
  } = item;
  const date = new Date(timestamp);

  const [textExpanded, setTextExpanded] = useState(false);

  if (!review) {
    return null;
  }

  return (
    <View
      style={styles.reviewItemContainer}
      activeOpacity={0.5}
    >
      <TouchableOpacity activeOpacity={0.8} onPress={() => openPlace({ placeId })}>
        <Image
          style={styles.imageContainer}
          source={{ uri: imgUrl || s3Photo }}
        />
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.placeNameText}>{name}</Text>
        <View style={styles.starsContainer}>
          <Stars
            default={4}
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
          style={styles.reviewText}
          numberOfLines={textExpanded ? null : NUM_COLLAPSED_LINES}
          onPress={() => setTextExpanded(!textExpanded)}
        >
          {review}
        </Text>
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
};

const Reviews = ({ navigation, route }) => {
  const { reviews } = route.params;
  const place = useRef(null);

  const openPlace = async ({ placeId }) => {
    if (!place.current || place.current.placeId !== placeId) {
      place.current = await getPlaceDetailsQuery({ placeId });
    }
    navigation.push(
      'PlaceDetail',
      { place: place.current },
    );
  };

  return (
    <View style={styles.container}>
      {!reviews && <View style={{ flex: 0.2 }}><CenterSpinner /></View>}
      {reviews
        && (
          <FlatList
            style={styles.flatListContainer}
            data={reviews}
            extraData={reviews}
            renderItem={({ item }) => <ReviewItem item={item} openPlace={openPlace} />}
            keyExtractor={(item) => item.SK}
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
    paddingTop: wp(1),
    backgroundColor: 'white',
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
});

export default Reviews;
