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

// Fetch user profile data
async function getUserProfileQuery({ PK, SK, uid }) {
  let userPK = PK;
  let userSK = SK;
  if (uid) {
    userPK = `USER#${uid}`;
    userSK = '#PROFILE#';
  }
  let user;
  try {
    const res = await API.graphql(
      graphqlOperation(getUserProfile, { PK: userPK, SK: { beginsWith: userSK } }),
    );
    user = res.data.listFeastItems.items[0];
  } catch (err) {
    console.warn('Error fetching user profile data: ', err);
  }
  return user;
}

// Fetch reviews for a user (all or with geohash)
// withUserInfo: true will fetch reviews with user info
async function getUserPostsQuery({ PK, hash, withUserInfo }) {
  const SK = hash ? `#PLACE#${hash}` : '#PLACE#';
  let userReviews;
  try {
    const res = await API.graphql(graphqlOperation(
      withUserInfo ? getUserPostsWithUserInfo : getUserPosts,
      {
        PK, SK: { beginsWith: SK }, limit: 50, sortDirection: 'DESC',
      },
    ));
    userReviews = res.data.listFeastItems.items;
  } catch (err) {
    console.warn('Error fetching user reviews: ', err);
  }
  return userReviews;
}

// Fetch users that current user is following
async function getFollowingQuery({ uid }) {
  let users;
  try {
    const res = await API.graphql(graphqlOperation(
      getFollowing,
      { GSI1: 'USER#', SK: { beginsWith: `#FOLLOWER#${uid}` }, limit: 200 },
    ));
    users = res.data.itemsByGSI1.items;
  } catch (err) {
    console.warn('Error fetching following users: ', err);
  }
  return users;
}

// Get whether I am following a user
async function getIsFollowingQuery({ currentPK, currentUID, myUID }) {
  let PK = currentPK;
  if (currentUID) {
    PK = `USER#${currentUID}`;
  }
  const followSK = `#FOLLOWER#${myUID}`;
  let isFollowing;
  try {
    const res = await API.graphql(graphqlOperation(
      getIsFollowing,
      { PK, SK: followSK },
    ));
    isFollowing = res.data.getFeastItem;
  } catch (err) {
    console.warn('Error getting following status: ', err);
  }
  return !!isFollowing;
}

// Fetch number of followers and following using getNumFollows query
async function getNumFollowsQuery({ PK, SK }) {
  let num = [0, 0];
  try {
    let res = await API.graphql(graphqlOperation(
      getNumFollows,
      { PK, SK },
    ));
    res = res.data.getFeastItem;
    num = [
      res.numFollowers >= 0 ? res.numFollowers : 0,
      res.numFollowing >= 0 ? res.numFollowing : 0,
    ];
  } catch (err) {
    console.warn('Error fetching num followers/following: ', err);
  }
  return num;
}

// Get followers/following list
async function getFollowersQuery({ PK, onlyReturnPKs }) {
  let users;
  try {
    const res = await API.graphql(graphqlOperation(
      onlyReturnPKs ? getFollowersPK : getFollowers,
      { PK, SK: { beginsWith: '#FOLLOWER#' }, limit: 200 },
    ));
    users = res.data.listFeastItems.items;
  } catch (err) {
    console.warn('Error getting followers/following list: ', err);
  }
  return users;
}

// Search for users by name
async function searchUsersQuery({ name }) {
  const GSI1 = 'USER#';
  const SK = `#PROFILE#${name}`;
  let searchResults;
  try {
    const res = await API.graphql(graphqlOperation(
      searchUsers,
      { GSI1, SK: { beginsWith: SK }, limit: 50 },
    ));
    searchResults = res.data.itemsByGSI1.items;
  } catch (err) {
    console.warn('Error searching for users: ', err);
  }
  return searchResults;
}

// Search for places by name
async function searchPlacesQuery({ name }) {
  const GSI2 = 'PLACE#';
  const LSI1 = `#NAME#${name}`;
  let searchResults;
  try {
    const res = await API.graphql(graphqlOperation(
      searchPlaces,
      { GSI2, LSI1: { beginsWith: LSI1 }, limit: 50 },
    ));
    searchResults = res.data.itemsByGSI2.items;
  } catch (err) {
    console.warn('Error searching for places: ', err);
  }
  return searchResults;
}

// Get whether place is in database
// If withCategoriesAndPicture, will also fetch categories and imgUrl
// and return { inDB, categories, imgUrl }
async function getPlaceInDBQuery({ placePK, withCategoriesAndPicture }) {
  const placeSK = '#INFO#';
  let placeInDB;
  try {
    const res = await API.graphql(graphqlOperation(
      withCategoriesAndPicture ? getPlaceInDBWithCategoriesAndPicture : getPlaceInDB,
      { PK: placePK, SK: { beginsWith: placeSK }, limit: 10 },
    ));
    placeInDB = res.data.listFeastItems.items;
  } catch (err) {
    console.warn('Error checking whether place in DB: ', err);
  }
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
}

// Get all posts in feed from following
async function getFollowingPostsQuery({ PK }) {
  let posts;
  try {
    const res = await API.graphql(graphqlOperation(
      getFollowingPosts,
      {
        PK,
        SK: { beginsWith: '#FOLLOWINGPOST#' },
        sortDirection: 'DESC',
        limit: 1000,
      },
    ));
    posts = res.data.listFeastItems.items;
  } catch (err) {
    console.warn('Error getting followers/following list: ', err);
  }
  return posts;
}

// Get all posts in feed from a following user
// Used to delete a user's posts from feed
async function getFollowingPostsByUserQuery({ PK, followingUID }) {
  let posts;
  try {
    const res = await API.graphql(graphqlOperation(
      getFollowingPostsByUser,
      { PK, LSI3: { eq: `#FOLLOWINGPOST#${followingUID}` }, limit: 500 },
    ));
    posts = res.data.itemsByLSI3.items;
  } catch (err) {
    console.warn('Error getting followers/following list: ', err);
  }
  return posts;
}

// Batch get post details (get posts for specific place for stories)
async function batchGetUserPostsQuery({ batch }) {
  let posts;
  try {
    const res = await API.graphql(graphqlOperation(
      batchGetUserPosts,
      { input: { items: batch } },
    ));
    posts = res.data.batchGetFeastItems;
  } catch (err) {
    console.warn('Error batch getting user posts: ', err);
  }
  return posts;
}

// Get details about a place
async function getPlaceDetailsQuery({ placeId }) {
  let place;
  try {
    const res = await API.graphql(graphqlOperation(
      getPlaceDetails,
      { PK: `PLACE#${placeId}`, SK: { beginsWith: '#INFO#' }, limit: 1 },
    ));
    place = res.data.listFeastItems.items[0];
  } catch (err) {
    console.warn('Error getting place details: ', err);
  }
  return place;
}

// Batch get details about a place
async function batchGetPlaceDetailsQuery({ batch }) {
  let places;
  try {
    const res = await API.graphql(graphqlOperation(
      batchGetPlaceDetails,
      { input: { items: batch } },
    ));
    places = res.data.batchGetFeastItems;
  } catch (err) {
    console.warn('Error batch getting place details: ', err);
  }
  return places;
}

// Fetch reviews for a place from following users
async function getPlaceFollowingUserReviewsQuery({
  myUID, placeId, limit, currNextToken,
}) {
  let userReviews;
  let nextToken;
  try {
    const res = await API.graphql(graphqlOperation(
      getPlaceFollowingUserReviews,
      {
        PK: `USER#${myUID}`,
        LSI2: { beginsWith: `#FOLLOWINGPOST#${placeId}` },
        limit: limit || 20,
        sortDirection: 'DESC',
        nextToken: currNextToken,
      },
    ));
    userReviews = res.data.itemsByLSI2.items;
    nextToken = res.data.itemsByLSI2.nextToken;
  } catch (err) {
    console.warn('Error fetching place following user reviews: ', err);
  }
  return { userReviews, nextToken };
}

// Fetch reviews for a place from all users
async function getPlaceAllUserReviewsQuery({ placeId, limit, currNextToken }) {
  const GSI1 = `POST#${placeId}`;
  const SK = '#PLACE#';
  let userReviews;
  let nextToken;
  try {
    const res = await API.graphql(graphqlOperation(
      getPlaceAllUserReviews,
      {
        GSI1,
        SK: { beginsWith: SK },
        limit: limit || 20,
        sortDirection: 'DESC',
        nextToken: currNextToken,
      },
    ));
    userReviews = res.data.itemsByGSI1.items;
    nextToken = res.data.itemsByGSI1.nextToken;
  } catch (err) {
    console.warn('Error fetching place all user reviews: ', err);
  }
  return { userReviews, nextToken };
}

// Fetch all of a user's saved posts
async function getUserAllSavedPostsQuery({ PK, noDetails }) {
  let posts;
  try {
    const res = await API.graphql(graphqlOperation(
      noDetails ? getUserAllSavedPostsNoDetails : getUserAllSavedPosts,
      {
        PK,
        SK: { beginsWith: '#SAVEDPOST#' },
        sortDirection: 'DESC',
        limit: 200,
      },
    ));
    posts = res.data.listFeastItems.items;
  } catch (err) {
    console.warn('Error getting all saved posts: ', err);
  }
  return posts;
}

// Fetch all saved post items for a specific post (across all users)
async function getAllSavedPostItemsQuery({ uid, timestamp }) {
  let savedPosts;
  try {
    const res = await API.graphql(graphqlOperation(
      getAllSavedPostItems,
      { GSI1: 'SAVEDPOST#', SK: { eq: `#SAVEDPOST#${timestamp}#${uid}` }, limit: 200 },
    ));
    savedPosts = res.data.itemsByGSI1.items;
  } catch (err) {
    console.warn('Error fetching all saved post items for post: ', err);
  }
  return savedPosts;
}

// Fetch all yum items for a specific post
async function getPostYumsQuery({ uid, timestamp, noDetails }) {
  let yums;
  const GSI1 = `YUMPOST#${uid}`;
  const SK = `#YUMPOST#${timestamp}#${uid}`;
  try {
    const res = await API.graphql(graphqlOperation(
      noDetails ? getPostYumsNoDetails : getPostYums,
      {
        GSI1,
        SK: { eq: SK },
        limit: 500,
      },
    ));
    yums = res.data.itemsByGSI1.items;
  } catch (err) {
    console.warn('Error fetching all yum items for post: ', err);
  }
  return yums;
}

// Fetch all yums received for a specific user
async function getUserYumsReceivedQuery({ uid }) {
  let yums;
  const GSI1 = `YUMPOST#${uid}`;
  const SK = '#YUMPOST#';
  try {
    const res = await API.graphql(graphqlOperation(
      getUserYumsReceived,
      {
        GSI1,
        SK: { beginsWith: SK },
        limit: 1000,
      },
    ));
    yums = res.data.itemsByGSI1.items;
  } catch (err) {
    console.warn('Error fetching all received yum items for user: ', err);
  }
  return yums;
}

// Fetch user email
async function getUserEmailQuery({ uid }) {
  const userPK = `USER#${uid}`;
  const userSK = '#PROFILE#';
  let email;
  try {
    const res = await API.graphql(
      graphqlOperation(getUserEmail, { PK: userPK, SK: { beginsWith: userSK } }),
    );
    email = res.data.listFeastItems.items[0].email;
  } catch (err) {
    console.warn('Error fetching user email: ', err);
  }
  return email;
}

// Fetch place average rating
async function getPlaceRatingQuery({ placeId }) {
  let rating;
  try {
    const res = await API.graphql(
      graphqlOperation(getPlaceRating, { PK: `PLACE#${placeId}`, SK: '#RATING' }),
    );
    const { count, sum } = res.data.getFeastItem;
    if (count > 0 && count != null && sum != null) {
      rating = { count, sum };
    }
  } catch (err) {
    console.warn('Error fetching place rating: ', err);
  }
  return rating;
}

// Batch get places average ratings
async function batchGetPlaceRatingsQuery({ batch }) {
  let ratings;
  try {
    const res = await API.graphql(graphqlOperation(
      batchGetPlaceRatings,
      { input: { items: batch } },
    ));
    ratings = res.data.batchGetFeastItems;
  } catch (err) {
    console.warn('Error batch getting place ratings: ', err);
  }
  return ratings;
}

export {
  getUserProfileQuery, getUserPostsQuery, getFollowingQuery, searchUsersQuery, searchPlacesQuery,
  getIsFollowingQuery, getPlaceInDBQuery, getFollowersQuery, getNumFollowsQuery,
  getFollowingPostsQuery, getFollowingPostsByUserQuery, batchGetUserPostsQuery,
  getPlaceDetailsQuery, batchGetPlaceDetailsQuery, getPlaceFollowingUserReviewsQuery,
  getPlaceAllUserReviewsQuery, getUserAllSavedPostsQuery, getAllSavedPostItemsQuery,
  getPostYumsQuery, getUserYumsReceivedQuery, getUserEmailQuery, getPlaceRatingQuery,
  batchGetPlaceRatingsQuery,
};
