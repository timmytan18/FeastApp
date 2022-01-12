import React, {
  useState, useEffect, useContext, useRef,
} from 'react';
import {
  StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput,
  Image, ScrollView, Keyboard, Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import { API, graphqlOperation } from 'aws-amplify';
import { createFeastItem } from '../../api/graphql/mutations';
import MapMarker from '../components/util/icons/MapMarker';
import BackArrow from '../components/util/icons/BackArrow';
import RatingsInput from '../components/RatingsInput';
import { RATING_CATEGORIES } from '../../constants/constants';
import { Context } from '../../Store';
import {
  colors, sizes, wp, hp,
} from '../../constants/theme';

const propTypes = {
  route: PropTypes.shape({
    params: PropTypes.shape({
      business: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        location: PropTypes.shape({
          lat: PropTypes.number,
          lng: PropTypes.number,
        }),
      }),
    }),
  }).isRequired,
};

const PostDetails = ({ navigation, route }) => {
  const { business } = route.params;
  const [state, dispatch] = useContext(Context);

  const [review, setReview] = useState(state.review);
  const reviewRef = useRef(state.review);
  const ratings = useRef(state.ratings);

  useEffect(() => {
    // Save current review and ratings
    function saveReview() {
      dispatch({
        type: 'SET_REVIEW_RATINGS',
        payload: { review: reviewRef.current, ratings: ratings.current },
      });
    }

    // Share user review for this place
    async function share() {
      const { id, name, location } = business;
      const { PK } = state.user;
      const SK = `#PLACE#${id}`;
      const userReview = reviewRef.current;
      const userRatings = ratings.current;
      const input = {
        PK,
        SK,
        placeId: id,
        name,
        coordinates: { latitude: location.lat, longitude: location.lng },
        review: userReview,
        rating: userRatings,
      };
      try {
        await API.graphql(graphqlOperation(
          createFeastItem,
          { input },
        ));
      } catch (err) {
        console.log(err);
        Alert.alert(
          'Error',
          'Could not share your review. Please try again.',
          [{ text: 'OK' }],
          { cancelable: false },
        );
        return;
      }
      // Clear and reset review and ratings
      dispatch({
        type: 'SET_REVIEW_RATINGS',
        payload: { review: '', ratings: { ...RATING_CATEGORIES } },
      });
      navigation.navigate('Home');
    }

    const headerLeft = () => (
      <BackArrow
        color={colors.black}
        size={wp(6.2)}
        style={{ flex: 1 }}
        pressed={() => {
          saveReview();
          navigation.goBack();
        }}
      />
    );

    const headerRight = () => (
      <TouchableOpacity
        style={styles.shareButtonContainer}
        onPress={() => share()}
      >
        <Text style={styles.shareButtonText}>Share</Text>
      </TouchableOpacity>
    );

    navigation.setOptions({
      headerLeft,
      headerLeftContainerStyle: { paddingLeft: sizes.margin },
      headerRight,
    });
  }, [business, dispatch, navigation, state.user]);

  const changeRatings = ({ value, type }) => {
    if (ratings.current[type] !== value) {
      ratings.current[type] = value;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView onScrollBeginDrag={Keyboard.dismiss} style={{ margin: wp(4) }}>
        <View style={styles.postHeader}>
          <Image style={styles.profilePic} source={{ uri: state.user.picture }} resizeMode="contain" />
          <View style={styles.headerTextContainer}>
            <Text style={styles.nameText}>{state.user.name}</Text>
            <View style={styles.locationContainer}>
              <MapMarker size={wp(4.8)} color={colors.accent} />
              <Text style={styles.locationText}>{business.name}</Text>
            </View>
          </View>
        </View>
        <TextInput
          style={styles.reviewInput}
          onChangeText={(text) => {
            setReview(text);
            reviewRef.current = text;
          }}
          value={review}
          placeholder="Add a review/caption…"
          placeholderTextColor={colors.tertiary}
          multiline
          maxLength={256}
          blurOnSubmit
          returnKeyType="done"
        />
        <Text style={styles.ratingTitle}>My Ratings</Text>
        <View style={styles.ratingsContainer}>
          <RatingsInput ratings={ratings} changeRatings={changeRatings} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

PostDetails.propTypes = propTypes;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  shareButtonContainer: {
    flex: 1,
    paddingRight: sizes.margin,
    alignItems: 'center',
    flexDirection: 'row',
  },
  shareButtonText: {
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    color: colors.accent,
    letterSpacing: 0.4,
  },
  postHeader: {
    height: hp(7.2),
    width: '100%',
    flexDirection: 'row',
  },
  profilePic: {
    height: '90%',
    aspectRatio: 1,
    borderRadius: wp(15),
    alignSelf: 'center',
  },
  headerTextContainer: {
    justifyContent: 'space-between',
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    lineHeight: wp(7),
    color: colors.black,
    paddingLeft: wp(3),
  },
  locationContainer: {
    flexDirection: 'row',
    paddingLeft: wp(2.2),
    alignItems: 'flex-start',
  },
  locationText: {
    fontFamily: 'Semi',
    fontSize: sizes.h3,
    lineHeight: wp(6),
    textAlignVertical: 'top',
    color: colors.accent,
    letterSpacing: 0.3,
    paddingLeft: wp(1.2),
  },
  tagContainer: {
    flexDirection: 'row',
    marginTop: wp(4),
    paddingLeft: wp(1),
    alignItems: 'center',
  },
  tagText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    color: colors.black,
    paddingRight: wp(1.5),
    paddingBottom: wp(0.2),
    letterSpacing: 0.2,
  },
  reviewInput: {
    fontFamily: 'Book',
    fontSize: sizes.h4,
    color: colors.black,
    paddingHorizontal: wp(3),
    paddingTop: wp(2),
    paddingBottom: wp(2),
    marginVertical: wp(3),
    letterSpacing: 0.3,
    backgroundColor: colors.gray2,
    borderRadius: wp(2),
    height: hp(15),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'flex-end',
    marginBottom: wp(8),
  },
  menuItemText: {
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: 'white',
    width: wp(50),
    paddingBottom: wp(5),
    paddingLeft: wp(5),
  },
  ratingsContainer: {
    paddingHorizontal: wp(1),
    marginBottom: hp(5),
  },
  ratingTitle: {
    fontFamily: 'Semi',
    fontSize: wp(5.5),
    color: colors.primary,
    paddingLeft: wp(0.5),
    marginBottom: -wp(2),
  },
});

export default PostDetails;
