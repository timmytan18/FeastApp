// Wrapper functions for GraphQL queries

import { API, graphqlOperation } from 'aws-amplify';
import {
  getUserProfile, getUserPosts, getUserPostsWithUserInfo, getFollowing, searchUsers, searchPlaces,
  getIsFollowing, getPlaceInDB, getPlaceInDBWithCategoriesAndPicture, getFollowers, getNumFollows,
  getFollowingPosts, getFollowingPostsByUser, getFollowersPK, batchGetUserPosts,
  getPlaceDetails, batchGetPlaceDetails, getPlaceFollowingUserReviews, getPlaceAllUserReviews,
  getUserAllSavedPosts, getUserAllSavedPostsNoDetails, getAllSavedPostItems, getPostYums,
  getUserYumsReceived, getPostYumsNoDetails, getUserEmail, getPlaceRating, batchGetPlaceRatings,
} from '../graphql/queries';

async function fulfillPromise(promise, getValue, errorMsg) {
  let result;
  try {
    result = await promise;
    if (result) result = getValue(result);
  } catch (err) {
    console.warn(errorMsg, err);
  }
  return result;
}

// Fetch user profile data
function getUserProfileQuery({ PK, SK, uid }) {
  let userPK = PK;
  let userSK = SK;
  if (uid) {
    userPK = `USER#${uid}`;
    userSK = '#PROFILE#';
  }
  const promise = API.graphql(
    graphqlOperation(getUserProfile, { PK: userPK, SK: { beginsWith: userSK } }),
  );
  const getValue = (res) => res.data.listFeastItems.items[0];
  const errorMsg = 'Error fetching user profile data: ';
  return { promise, getValue, errorMsg };
}

// Fetch reviews for a user (all or with geohash)
// withUserInfo: true will fetch reviews with user info
function getUserPostsQuery({ PK, hash, withUserInfo }) {
  const SK = hash ? `#PLACE#${hash}` : '#PLACE#';
  const promise = API.graphql(graphqlOperation(
    withUserInfo ? getUserPostsWithUserInfo : getUserPosts,
    {
      PK, SK: { beginsWith: SK }, limit: 50, sortDirection: 'DESC',
    },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error fetching user reviews: ';
  return { promise, getValue, errorMsg };
}

// Fetch users that current user is following
function getFollowingQuery({ uid }) {
  const promise = API.graphql(graphqlOperation(
    getFollowing,
    { GSI1: 'USER#', SK: { beginsWith: `#FOLLOWER#${uid}` }, limit: 200 },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error fetching following users: ';
  return { promise, getValue, errorMsg };
}

// Get whether I am following a user
function getIsFollowingQuery({ currentPK, currentUID, myUID }) {
  let PK = currentPK;
  if (currentUID) {
    PK = `USER#${currentUID}`;
  }
  const followSK = `#FOLLOWER#${myUID}`;
  const promise = API.graphql(graphqlOperation(
    getIsFollowing,
    { PK, SK: followSK },
  ));
  const getValue = (res) => !!(res.data.getFeastItem);
  const errorMsg = 'Error getting following status: ';
  return { promise, getValue, errorMsg };
}

// Fetch number of followers and following using getNumFollows query
function getNumFollowsQuery({ PK, SK }) {
  const promise = API.graphql(graphqlOperation(
    getNumFollows,
    { PK, SK },
  ));
  const getValue = (res) => {
    const num = res.data.getFeastItem;
    if (!num) return [0, 0];
    return [
      num.numFollowers >= 0 ? num.numFollowers : 0,
      num.numFollowing >= 0 ? num.numFollowing : 0,
    ];
  };
  const errorMsg = 'Error fetching num followers/following: ';
  return { promise, getValue, errorMsg };
}

// Get followers/following list
function getFollowersQuery({ PK, onlyReturnPKs }) {
  const promise = API.graphql(graphqlOperation(
    onlyReturnPKs ? getFollowersPK : getFollowers,
    { PK, SK: { beginsWith: '#FOLLOWER#' }, limit: 200 },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error getting followers/following list: ';
  return { promise, getValue, errorMsg };
}

// Search for users by name
function searchUsersQuery({ name }) {
  const GSI1 = 'USER#';
  const SK = `#PROFILE#${name}`;
  const promise = API.graphql(graphqlOperation(
    searchUsers,
    { GSI1, SK: { beginsWith: SK }, limit: 50 },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error searching for users: ';
  return { promise, getValue, errorMsg };
}

// Search for places by name
function searchPlacesQuery({ name }) {
  const GSI2 = 'PLACE#';
  const LSI1 = `#NAME#${name}`;
  const promise = API.graphql(graphqlOperation(
    searchPlaces,
    { GSI2, LSI1: { beginsWith: LSI1 }, limit: 50 },
  ));
  const getValue = (res) => res.data.itemsByGSI2.items;
  const errorMsg = 'Error searching for places: ';
  return { promise, getValue, errorMsg };
}

// Get whether place is in database
// If withCategoriesAndPicture, will also fetch categories and imgUrl
// and return { inDB, categories, imgUrl }
function getPlaceInDBQuery({ placePK, withCategoriesAndPicture }) {
  const placeSK = '#INFO#';
  const promise = API.graphql(graphqlOperation(
    withCategoriesAndPicture ? getPlaceInDBWithCategoriesAndPicture : getPlaceInDB,
    { PK: placePK, SK: { beginsWith: placeSK }, limit: 10 },
  ));
  const getValue = (res) => {
    const placeInDB = res.data.listFeastItems.items;
    if (placeInDB.length) {
      if (withCategoriesAndPicture) {
        const { categories, imgUrl } = placeInDB[0].placeInfo;
        return {
          placeInDB: true, categoriesDB: categories, imgUrlDB: imgUrl,
        };
      }
      return true;
    }
    return false;
  };
  const errorMsg = 'Error searching for users: ';
  return { promise, getValue, errorMsg };
}

// Get all posts in feed from following
function getFollowingPostsQuery({ PK }) {
  const promise = API.graphql(graphqlOperation(
    getFollowingPosts,
    {
      PK,
      SK: { beginsWith: '#FOLLOWINGPOST#' },
      sortDirection: 'DESC',
      limit: 1000,
    },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error getting followers/following list: ';
  return { promise, getValue, errorMsg };
}

// Get all posts in feed from a following user
// Used to delete a user's posts from feed
function getFollowingPostsByUserQuery({ PK, followingUID }) {
  const promise = API.graphql(graphqlOperation(
    getFollowingPostsByUser,
    { PK, LSI3: { eq: `#FOLLOWINGPOST#${followingUID}` }, limit: 500 },
  ));
  const getValue = (res) => res.data.itemsByLSI3.items;
  const errorMsg = 'Error getting followers/following list: ';
  return { promise, getValue, errorMsg };
}

// Batch get post details (get posts for specific place for stories)
function batchGetUserPostsQuery({ batch }) {
  const promise = API.graphql(graphqlOperation(
    batchGetUserPosts,
    { input: { items: batch } },
  ));
  const getValue = (res) => res.data.batchGetFeastItems;
  const errorMsg = 'Error batch getting user posts: ';
  return { promise, getValue, errorMsg };
}

// Get details about a place
function getPlaceDetailsQuery({ placeId }) {
  const promise = API.graphql(graphqlOperation(
    getPlaceDetails,
    { PK: `PLACE#${placeId}`, SK: { beginsWith: '#INFO#' }, limit: 1 },
  ));
  const getValue = (res) => res.data.listFeastItems.items[0];
  const errorMsg = 'Error getting place details: ';
  return { promise, getValue, errorMsg };
}

// Batch get details about a place
function batchGetPlaceDetailsQuery({ batch }) {
  const promise = API.graphql(graphqlOperation(
    batchGetPlaceDetails,
    { input: { items: batch } },
  ));
  const getValue = (res) => res.data.batchGetFeastItems;
  const errorMsg = 'Error batch getting place details: ';
  return { promise, getValue, errorMsg };
}

// Fetch reviews for a place from following users
function getPlaceFollowingUserReviewsQuery({
  myUID, placeId, limit, currNextToken,
}) {
  const promise = API.graphql(graphqlOperation(
    getPlaceFollowingUserReviews,
    {
      PK: `USER#${myUID}`,
      LSI2: { beginsWith: `#FOLLOWINGPOST#${placeId}` },
      limit: limit || 20,
      sortDirection: 'DESC',
      nextToken: currNextToken,
    },
  ));
  const getValue = (res) => {
    const userReviews = res.data.itemsByLSI2.items;
    const { nextToken } = res.data.itemsByLSI2;
    return { userReviews, nextToken };
  };
  const errorMsg = 'Error fetching place following user reviews: ';
  return { promise, getValue, errorMsg };
}

// Fetch reviews for a place from all users
function getPlaceAllUserReviewsQuery({ placeId, limit, currNextToken }) {
  const GSI1 = `POST#${placeId}`;
  const SK = '#PLACE#';
  const promise = API.graphql(graphqlOperation(
    getPlaceAllUserReviews,
    {
      GSI1,
      SK: { beginsWith: SK },
      limit: limit || 20,
      sortDirection: 'DESC',
      nextToken: currNextToken,
    },
  ));
  const getValue = (res) => {
    const userReviews = res.data.itemsByGSI1.items;
    const { nextToken } = res.data.itemsByGSI1;
    return { userReviews, nextToken };
  };
  const errorMsg = 'Error fetching place all user reviews: ';
  return { promise, getValue, errorMsg };
}

// Fetch all of a user's saved posts
function getUserAllSavedPostsQuery({ PK, noDetails }) {
  const promise = API.graphql(graphqlOperation(
    noDetails ? getUserAllSavedPostsNoDetails : getUserAllSavedPosts,
    {
      PK,
      SK: { beginsWith: '#SAVEDPOST#' },
      sortDirection: 'DESC',
      limit: 200,
    },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error getting all saved posts: ';
  return { promise, getValue, errorMsg };
}

// Fetch all saved post items for a specific post (across all users)
function getAllSavedPostItemsQuery({ uid, timestamp }) {
  const promise = API.graphql(graphqlOperation(
    getAllSavedPostItems,
    { GSI1: 'SAVEDPOST#', SK: { eq: `#SAVEDPOST#${timestamp}#${uid}` }, limit: 200 },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error fetching all saved post items for post: ';
  return { promise, getValue, errorMsg };
}

// Fetch all yum items for a specific post
function getPostYumsQuery({ uid, timestamp, noDetails }) {
  const GSI1 = `YUMPOST#${uid}`;
  const SK = `#YUMPOST#${timestamp}#${uid}`;
  const promise = API.graphql(graphqlOperation(
    noDetails ? getPostYumsNoDetails : getPostYums,
    {
      GSI1,
      SK: { eq: SK },
      limit: 500,
    },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error fetching all yum items for post: ';
  return { promise, getValue, errorMsg };
}

// Fetch all yums received for a specific user
function getUserYumsReceivedQuery({ uid }) {
  const GSI1 = `YUMPOST#${uid}`;
  const SK = '#YUMPOST#';
  const promise = API.graphql(graphqlOperation(
    getUserYumsReceived,
    {
      GSI1,
      SK: { beginsWith: SK },
      limit: 1000,
    },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error fetching all received yum items for user: ';
  return { promise, getValue, errorMsg };
}

// Fetch user email
function getUserEmailQuery({ uid }) {
  const userPK = `USER#${uid}`;
  const userSK = '#PROFILE#';
  const promise = API.graphql(
    graphqlOperation(getUserEmail, { PK: userPK, SK: { beginsWith: userSK } }),
  );
  const getValue = (res) => res.data.listFeastItems.items[0].email;
  const errorMsg = 'Error fetching user email: ';
  return { promise, getValue, errorMsg };
}

// Fetch place average rating
function getPlaceRatingQuery({ placeId }) {
  const promise = API.graphql(
    graphqlOperation(getPlaceRating, { PK: `PLACE#${placeId}`, SK: '#RATING' }),
  );
  const getValue = (res) => {
    let rating;
    const ratingRes = res.data.getFeastItem;
    if (ratingRes) {
      const { count, sum } = ratingRes;
      if (count > 0 && count != null && sum != null) {
        rating = { count, sum };
      }
    }
    return rating;
  };
  const errorMsg = 'Error fetching place rating: ';
  return { promise, getValue, errorMsg };
}

// Batch get places average ratings
function batchGetPlaceRatingsQuery({ batch }) {
  const promise = API.graphql(graphqlOperation(
    batchGetPlaceRatings,
    { input: { items: batch } },
  ));
  const getValue = (res) => res.data.batchGetFeastItems;
  const errorMsg = 'Error batch getting place ratings: ';
  return { promise, getValue, errorMsg };
}

export {
  fulfillPromise, getUserProfileQuery, getUserPostsQuery, getFollowingQuery, searchUsersQuery,
  searchPlacesQuery, getIsFollowingQuery, getPlaceInDBQuery, getFollowersQuery, getNumFollowsQuery,
  getFollowingPostsQuery, getFollowingPostsByUserQuery, batchGetUserPostsQuery,
  getPlaceDetailsQuery, batchGetPlaceDetailsQuery, getPlaceFollowingUserReviewsQuery,
  getPlaceAllUserReviewsQuery, getUserAllSavedPostsQuery, getAllSavedPostItemsQuery,
  getPostYumsQuery, getUserYumsReceivedQuery, getUserEmailQuery, getPlaceRatingQuery,
  batchGetPlaceRatingsQuery,
};
