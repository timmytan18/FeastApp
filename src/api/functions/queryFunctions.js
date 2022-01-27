// Wrapper functions for GraphQL queries

import { API, graphqlOperation } from 'aws-amplify';
import {
  getUserProfile, getUserReviews, getUserReviewsWithUserInfo, getFollowing, searchUsers,
  getIsFollowing, getPlaceInDB, getPlaceInDBWithCategories, getFollowers, getNumFollows,
  getFollowingPosts,
} from '../graphql/queries';
import { SEARCH_TYPES } from '../../constants/constants';

// Fetch user profile data
async function getUserProfileQuery({ PK, SK }) {
  let user;
  try {
    const res = await API.graphql(
      graphqlOperation(getUserProfile, { PK, SK: { beginsWith: SK } }),
    );
    user = res.data.listFeastItems.items[0];
  } catch (err) {
    console.log('Error fetching user profile data: ', err);
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
      { PK, SK: { beginsWith: SK }, limit: 50 },
    ));
    userReviews = res.data.listFeastItems.items;
  } catch (err) {
    console.log('Error fetching user reviews: ', err);
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
    console.log('Error fetching following users: ', err);
  }
  return users;
}

// Get whether I am following a user
async function getIsFollowingQuery({ currentPK, myUID }) {
  const followSK = `#FOLLOWER#${myUID}`;
  let isFollowing;
  try {
    const res = await API.graphql(graphqlOperation(
      getIsFollowing,
      { PK: currentPK, SK: followSK },
    ));
    isFollowing = res.data.getFeastItem;
  } catch (err) {
    console.log('Error getting following status: ', err);
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
    num = [res.numFollowers, res.numFollowing];
  } catch (err) {
    console.log(err);
  }
  return num;
}

// Get followers/following list
async function getFollowersQuery({ PK }) {
  let users;
  try {
    const res = await API.graphql(graphqlOperation(
      getFollowers,
      { PK, SK: { beginsWith: '#FOLLOWER#' }, limit: 200 },
    ));
    users = res.data.listFeastItems.items;
  } catch (err) {
    console.log('Error getting followers/following list: ', err);
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
    console.log('Error searching for users: ', err);
  }
  return searchResults;
}

// Get whether place is in database
// If withCategories, will also fetch categories and return { inDB, categories }
async function getPlaceInDBQuery({ placePK, withCategories }) {
  const placeSK = '#INFO#';
  let placeInDB;
  try {
    const res = await API.graphql(graphqlOperation(
      withCategories ? getPlaceInDBWithCategories : getPlaceInDB,
      { PK: placePK, SK: { beginsWith: placeSK }, limit: 10 },
    ));
    placeInDB = res.data.listFeastItems.items;
  } catch (err) {
    console.log('Error checking whether place in DB: ', err);
  }
  if (placeInDB.length) {
    return withCategories ? {
      placeInDB: true, categoriesDB: placeInDB[0].placeInfo.categories,
    } : true;
  }
  return false;
}

// Get followers/following list
async function getFollowingPostsQuery({ PK }) {
  let posts;
  try {
    const res = await API.graphql(graphqlOperation(
      getFollowingPosts,
      { PK, SK: { beginsWith: '#FOLLOWINGPOST#' }, limit: 500 },
    ));
    posts = res.data.listFeastItems.items;
  } catch (err) {
    console.log('Error getting followers/following list: ', err);
  }
  return posts;
}

export {
  getUserProfileQuery, getUserReviewsQuery, getFollowingQuery, searchQuery, getIsFollowingQuery,
  getPlaceInDBQuery, getFollowersQuery, getNumFollowsQuery, getFollowingPostsQuery,
};
