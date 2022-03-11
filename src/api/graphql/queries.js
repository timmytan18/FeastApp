export const searchUsers = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
        name
        uid
        picture
        identityId
        city
      }
      nextToken
    }
  }
`;

export const searchPlaces = /* GraphQL */ `
  query ItemsByGSI2(
    $GSI2: String
    $LSI1: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI2(
      GSI2: $GSI2
      LSI1: $LSI1
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        name
        placeId
        city
        placeInfo {
          imgUrl
        }
      }
      nextToken
    }
  }
`;

export const getUserProfile = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        uid
        name
        picture
        identityId
        city
      }
      nextToken
    }
  }
`;

export const getUserEmail = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        email
      }
      nextToken
    }
  }
`;

export const getIsFollowing = /* GraphQL */ `
  query GetFeastItem($PK: String!, $SK: String!) {
    getFeastItem(PK: $PK, SK: $SK) {
      PK
    }
  }
`;

export const getFollowers = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        follower {
          PK
          SK
          name
          picture
          uid
        }
        updatedAt
      }
      nextToken
    }
  }
`;

export const getFollowersByTime = /* GraphQL */ `
  query ItemsByLSI1(
    $PK: String
    $LSI1: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByLSI1(
      PK: $PK
      LSI1: $LSI1
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        follower {
          PK
          SK
          name
          picture
          uid
        }
        updatedAt
      }
      nextToken
    }
  }
`;

export const getFollowersPK = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        follower {
          PK
        }
      }
      nextToken
    }
  }
`;

export const getFollowing = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
        name
        identityId
        picture
        uid
        follower {
          followedSK
        }
        updatedAt
      }
      nextToken
    }
  }
`;

export const getFollowingPK = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        uid
      }
      nextToken
    }
  }
`;

export const getNumFollows = /* GraphQL */ `
  query GetFeastItem($PK: String!, $SK: String!) {
    getFeastItem(PK: $PK, SK: $SK) {
      numFollowers
      numFollowing
    }
  }
`;

export const getUserPosts = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        name
        placeId
        geo
        timestamp
        categories
        picture
        imgUrl
        dish
        review
        rating
      }
      nextToken
    }
  }
`;

export const getUserPostsWithUserInfo = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        name
        placeId
        geo
        timestamp
        categories
        picture
        imgUrl
        dish
        review
        rating
        placeUserInfo {
          uid
          name
          picture
        }
      }
      nextToken
    }
  }
`;

export const getPlaceInDB = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
      }
      nextToken
    }
  }
`;

export const getPlaceInDBWithCategoriesAndPicture = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        placeInfo {
          categories
          imgUrl
        }
      }
      nextToken
    }
  }
`;

export const getFollowingPosts = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        placeId
        name
        geo
        categories
        placeUserInfo {
          uid
          name
          picture
        }
      }
      nextToken
    }
  }
`;

export const getFollowingPostsDetails = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        placeId
        name
        timestamp
        dish
        rating
        review
        picture
        geo
        categories
        imgUrl
        placeUserInfo {
          uid
          name
          picture
          identityId
        }
      }
      nextToken
    }
  }
`;

export const getFollowingPostsByUser = /* GraphQL */ `
  query ItemsByLSI3(
    $PK: String
    $LSI3: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByLSI3(
      PK: $PK
      LSI3: $LSI3
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
      }
      nextToken
    }
  }
`;

export const batchGetUserPosts = /* GraphQL */ `
  query BatchGetFeastItems($input: BatchGetFeastItemsInput!) {
    batchGetFeastItems(input: $input) {
      SK
      name
      picture
      placeId
      dish
      rating
      review
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      timestamp
    }
  }
`;

export const getPlaceDetails = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        placeId
        name
        geo
        placeInfo {
          priceLvl
          orderUrls
          address
          placeUrl
          coordinates {
            latitude
            longitude
          }
          imgUrl
          phone
          menuUrl
          categories
          yelpAlias
        }
      }
      nextToken
    }
  }
`;

export const batchGetPlaceDetails = /* GraphQL */ `
  query BatchGetFeastItems($input: BatchGetFeastItemsInput!) {
    batchGetFeastItems(input: $input) {
      PK
      SK
      placeId
      name
      geo
      placeInfo {
        priceLvl
        orderUrls
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        imgUrl
        phone
        menuUrl
        categories
        yelpAlias
      }
    }
  }
`;

export const getPlaceFollowingUserReviews = /* GraphQL */ `
  query ItemsByLSI2(
    $PK: String
    $LSI2: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByLSI2(
      PK: $PK
      LSI2: $LSI2
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
        placeId
        name
        rating
        review
        placeUserInfo {
          uid
          name
          picture
        }
      }
      nextToken
    }
  }
`;

export const getPlaceAllUserReviews = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
        placeId
        name
        rating
        review
        placeUserInfo {
          uid
          name
          picture
        }
      }
      nextToken
    }
  }
`;

export const getUserAllSavedPosts = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        PK
        SK
        name
        placeId
        geo
        timestamp
        categories
        picture
        dish
        review
        imgUrl
        rating
        placeUserInfo {
          uid
          name
          picture
          identityId
        }
        updatedAt
      }
      nextToken
    }
  }
`;

export const getUserAllSavedPostsNoDetails = /* GraphQL */ `
  query ListFeastItems(
    $PK: String
    $SK: ModelStringKeyConditionInput
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listFeastItems(
      PK: $PK
      SK: $SK
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        timestamp
        placeUserInfo {
          uid
        }
      }
      nextToken
    }
  }
`;

export const getAllSavedPostItems = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
      }
      nextToken
    }
  }
`;

export const getPostYums = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
        placeId
        uid
        name
        picture
      }
      nextToken
    }
  }
`;

export const getPostYumsNoDetails = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        PK
        SK
      }
      nextToken
    }
  }
`;

export const getUserYumsReceived = /* GraphQL */ `
  query ItemsByGsi1(
    $GSI1: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI1(
      GSI1: $GSI1
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        placeId
      }
      nextToken
    }
  }
`;

export const getUserYumsReceivedByTime = /* GraphQL */ `
  query ItemsByGSI2(
    $GSI2: String
    $LSI1: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI2(
      GSI2: $GSI2
      LSI1: $LSI1
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        placeId
        timestamp
        uid
        name
        picture
        imgUrl
        updatedAt
      }
      nextToken
    }
  }
`;

export const getPlaceRating = /* GraphQL */ `
  query GetFeastItem($PK: String!, $SK: String!) {
    getFeastItem(PK: $PK, SK: $SK) {
      count
      sum
    }
  }
`;

export const batchGetPlaceRatings = /* GraphQL */ `
  query BatchGetFeastItems($input: BatchGetFeastItemsInput!) {
    batchGetFeastItems(input: $input) {
      placeId
      count
      sum
    }
  }
`;
