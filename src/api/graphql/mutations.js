/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createFeastItem = /* GraphQL */ `
  mutation CreateFeastItem(
    $input: CreateFeastItemInput!
    $condition: ModelFeastItemConditionInput
  ) {
    createFeastItem(input: $input, condition: $condition) {
      PK
    }
  }
`;
export const updateFeastItem = /* GraphQL */ `
  mutation UpdateFeastItem(
    $input: UpdateFeastItemInput!
    $condition: ModelFeastItemConditionInput
  ) {
    updateFeastItem(input: $input, condition: $condition) {
      PK
    }
  }
`;
export const deleteFeastItem = /* GraphQL */ `
  mutation DeleteFeastItem(
    $input: DeleteFeastItemInput!
    $condition: ModelFeastItemConditionInput
  ) {
    deleteFeastItem(input: $input, condition: $condition) {
      PK
    }
  }
`;
// Custom resolver for incrementing/decrementing follower and following counts
export const incrementFeastItem = /* GraphQL */ `
  mutation IncrementFeastItem($input: IncrementFeastItemInput!) {
    incrementFeastItem(input: $input) {
      PK
    }
  }
`;
// Custom resolver for batch creating posts in feed
// arbitrary return value
export const batchCreateFollowingPosts = /* GraphQL */ `
  mutation BatchCreateFollowingPosts($input: BatchCreateFollowingPostsInput!) {
    batchCreateFollowingPosts(input: $input) {
      placeId
    }
  }
`;
// Custom resolver for batch creating posts in feed
// arbitrary return value
export const batchDeleteFollowingPosts = /* GraphQL */ `
  mutation BatchDeleteFollowingPosts($input: BatchDeleteFollowingPostsInput!) {
    batchDeleteFollowingPosts(input: $input) {
      placeId
    }
  }
`;
