// Wrapper functions for GraphQL queries

import { API, graphqlOperation } from 'aws-amplify';
import { getUserProfileReviews } from '../graphql/queries';

// Fetch reviews for current user using getUserProfileReviews query
async function getUserReviews({ PK }) {
  const SK = '#PLACE#';
  let userReviews;
  try {
    userReviews = await API.graphql(graphqlOperation(
      getUserProfileReviews,
      { PK, SK: { beginsWith: SK }, limit: 50 },
    ));
    userReviews = userReviews.data.listFeastItems.items;
  } catch (err) {
    console.log('Error fetching user reviews: ', err);
  }
  return userReviews;
}

export { getUserReviews };
