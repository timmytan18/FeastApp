import React from 'react';
import {
  StyleSheet, Text, View, ImageBackground, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import UserPictureList from './util/UserPictureList';
import {
  colors, sizes, wp, shadows,
} from '../../constants/theme';

const propTypes = {
  item: PropTypes.shape({
    timestamp: PropTypes.string,
    imgUrl: PropTypes.string,
    name: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    avgOverallRating: PropTypes.number,
  }).isRequired,
};

const PlaceListItem = ({ item, placePosts, openPlacePosts }) => {
  const rating = item.avgOverallRating
    ? Math.round(item.avgOverallRating * 2) / 2 : 0;
  const userPics = placePosts.map(({
    placeUserInfo: { uid, picture },
  }) => ({ uid, picture }));

  return (
    <TouchableOpacity
      style={styles.postItem}
      activeOpacity={0.9}
      onPress={() => openPlacePosts({ stories: placePosts })}
    >
      <ImageBackground
        resizeMode="cover"
        style={styles.postImage}
        source={{ uri: item.imgUrl }}
      >
        <View style={styles.gradientContainer}>
          <LinearGradient
            colors={['rgba(0,0,0,0.32)', 'transparent']}
            style={styles.gradient}
          />
        </View>
        <View style={styles.userPicListContainer}>
          <UserPictureList userPics={userPics} size={wp(6.1)} limit={3} />
        </View>
      </ImageBackground>
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
        <View style={styles.starsContainer}>
          <Stars
            default={rating}
            count={5}
            half
            disabled
            spacing={wp(0.6)}
            fullStar={<StarFull size={wp(3.8)} />}
            halfStar={<StarHalf size={wp(3.8)} />}
            emptyStar={<StarEmpty size={wp(3.8)} />}
          />
          <Text style={[
            styles.reviewText,
            {
              color: item.review_count
                ? colors.black : colors.gray,
            },
          ]}
          >
            (
            {item.review_count ? item.review_count : '0'}
            )
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

PlaceListItem.propTypes = propTypes;

export default PlaceListItem;

const styles = StyleSheet.create({
  postItem: {
    width: wp(45),
    height: wp(57),
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
