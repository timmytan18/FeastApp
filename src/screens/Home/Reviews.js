import React, {
  useState, useRef, useContext, useEffect,
} from 'react';
import {
  StyleSheet, View, FlatList, Keyboard,
} from 'react-native';
import { getPlaceFollowingUserReviewsQuery, getPlaceAllUserReviewsQuery } from '../../api/functions/queryFunctions';
import ReviewItem from '../components/ReviewItem';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import {
  colors, sizes, wp,
} from '../../constants/theme';

const NUM_REVIEWS_TO_FETCH = 10;

const Reviews = ({ navigation, route }) => {
  const [{ user: { uid: myUID } }] = useContext(Context);
  const {
    placeId, fetchedReviews, fetchedNextToken, fromFollowingOnly,
  } = route.params;

  const [reviews, setReviews] = useState(fetchedReviews ? [...fetchedReviews] : []);
  const nextToken = useRef(fetchedNextToken);

  const [loading, setLoading] = useState(true);

  const fetchNextReviews = async () => {
    if (nextToken.current) {
      setLoading(true);
      const {
        userReviews,
        nextToken: nextNextToken,
      } = fromFollowingOnly
          ? await getPlaceFollowingUserReviewsQuery({
            myUID, placeId, limit: NUM_REVIEWS_TO_FETCH, currNextToken: nextToken.current,
          })
          : await getPlaceAllUserReviewsQuery({
            myUID, placeId, limit: NUM_REVIEWS_TO_FETCH, currNextToken: nextToken.current,
          });
      nextToken.current = nextNextToken;
      setReviews([...reviews, ...userReviews]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextReviews();
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
            ListHeaderComponent={<View style={{ height: wp(3) }} />}
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
    backgroundColor: 'white',
  },
  flatListContainer: {
    paddingHorizontal: sizes.margin + wp(1),
    flex: 1,
    width: '100%',
  },
});

export default Reviews;
