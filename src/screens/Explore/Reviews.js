import React, {
  useState, useRef, useContext, useEffect,
} from 'react';
import {
  StyleSheet, View, FlatList, Keyboard,
} from 'react-native';
import {
  getPlaceFollowingUserReviewsQuery,
  getPlaceAllUserReviewsQuery,
  fulfillPromise,
} from '../../api/functions/queryFunctions';
import ReviewItem from '../components/ReviewItem';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import { sizes, wp, wpFull } from '../../constants/theme';

const NUM_REVIEWS_TO_FETCH = 10;

const Reviews = ({ navigation, route }) => {
  const [{ user: { uid: myUID } }] = useContext(Context);
  const {
    placeId, fetchedReviews, fetchedNextToken, fromFollowingOnly,
  } = route.params;

  const [reviews, setReviews] = useState(fetchedReviews ? [...fetchedReviews] : []);
  const nextToken = useRef(fetchedNextToken);

  const [loading, setLoading] = useState(true);
  // const mounted = useRef(true);

  const fetchReviews = async () => {
    const { promise, getValue, errorMsg } = fromFollowingOnly ? getPlaceFollowingUserReviewsQuery({
      myUID, placeId, limit: NUM_REVIEWS_TO_FETCH, currNextToken: nextToken.current,
    }) : getPlaceAllUserReviewsQuery({
      myUID, placeId, limit: NUM_REVIEWS_TO_FETCH, currNextToken: nextToken.current,
    });
    return fulfillPromise(promise, getValue, errorMsg);
  };

  const fetchNextReviews = async () => {
    if (nextToken.current) {
      setLoading(true);
      const { userReviews, nextToken: nextNextToken } = await fetchReviews();
      nextToken.current = nextNextToken;
      // if (mounted.current) {
      setReviews([...reviews, ...userReviews]);
      setLoading(false);
      // }
    }
  };

  useEffect(() => {
    // if (mounted.current)
    fetchNextReviews();
    // return () => { mounted.current = false; };
  }, [myUID, placeId]);

  return (
    <View style={styles.container}>
      {reviews
        && (
          <FlatList
            style={styles.flatListContainer}
            data={reviews}
            extraData={reviews}
            renderItem={({ item }) => (
              <ReviewItem
                item={item}
                myUID={myUID}
                navigation={navigation}
              />
            )}
            keyExtractor={(item) => item.SK}
            showsVerticalScrollIndicator
            onScrollBeginDrag={Keyboard.dismiss}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={<View style={{ height: wpFull(3) }} />}
            ListFooterComponent={<View style={{ height: wp(3) }} />}
            contentContainerStyle={{ paddingBottom: wp(12) }}
            onEndReached={() => fetchNextReviews()}
          />
        )}
      {loading
        && (
          <View style={{ position: 'absolute', bottom: wp(20) }}>
            <CenterSpinner />
          </View>
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
    backgroundColor: '#fff',
  },
  flatListContainer: {
    paddingHorizontal: sizes.margin + wp(1),
    flex: 1,
    width: '100%',
  },
});

export default Reviews;
