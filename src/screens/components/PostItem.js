import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  StyleSheet, Text, View, Image, TouchableOpacity,
} from 'react-native';
import { Storage } from 'aws-amplify';
import MaskedView from '@react-native-community/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import ProfilePic from './ProfilePic';
import SaveButton from './util/SaveButton';
import YumButton from './util/YumButton';
import ThreeDots from './util/icons/ThreeDots';
import StarsRating from './util/StarsRating';
import MapMarker from './util/icons/MapMarker';
import getElapsedTime from '../../api/functions/GetElapsedTime';
import { POST_IMAGE_ASPECT, GET_SAVED_POST_ID } from '../../constants/constants';
import {
  colors, wp, sizes, gradients,
} from '../../constants/theme';

const NUM_COLLAPSED_LINES = 2;

const PostItem = ({
  item, fetchUser, onMorePressed, showYummedUsersModal, me, dispatch, savedPosts, openPlace,
}) => {
  let uid; let identityId; let placeId; let name; let geo; let categories;
  let imgUrl; let picture; let dish; let rating; let review; let timestamp;
  let userName; let userPic;
  if (item) {
    ({
      placeUserInfo: {
        uid, name: userName, picture: userPic, identityId,
      },
      placeId, name, picture, dish, rating, review, timestamp, geo, categories, imgUrl,
    } = item);
  }
  const elapsedTime = getElapsedTime(timestamp);
  const [image, setImage] = useState(null);
  useEffect(() => {
    (async () => {
      const s3Photo = await Storage.get(picture, { identityId });
      setImage(s3Photo);
    })();
  }, []);

  const {
    PK: myPK, uid: myUID, name: myName, picture: myPicture,
  } = me;

  const isSaved = savedPosts.has(GET_SAVED_POST_ID({
    uid, timestamp,
  }));

  const [numLines, setNumLines] = useState(null);
  const [numLinesExpanded, setNumLinesExpanded] = useState(null);
  const lineHeight = useRef(null);

  const onTextLayout = useCallback((e) => {
    if (numLinesExpanded == null) {
      setNumLinesExpanded(e.nativeEvent.lines.length);
      lineHeight.current = e.nativeEvent.lines[0] ? e.nativeEvent.lines[0].height : 0;
      setNumLines(NUM_COLLAPSED_LINES);
    }
  }, []);
  const isExpanded = (numLines === numLinesExpanded && numLinesExpanded > NUM_COLLAPSED_LINES);
  return (
    <View>
      <View style={styles.cardContainer}>
        <View style={styles.headerContainer}>
          <View style={{ flexDirection: 'row', width: '90%' }}>
            <TouchableOpacity
              onPress={() => fetchUser({ fetchUID: uid })}
              activeOpacity={0.8}
              style={styles.profilePic}
            >
              <ProfilePic
                uid={uid}
                extUrl={userPic}
                size={wp(12.5)}
                style={{ flex: 1 }}
              />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <View style={styles.nameElapsedTimeContainer}>
                <TouchableOpacity
                  onPress={() => fetchUser({ fetchUID: uid })}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nameText}>{userName}</Text>
                </TouchableOpacity>
                <Text style={styles.elapsedTimeText}>{elapsedTime}</Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => openPlace({ placeId })}
              >
                <MaskedView
                  maskElement={(
                    <View style={styles.locationContainer}>
                      <MapMarker size={wp(4.8)} color={colors.accent} />
                      <Text style={styles.locationText} numberOfLines={1}>{name}</Text>
                    </View>
                  )}
                >
                  <LinearGradient
                    colors={gradients.purple.colors}
                    start={[-0.2, 1]}
                    end={[1.2, 0]}
                    style={{ width: name.length * wp(5), height: sizes.h4 + wp(1.5) }}
                  />
                </MaskedView>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => onMorePressed(item)}
            style={styles.moreContainer}
          >
            <ThreeDots rotated size={wp(5)} />
          </TouchableOpacity>
        </View>
        <View style={styles.reviewTitleStarsContainer}>
          <Text style={styles.reviewTitleText}>
            Review:
          </Text>
          {rating && (
            <StarsRating
              rating={rating}
              spacing={wp(0.6)}
              size={wp(5)}
              containerStyle={styles.starsContainer}
            />
          )}
        </View>
        <View style={[isExpanded && {
          justifyContent: 'space-between', flex: 1, paddingBottom: wp(5),
        }]}
        >
          {numLinesExpanded == null && (
            <View pointerEvents="box-none">
              <Text
                style={[styles.reviewText, styles.reviewTextHidden]}
                onTextLayout={onTextLayout}
              >
                {review}
              </Text>
            </View>
          )}
          <Text
            style={[styles.reviewText, !isExpanded && { paddingBottom: wp(4) }]}
            numberOfLines={numLinesExpanded == null ? NUM_COLLAPSED_LINES : numLines}
            onPress={() => setNumLines(
              isExpanded ? NUM_COLLAPSED_LINES : numLinesExpanded,
            )}
          >
            {review}
          </Text>
          <View>
            <Image
              style={[styles.image]}
              source={{ uri: image }}
            />
            <View style={styles.emojiContainer} />
            {dish && <Text style={styles.menuItemText}>{dish}</Text>}
            <View style={styles.middleContainer}>
              <View style={styles.middleButtonsContainer}>
                <View style={[styles.sideButtonsContainer, { alignItems: 'flex-start' }]}>
                  <SaveButton
                    isSaved={isSaved}
                    dispatch={dispatch}
                    size={wp(10)}
                    post={item}
                    place={{ geo, placeInfo: { categories, imgUrl } }}
                    myUID={myUID}
                    light
                  />
                </View>
                <View style={[styles.sideButtonsContainer, { alignItems: 'flex-end' }]}>
                  <YumButton
                    size={wp(10)}
                    uid={uid}
                    placeId={placeId}
                    timestamp={timestamp}
                    myUID={myUID}
                    myPK={myPK}
                    myName={myName}
                    myPicture={myPicture}
                    showYummedUsersModal={showYummedUsersModal}
                    light
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

function areEqual(prevProps, nextProps) {
  // // Rerender if isSaved changes
  // const prevIsSaved = prevProps.savedPosts.has(GET_SAVED_POST_ID({
  //   uid: prevProps.item.placeUserInfo.uid, timestamp: prevProps.item.timestamp,
  // }));
  // const nextIsSaved = nextProps.savedPosts.has(GET_SAVED_POST_ID({
  //   uid: nextProps.item.placeUserInfo.uid, timestamp: nextProps.item.timestamp,
  // }));
  // return prevIsSaved === nextIsSaved;
  return false;
}

const ratingIconSize = wp(12);
const styles = StyleSheet.create({
  cardContainer: {
    flex: 0.85,
    width: '100%',
    marginTop: wp(4.5),
    marginBottom: wp(4.5),
    paddingHorizontal: sizes.margin / 1.5,
  },
  middleContainer: {
    position: 'absolute',
    bottom: sizes.margin,
    right: wp(4),
  },
  middleButtonsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideButtonsContainer: {
    marginVertical: wp(2.5),
  },
  headerContainer: {
    height: wp(15.5),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: wp(3),
  },
  profilePic: {
    aspectRatio: 1,
    borderRadius: wp(15),
    alignSelf: 'center',
  },
  headerTextContainer: {
    justifyContent: 'space-between',
    marginTop: wp(1.3),
    marginBottom: wp(0.7),
  },
  nameElapsedTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    fontFamily: 'Medium',
    fontSize: sizes.h4,
    color: colors.black,
    paddingLeft: wp(3),
  },
  elapsedTimeText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    color: colors.tertiary,
    opacity: 0.6,
    paddingLeft: wp(2),
    paddingTop: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    paddingLeft: wp(2.2),
    width: wp(60),
    alignItems: 'flex-start',
  },
  locationText: {
    fontFamily: 'Semi',
    fontSize: sizes.h4,
    lineHeight: wp(6),
    textAlignVertical: 'top',
    color: colors.accent,
    letterSpacing: 0.3,
    paddingLeft: wp(1.2),
  },
  moreContainer: {
    alignSelf: 'center',
    marginRight: wp(0.5),
    padding: wp(2),
  },
  image: {
    borderRadius: wp(2),
    width: '100%',
    aspectRatio: POST_IMAGE_ASPECT[0] / POST_IMAGE_ASPECT[1],
  },
  menuItemText: {
    position: 'absolute',
    left: wp(5),
    bottom: wp(5),
    fontFamily: 'Medium',
    fontSize: wp(5.6),
    color: '#fff',
    width: wp(50),
  },
  reviewTitleStarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: wp(1),
    paddingLeft: 1,
  },
  reviewTitleText: {
    fontFamily: 'Medium',
    fontSize: sizes.b1,
    paddingRight: wp(2),
    alignSelf: 'flex-end',
  },
  starsContainer: {
    marginBottom: wp(1),
    zIndex: 1,
  },
  reviewText: {
    fontFamily: 'Book',
    fontSize: sizes.b2,
    paddingHorizontal: 2,
    paddingTop: wp(0.4),
    paddingBottom: wp(1),
    alignSelf: 'center',
    textAlign: 'left',
    width: '100%',
  },
  reviewTextHidden: {
    opacity: 0,
    position: 'absolute',
    zIndex: -1,
  },
  ratingsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginBottom: wp(2),
    paddingLeft: wp(1),
    paddingRight: wp(2),
  },
  ratingContainer: {
    alignItems: 'center',
    flex: 0.25,
  },
  ratingIconContainer: {
    position: 'absolute',
    height: '100%',
    width: ratingIconSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingText: {
    fontFamily: 'Medium',
    fontSize: sizes.b2,
    color: '#fff',
  },
  ratingLabelText: {
    fontFamily: 'Medium',
    fontSize: sizes.b4,
    color: colors.black,
    paddingTop: wp(1.5),
  },
});

export default React.memo(PostItem, areEqual);
