import React from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
} from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import StarsRating from './util/StarsRating';
import UserPictureList from './util/UserPictureList';
import {
  colors, sizes, wp, shadows, isPad,
} from '../../constants/theme';

const propTypes = {
  item: PropTypes.shape({
    timestamp: PropTypes.string,
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    avgRating: PropTypes.number,
  }).isRequired,
};

const PlaceListItem = ({
  item, placePosts, openPlacePosts, rating,
}) => {
  const userPics = placePosts.map(({
    placeUserInfo: { uid, picture },
  }) => ({ uid, picture }));

  const currRating = rating || { count: 1, sum: 0 };
  return (
    <TouchableOpacity
      style={[styles.postItem, { width: isPad ? wp(53.5) : wp(45) }]}
      activeOpacity={0.7}
      onPress={() => openPlacePosts({ stories: placePosts })}
    >
      <View style={styles.postImage}>
        <Image
          // cacheKey={item.imgUrl || placePosts[0].s3Photo}
          resizeMode="cover"
          style={[styles.postImage, { flex: 1 }]}
          source={{ uri: item.imgUrl || placePosts[0].s3Photo }}
        />
        <View style={styles.gradientContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.32)', 'transparent']}
            style={styles.gradient}
          />
        </View>
        <View style={styles.userPicListContainer}>
          <UserPictureList userPics={userPics} size={wp(6.1)} limit={3} />
        </View>
      </View>
      <View style={styles.postBottomContainer}>
        <Text style={styles.postNameText} numberOfLines={1}>
          {item.name}
        </Text>
        {item.categories && item.categories[0]
          && (
            <Text style={styles.postCategoryText}>
              {item.categories[0]}
            </Text>
          )}
        <StarsRating
          rating={currRating.sum / currRating.count}
          spacing={wp(0.5)}
          size={wp(3.8)}
          starStyle={styles.myStarStyle}
          containerStyle={styles.starsContainer}
          text={`(${currRating.sum ? currRating.count : '0'})`}
          textStyle={[
            styles.reviewText,
            {
              color: currRating.count
                ? colors.black : colors.gray,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

PlaceListItem.propTypes = propTypes;

export default PlaceListItem;

const styles = StyleSheet.create({
  postItem: {
    width: wp(45),
    aspectRatio: 0.79,
    backgroundColor: '#fff',
    borderRadius: wp(3),
    ...shadows.baseEven,
  },
  postImage: {
    flex: 0.62,
    width: '100%',
    height: '100%',
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    backgroundColor: colors.gray3,
    overflow: 'hidden',
  },
  gradientContainer: {
    position: 'absolute',
    overflow: 'hidden',
    borderTopLeftRadius: wp(3),
    borderTopRightRadius: wp(3),
    height: '30%',
    width: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    width: '100%',
  },
  userPicListContainer: {
    position: 'absolute',
    top: wp(3.2),
    right: wp(3.9),
    flexDirection: 'row',
    alignItems: 'center',
  },
  postBottomContainer: {
    flex: 0.38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postNameText: {
    fontFamily: 'Semi',
    fontSize: sizes.b3,
    textAlign: 'center',
    color: colors.black,
    paddingHorizontal: wp(2),
  },
  postCategoryText: {
    fontFamily: 'Book',
    fontSize: wp(3.1),
    textAlign: 'center',
    color: colors.black,
    overflow: 'hidden',
  },
  starsContainer: {
    paddingTop: wp(1),
    marginBottom: wp(1),
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewText: {
    color: colors.black,
    marginLeft: wp(1),
    fontSize: sizes.b4,
    fontFamily: 'Book',
  },
});
