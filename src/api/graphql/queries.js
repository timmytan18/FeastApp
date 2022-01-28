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

export const getUserReviews = /* GraphQL */ `
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
        review
        rating {
          overall
          food
          value
          service
          ambience
        }
        createdAt
      }
      nextToken
    }
  }
`;

export const getUserReviewsWithUserInfo = /* GraphQL */ `
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
        review
        rating {
          overall
          food
          value
          service
          ambience
        }
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

export const getPlaceInDBWithCategories = /* GraphQL */ `
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

// export const getBusiness = /* GraphQL */ `
//   query ListFeastItems(
//     $PK: String
//     $SK: ModelStringKeyConditionInput
//     $filter: ModelFeastItemFilterInput
//     $limit: Int
//     $nextToken: String
//     $sortDirection: ModelSortDirection
//   ) {
//     listFeastItems(
//       PK: $PK
//       SK: $SK
//       filter: $filter
//       limit: $limit
//       nextToken: $nextToken
//       sortDirection: $sortDirection
//     ) {
//       items {
//         PK
//         SK
//         GSI3
//         LSI4
//         city
//         bizId
//         bizCount
//         bizInfo {
//           name
//           priceLvl
//           delivery
//           displayPhone
//           bizUrl
//           description
//           menuUrl
//           imgUrl
//           phone
//           yelpAlias
//           categories
//           address {
//             addressRaw
//             address1
//             city
//             zip
//             state
//             country
//           }
//           coordinates {
//             latitude
//             longitude
//           }
//         }
//         bizType
//       }
//       nextToken
//     }
//   }
// `;

// export const getBusinessCountInGrid = /* GraphQL */ `
//   query GetFeastItem($PK: String!, $SK: String!) {
//     getFeastItem(PK: $PK, SK: $SK) {
//       bizCount
//     }
//   }
// `;

// export const getBusinessesByGrid = /* GraphQL */ `
//   query ItemsByGsi3(
//     $GSI3: String
//     $LSI4: ModelIntKeyConditionInput
//     $sortDirection: ModelSortDirection
//     $filter: ModelFeastItemFilterInput
//     $limit: Int
//     $nextToken: String
//   ) {
//     itemsByGSI3(
//       GSI3: $GSI3
//       LSI4: $LSI4
//       sortDirection: $sortDirection
//       filter: $filter
//       limit: $limit
//       nextToken: $nextToken
//     ) {
//       items {
//         PK
//         SK
//         GSI3
//         LSI4
//         city
//         bizId
//         bizCount
//         bizInfo {
//           name
//           priceLvl
//           delivery
//           displayPhone
//           bizUrl
//           description
//           menuUrl
//           imgUrl
//           phone
//           yelpAlias
//           categories
//           address {
//             addressRaw
//             address1
//             city
//             zip
//             state
//             country
//           }
//           coordinates {
//             latitude
//             longitude
//           }
//         }
//         bizType
//         reviews {
//           user
//           review
//         }
//       }
//       nextToken
//     }
//   }
// `;

// export const getReviews = /* GraphQL */ `
//   query GetFeastItem($PK: String!, $SK: String!) {
//     getFeastItem(PK: $PK, SK: $SK) {
//       reviews {
//         user
//         review
//         rating {
//           overall
//         }
//       }
//     }
//   }
// `;
