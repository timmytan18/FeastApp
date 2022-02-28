import React, {
  useState, useRef, useContext, useEffect,
} from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Storage } from 'aws-amplify';
import PlaceListItem from '../components/PlaceListItem';
import { getPlaceDetailsQuery, getUserAllSavedPostsQuery, batchGetPlaceRatingsQuery } from '../../api/functions/queryFunctions';
import CenterSpinner from '../components/util/CenterSpinner';
import { Context } from '../../Store';
import { wp } from '../../constants/theme';

// Memoize row rendering, only rerender when row content changes
const RowItem = React.memo(({ row, openPlacePosts, ratings }) => (
  <View style={styles.postsRowContainer}>
    {row.map((placePosts) => {
      const item = placePosts[0];
      return (
        <PlaceListItem
          item={item}
          placePosts={placePosts}
          openPlacePosts={openPlacePosts}
          key={item.timestamp}
          rating={ratings && ratings[item.placeId] ? ratings[item.placeId] : null}
        />
      );
    })}
  </View>
), (prevProps, nextProps) => prevProps.row
  === nextProps.row && prevProps.ratings === nextProps.ratings);

const SavedPosts = ({ navigation, route }) => {
  const [{ user, deviceHeight }, dispatch] = useContext(Context);

  const [posts, setPosts] = useState(null);
  const [batch, setBatch] = useState(null);
  const [ratings, setRatings] = useState(null);
  const [loading, setLoading] = useState(false);

  const place = useRef({});

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      if (ratings === null && batch) {
        // Batch fetch average ratings
        const avgRatings = await batchGetPlaceRatingsQuery(
          { batch },
        );
        const updatedRatings = {};
        if (avgRatings && avgRatings.length) {
          avgRatings.forEach((rating) => {
            const { placeId, count, sum } = rating;
            updatedRatings[placeId] = { count, sum };
          });
        }
        setRatings(updatedRatings);
      }
    })();
    return () => controller.abort();
  }, [batch]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const getPostPictures = (item) => new Promise((resolve, reject) => {
      Storage.get(item.picture, { level: 'protected', identityId: item.placeUserInfo.identityId })
        .then((url) => {
          item.s3Photo = url;
          resolve(item);
        })
        .catch((err) => {
          console.warn('Error fetching post picture from S3: ', err);
          reject();
        });
    });

    // Fetch all saved posts
    (async () => {
      const savedPosts = await getUserAllSavedPostsQuery({ PK: user.PK, withUserInfo: false });
      const placePosts = {}; // { placeKey: [placePost, placePost, ...] }
      if (savedPosts && savedPosts.length) {
        Promise.all(savedPosts.map(getPostPictures)).then((currPosts) => {
          // Sort placePosts by most recently saved
          currPosts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

          // Batch average rating items
          const currBatch = [];

          for (let i = 0; i < currPosts.length; i += 1) {
            // Add to placePosts map
            const { placeId } = currPosts[i];
            if (!placePosts[placeId]) {
              placePosts[placeId] = [currPosts[i]];
              placePosts[placeId][0].visible = true;
              currBatch.push({ PK: `PLACE#${placeId}`, SK: '#RATING' });
            } else {
              placePosts[placeId].push(currPosts[i]);
            }
          }

          setBatch(currBatch);

          // Format posts for FlatList
          const updatedPosts = [];
          const placeIdKeys = Object.keys(placePosts);
          if (placeIdKeys && placeIdKeys.length) {
            for (let i = 0; i < placeIdKeys.length; i += 2) {
              if (i + 1 < placeIdKeys.length) {
                updatedPosts.push([placePosts[placeIdKeys[i]], placePosts[placeIdKeys[i + 1]]]);
              } else {
                updatedPosts.push([placePosts[placeIdKeys[i]]]);
              }
            }
          }
          setPosts(updatedPosts);
          setLoading(false);
        });
      } else {
        setPosts([]);
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [user.PK, user.identityId]);

  const openPlacePosts = async ({ stories }) => {
    const { placeId } = stories[0];
    if (place.current.placeId !== placeId) {
      const placeDetails = await getPlaceDetailsQuery({ placeId });
      if (placeDetails) place.current = placeDetails;
    }
    const { uid, name: userName, picture: userPic } = user;
    navigation.push('StoryModalModal', {
      screen: 'StoryModal',
      params: {
        stories,
        users: { [uid]: { userName, userPic } },
        places: { [place.current.placeId]: place.current },
        deviceHeight,
      },
    });
  };

  const renderRow = (item) => (
    <RowItem row={item} openPlacePosts={openPlacePosts} ratings={ratings} />
  );

  return (
    <View style={styles.container}>
      {loading && <CenterSpinner />}
      <FlatList
        data={posts}
        renderItem={({ item }) => renderRow(item)}
        keyExtractor={(item, index) => index}
        contentContainerStyle={styles.flatlistContainer}
        style={{ width: '100%' }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
  },
  flatlistContainer: {
    paddingTop: wp(3),
    paddingBottom: wp(12),
  },
  postsRowContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: wp(4),
    marginBottom: wp(2.5),
    flexDirection: 'row',
  },
});

export default SavedPosts;
