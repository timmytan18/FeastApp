import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Image,
} from 'react-native';
import { Image as CacheImage } from 'react-native-expo-image-cache';
import PropTypes from 'prop-types';
import { Storage } from 'aws-amplify';
import { LinearGradient } from 'expo-linear-gradient';
import StarsRating from './util/StarsRating';
import Yum from './util/icons/Yum';
import {
  colors, sizes, wp, shadows, isPad,
} from '../../constants/theme';

const propTypes = {
  item: PropTypes.shape({
    timestamp: PropTypes.string,
    picture: PropTypes.string,
    name: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    avgRating: PropTypes.number,
    placeUserInfo: PropTypes.shape({
      identityId: PropTypes.string,
    }),
  }).isRequired,
};

const NUM_ROWS_TO_CACHE = 8;

const PostListItem = ({
  item, index, numYums, placePosts, openPlacePosts, refresh, isMe,
}) => {
  const [image, setImage] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    (async () => {
      if (item.picture) {
        const s3Photo = await Storage.get(
          item.picture,
          { identityId: item.placeUserInfo.identityId },
        );
        if (mounted.current) setImage(s3Photo);
      }
    })();
    return () => {
      mounted.current = false;
    };
  }, [item.picture, item.placeUserInfo.identityId, refresh]);
  return (
    <TouchableOpacity
      style={[styles.postItem, { width: isPad ? wp(53.5) : wp(45) }]}
      activeOpacity={0.9}
      onPress={() => openPlacePosts({ stories: placePosts })}
    >
      <View style={styles.postImage}>
        {isMe && image && index < NUM_ROWS_TO_CACHE && (
          <CacheImage
            style={[styles.postImage, { flex: 1 }]}
            preview={{ uri: image }}
            uri={image}
            cacheKey={item.picture}
            tint="light"
          />
        )}
        {(!isMe || !image || index >= NUM_ROWS_TO_CACHE) && (
          <Image
            resizeMode="cover"
            style={[styles.postImage, { flex: 1 }]}
            source={{ uri: image }}
          />
        )}
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
        {item.avgRating !== null && (
          <StarsRating
            rating={Math.round(item.avgRating * 2) / 2}
            spacing={wp(0.6)}
            size={wp(3.8)}
            containerStyle={styles.starsContainer}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

PostListItem.propTypes = propTypes;

export default PostListItem;

const styles = StyleSheet.create({
  postItem: {
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
