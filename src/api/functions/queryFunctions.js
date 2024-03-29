// Wrapper functions for GraphQL queries

import { API, graphqlOperation } from 'aws-amplify';
import {
  getUserProfile, getUserExpoPushToken, getUserPosts, getUserPostsWithUserInfo, getUserPost,
  getFollowing, getFollowingPK, searchUsers, searchPlaces, searchPlacesUpload, getIsFollowing,
  getPlaceInDB, getPlaceInDBWithCategoriesAndPicture, getFollowers, getFollowersByTime,
  getNumFollows, getFollowingPosts, getFollowingPostsDetails, getFollowingPostsByUser,
  getFollowersPK, batchGetUserPosts, getAllPosts, getPlaceDetails, batchGetPlaceDetails,
  getPlaceFollowingUserReviews, getPlaceAllUserReviews, getUserAllSavedPosts,
  getUserAllSavedPostsNoDetails, getAllSavedPostItems, getPostYums, getUserYumsReceived,
  getUserYumsReceivedByTime, getPostYumsNoDetails, getUserEmail, getPlaceRating,
  batchGetPlaceRatings, getPostNumComments, getPostComments, getUserCommentsReceivedByTime,
  getPostCommentsNoDetails, getBannedUsers,
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
  const getValue = (res) => res.data.listFeastItems.items[0] || null;
  const errorMsg = 'Error fetching user profile data: ';
  return { promise, getValue, errorMsg };
}

// Get user expo push token
function getUserExpoPushTokenQuery({ uid }) {
  const PK = `USER#${uid}`;
  const SK = '#PROFILE#';
  const promise = API.graphql(graphqlOperation(
    getUserExpoPushToken,
    { PK, SK: { beginsWith: SK } },
  ));
  const getValue = (res) => {
    if (res.data.listFeastItems.items[0]) {
      return res.data.listFeastItems.items[0].expoPushToken;
    }
    return null;
  };
  const errorMsg = 'Error getting user expo push token: ';
  return { promise, getValue, errorMsg };
}

// Fetch reviews for a user (all or with hash)
// withUserInfo: true will fetch reviews with user info
function getUserPostsQuery({
  PK, hash, withUserInfo,
}) {
  const SK = hash ? `#PLACE#${hash}` : '#PLACE#';
  const promise = API.graphql(graphqlOperation(
    withUserInfo ? getUserPostsWithUserInfo : getUserPosts,
    {
      PK, SK: { beginsWith: SK }, limit: 500, sortDirection: 'DESC',
    },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error fetching user reviews: ';
  return { promise, getValue, errorMsg };
}

// Fetch specific user post
function getUserPostQuery({ uid, timestamp }) {
  const PK = `USER#${uid}`;
  const SK = `#PLACE#${timestamp}`;
  const promise = API.graphql(graphqlOperation(
    getUserPost,
    { PK, SK },
  ));
  const getValue = (res) => res.data.getFeastItem;
  const errorMsg = 'Error fetching user post: ';
  return { promise, getValue, errorMsg };
}

// Fetch users that current user is following
function getFollowingQuery({ uid, onlyReturnPKs }) {
  const promise = API.graphql(graphqlOperation(
    onlyReturnPKs ? getFollowingPK : getFollowing,
    { GSI1: 'USER#', SK: { beginsWith: `#FOLLOWER#${uid}` }, limit: 500 },
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
    { PK, SK: { beginsWith: '#FOLLOWER#' }, limit: 500 },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error getting followers/following list: ';
  return { promise, getValue, errorMsg };
}

// Get followers by time
function getFollowersByTimeQuery({ PK, timestamp, limit }) {
  const date = new Date();
  const timeLocal = date.toISOString();
  const promise = API.graphql(graphqlOperation(
    getFollowersByTime,
    {
      PK,
      LSI1: { between: [`#FOLLOWTIME#${timestamp}`, `#FOLLOWTIME#${timeLocal}`] },
      limit: limit || 200,
      sortDirection: 'DESC',
    },
  ));
  const getValue = (res) => res.data.itemsByLSI1.items;
  const errorMsg = 'Error getting followers by time list: ';
  return { promise, getValue, errorMsg };
}

// Search for users by name
function searchUsersQuery({ name }) {
  const GSI1 = 'USER#';
  const SK = `#PROFILE#${name}`;
  const promise = API.graphql(graphqlOperation(
    searchUsers,
    { GSI1, SK: { beginsWith: SK }, limit: 100 },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error searching for users: ';
  return { promise, getValue, errorMsg };
}

// Search for places by name
function searchPlacesQuery({ name, isUpload }) {
  const GSI2 = 'PLACE#';
  const LSI1 = `#NAME#${name}`;
  const promise = API.graphql(graphqlOperation(
    isUpload ? searchPlacesUpload : searchPlaces,
    { GSI2, LSI1: { beginsWith: LSI1 }, limit: 100 },
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

// Get posts in feed from following
function getFollowingPostsQuery({ PK, timestamp }) {
  let SK = { beginsWith: '#FOLLOWINGPOST#' };
  if (timestamp) {
    const date = new Date();
    const timeLocal = date.toISOString();
    SK = { between: [`#FOLLOWINGPOST#${timestamp}`, `#FOLLOWINGPOST#${timeLocal}`] };
  }
  const promise = API.graphql(graphqlOperation(
    getFollowingPosts,
    {
      PK, SK, sortDirection: 'DESC', limit: 1000,
    },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error getting posts in feed by time: ';
  return { promise, getValue, errorMsg };
}

// Get all posts with details in feed from following
function getFollowingPostsDetailsQuery({
  PK, timestamp, limit, nextToken,
}) {
  const date = new Date();
  const timeLocal = date.toISOString();
  const promise = API.graphql(graphqlOperation(
    getFollowingPostsDetails,
    {
      PK,
      SK: { between: [`#FOLLOWINGPOST#${timestamp}`, `#FOLLOWINGPOST#${timeLocal}`] },
      sortDirection: 'DESC',
      limit,
      nextToken,
    },
  ));
  const getValue = (res) => {
    const currPosts = res.data.listFeastItems.items;
    const { nextToken: currNextToken } = res.data.listFeastItems;
    return { currPosts, nextToken: currNextToken };
  };
  const errorMsg = 'Error getting posts with details in feed: ';
  return { promise, getValue, errorMsg };
}

// Get all posts in feed from a following user
// Used to delete a user's posts from feed
function getFollowingPostsByUserQuery({ PK, followingUID }) {
  const promise = API.graphql(graphqlOperation(
    getFollowingPostsByUser,
    { PK, LSI3: { eq: `#FOLLOWINGPOST#${followingUID}` }, limit: 1000 },
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

function getAllPostsQuery({ timestamp }) {
  const date = new Date();
  const timeLocal = date.toISOString();
  const promise = API.graphql(graphqlOperation(
    getAllPosts,
    {
      GSI2: 'POST#',
      LSI1: { between: [`#POSTTIME#${timestamp}`, `#POSTTIME#${timeLocal}`] },
      // LSI1: { beginsWith: '#PLACE#' },
      sortDirection: 'DESC',
      limit: 1000,
    },
  ));
  const getValue = (res) => res.data.itemsByGSI2.items;
  const errorMsg = 'Error getting all posts: ';
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
      limit: 500,
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
    { GSI1: 'SAVEDPOST#', SK: { eq: `#SAVEDPOST#${timestamp}#${uid}` }, limit: 1000 },
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

// Fetch yums received for a user by time
function getUserYumsReceivedByTimeQuery({ uid, timestamp, limit }) {
  const GSI2 = `YUMPOST#${uid}`;
  const date = new Date();
  const timeLocal = date.toISOString();
  const promise = API.graphql(graphqlOperation(
    getUserYumsReceivedByTime,
    {
      GSI2,
      LSI1: { between: [`#YUMTIME#${timestamp}`, `#YUMTIME#${timeLocal}`] },
      limit: limit || 200,
      sortDirection: 'DESC',
    },
  ));
  const getValue = (res) => res.data.itemsByGSI2.items;
  const errorMsg = 'Error fetching received yum items by time for user: ';
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

// Fetch number of comments for a post
function getPostNumCommentsQuery({ uid, timestamp }) {
  const PK = `POST#${timestamp}#${uid}`;
  const SK = '#NUMCOMMENTS';
  const promise = API.graphql(graphqlOperation(
    getPostNumComments,
    { PK, SK },
  ));
  const getValue = (res) => (res.data.getFeastItem ? res.data.getFeastItem.count : null);
  const errorMsg = 'Error fetching post num comments: ';
  return { promise, getValue, errorMsg };
}

// Fetch comments for a post
function getPostCommentsQuery({
  uid, timestamp, limit, currNextToken,
}) {
  const PK = `POST#${timestamp}#${uid}`;
  const SK = '#COMMENT#';
  const promise = API.graphql(graphqlOperation(
    getPostComments,
    {
      PK,
      SK: { beginsWith: SK },
      // sortDirection: 'DESC',
      // limit: limit || 20,
      nextToken: currNextToken,
    },
  ));
  const getValue = (res) => {
    const postComments = res.data.listFeastItems.items;
    const { nextToken } = res.data.listFeastItems;
    return { postComments, nextToken };
  };
  const errorMsg = 'Error getting comments: ';
  return { promise, getValue, errorMsg };
}

// Fetch comments received for a user by time
function getUserCommentsReceivedByTimeQuery({ uid, timestamp, limit }) {
  const date = new Date();
  const timeLocal = date.toISOString();
  const promise = API.graphql(graphqlOperation(
    getUserCommentsReceivedByTime,
    {
      GSI1: `COMMENT#${uid}`,
      SK: { between: [`#COMMENT#${timestamp}`, `#COMMENT#${timeLocal}`] },
      limit: limit || 200,
      sortDirection: 'DESC',
    },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error fetching recent comments: ';
  return { promise, getValue, errorMsg };
}

// Fetch all comment items for a specific post
function getPostCommentsNoDetailsQuery({ uid, timestamp }) {
  const PK = `POST#${timestamp}#${uid}`;
  const SK = '#COMMENT#';
  const promise = API.graphql(graphqlOperation(
    getPostCommentsNoDetails,
    { PK, SK: { beginsWith: SK } },
  ));
  const getValue = (res) => res.data.listFeastItems.items;
  const errorMsg = 'Error getting no details comments: ';
  return { promise, getValue, errorMsg };
}

// Fetch all banned users
function getBannedUsersQuery() {
  const promise = API.graphql(graphqlOperation(
    getBannedUsers,
    { GSI1: 'BANNEDUSER#', SK: { beginsWith: '#BAN#' }, limit: 200 },
  ));
  const getValue = (res) => res.data.itemsByGSI1.items;
  const errorMsg = 'Error fetching all banned users: ';
  return { promise, getValue, errorMsg };
}

export {
  fulfillPromise, getUserProfileQuery, getUserExpoPushTokenQuery, getUserPostQuery,
  getUserPostsQuery, getFollowingQuery, searchUsersQuery, searchPlacesQuery,
  getIsFollowingQuery, getPlaceInDBQuery, getFollowersQuery, getFollowersByTimeQuery,
  getNumFollowsQuery, getFollowingPostsQuery, getFollowingPostsDetailsQuery,
  getFollowingPostsByUserQuery, batchGetUserPostsQuery, getAllPostsQuery,
  getPlaceDetailsQuery, batchGetPlaceDetailsQuery, getPlaceFollowingUserReviewsQuery,
  getPlaceAllUserReviewsQuery, getUserAllSavedPostsQuery, getAllSavedPostItemsQuery,
  getPostYumsQuery, getUserYumsReceivedQuery, getUserYumsReceivedByTimeQuery, getUserEmailQuery,
  getPlaceRatingQuery, batchGetPlaceRatingsQuery, getPostNumCommentsQuery, getPostCommentsQuery,
  getUserCommentsReceivedByTimeQuery, getPostCommentsNoDetailsQuery, getBannedUsersQuery,
};
