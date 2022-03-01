import React from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import { LinearGradient } from 'expo-linear-gradient';
import Stars from 'react-native-stars';
import { StarFull, StarHalf, StarEmpty } from './util/icons/Star';
import Yum from './util/icons/Yum';
import {
  colors, sizes, wp, shadows,
} from '../../constants/theme';

const propTypes = {
  item: PropTypes.shape({
    timestamp: PropTypes.string,
    s3Photo: PropTypes.string,
    name: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    avgRating: PropTypes.number,
  }).isRequired,
};

const PostListItem = ({
  item, numYums, placePosts, openPlacePosts,
}) => (
  <TouchableOpacity
    style={styles.postItem}
    activeOpacity={0.9}
    onPress={() => openPlacePosts({ stories: placePosts })}
  >
    <View style={styles.postImage}>
      <Image
        resizeMode="cover"
        style={[styles.postImage, { flex: 1 }]}
        source={{ uri: item.s3Photo }}
      />
      <View style={styles.gradientContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0.32)', 'transparent']}
          style={styles.gradient}
        />
      </View>
      {numYums && numYums > 0 && (
        <View style={styles.yumContainer}>
          <Yum size={wp(4.8)} />
          <Text style={styles.yumTextContainer}>
            {numYums}
            {' '}
            {numYums === 1 ? 'Yum' : 'Yums'}
          </Text>
        </View>
      )}
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
      {item.avgRating && (
        <View style={styles.starsContainer}>
          <Stars
            default={Math.round(item.avgRating * 2) / 2}
            count={5}
            half
            disabled
            spacing={wp(0.6)}
            fullStar={<StarFull size={wp(3.8)} />}
            halfStar={<StarHalf size={wp(3.8)} />}
            emptyStar={<StarEmpty size={wp(3.8)} />}
          />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

PostListItem.propTypes = propTypes;

export default PostListItem;

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
  yumContainer: {
    position: 'absolute',
    top: wp(3.2),
    left: wp(3.5),
    flexDirection: 'row',
    alignItems: 'center',
  },
  yumTextContainer: {
    fontFamily: 'Book',
    fontSize: sizes.b3,
    color: '#fff',
    paddingLeft: wp(1.5),
    paddingTop: wp(0.3),
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
    paddingTop: wp(1.5),
    marginBottom: wp(1),
  },
});
