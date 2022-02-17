// Wrapper functions for GraphQL queries

import { API, graphqlOperation } from 'aws-amplify';
import {
  getUserProfile, getUserReviews, getUserReviewsWithUserInfo, getFollowing, searchUsers,
  getIsFollowing, getPlaceInDB, getPlaceInDBWithCategoriesAndPicture, getFollowers, getNumFollows,
  getFollowingPosts, getFollowingPostsByUser, getFollowersPK, batchGetUserPosts,
  getPlaceDetails,
} from '../graphql/queries';
import { SEARCH_TYPES } from '../../constants/constants';

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
async function getUserReviewsQuery({ PK, hash, withUserInfo }) {
  const SK = hash ? `#PLACE#${hash}` : '#PLACE#';
  let userReviews;
  try {
    const res = await API.graphql(graphqlOperation(
      withUserInfo ? getUserReviewsWithUserInfo : getUserReviews,
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

// Search for users or places by name
async function searchQuery({ name, type }) {
  let GSI1;
  let SK;
  switch (type) {
    case SEARCH_TYPES.NAME:
      SK = `#PROFILE#${name}`;
      GSI1 = 'USER#';
      break;
    case SEARCH_TYPES.PLACE:
      SK = `#INFO#${name}`;
      GSI1 = 'PLACE#';
      break;
    default:
      SK = `#PROFILE#${name}`;
      GSI1 = 'USER#';
  }
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
    const { categories, imgUrl } = placeInDB[0].placeInfo;
    return withCategoriesAndPicture ? {
      placeInDB: true, categoriesDB: categories, imgUrlDB: imgUrl,
    } : true;
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

export {
  getUserProfileQuery, getUserReviewsQuery, getFollowingQuery, searchQuery, getIsFollowingQuery,
  getPlaceInDBQuery, getFollowersQuery, getNumFollowsQuery, getFollowingPostsQuery,
  getFollowingPostsByUserQuery, batchGetUserPostsQuery, getPlaceDetailsQuery,
};
