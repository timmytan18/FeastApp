/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const incrementFeastItem = /* GraphQL */ `
  mutation IncrementFeastItem($input: IncrementFeastItemInput!) {
    incrementFeastItem(input: $input) {
      PK
      SK
      GSI1
      GSI2
      LSI1
      LSI2
      LSI3
      LSI4
      LSI5
      name
      uid
      identityId
      phone
      picture
      city
      numFollowers
      numFollowing
      follower {
        PK
        SK
        name
        uid
        identityId
        followedSK
        picture
      }
      placeId
      geo
      timestamp
      coordinates {
        latitude
        longitude
      }
      categories
      placeType
      imgUrl
      placeInfo {
        name
        priceLvl
        orderUrls
        displayPhone
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        menuUrl
        imgUrl
        phone
        yelpAlias
        categories
      }
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      dish
      rating {
        overall
        food
        value
        service
        atmosphere
      }
      review
      updatedAt
      createdAt
    }
  }
`;
export const batchCreateFollowingPosts = /* GraphQL */ `
  mutation BatchCreateFollowingPosts($input: BatchCreateFollowingPostsInput!) {
    batchCreateFollowingPosts(input: $input) {
      PK
      SK
      GSI1
      GSI2
      LSI1
      LSI2
      LSI3
      LSI4
      LSI5
      name
      uid
      identityId
      phone
      picture
      city
      numFollowers
      numFollowing
      follower {
        PK
        SK
        name
        uid
        identityId
        followedSK
        picture
      }
      placeId
      geo
      timestamp
      coordinates {
        latitude
        longitude
      }
      categories
      placeType
      imgUrl
      placeInfo {
        name
        priceLvl
        orderUrls
        displayPhone
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        menuUrl
        imgUrl
        phone
        yelpAlias
        categories
      }
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      dish
      rating {
        overall
        food
        value
        service
        atmosphere
      }
      review
      updatedAt
      createdAt
    }
  }
`;
export const batchDeleteFollowingPosts = /* GraphQL */ `
  mutation BatchDeleteFollowingPosts($input: BatchDeleteFollowingPostsInput!) {
    batchDeleteFollowingPosts(input: $input) {
      PK
      SK
      GSI1
      GSI2
      LSI1
      LSI2
      LSI3
      LSI4
      LSI5
      name
      uid
      identityId
      phone
      picture
      city
      numFollowers
      numFollowing
      follower {
        PK
        SK
        name
        uid
        identityId
        followedSK
        picture
      }
      placeId
      geo
      timestamp
      coordinates {
        latitude
        longitude
      }
      categories
      placeType
      imgUrl
      placeInfo {
        name
        priceLvl
        orderUrls
        displayPhone
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        menuUrl
        imgUrl
        phone
        yelpAlias
        categories
      }
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      dish
      rating {
        overall
        food
        value
        service
        atmosphere
      }
      review
      updatedAt
      createdAt
    }
  }
`;
export const createFeastItem = /* GraphQL */ `
  mutation CreateFeastItem(
    $input: CreateFeastItemInput!
    $condition: ModelFeastItemConditionInput
  ) {
    createFeastItem(input: $input, condition: $condition) {
      PK
      SK
      GSI1
      GSI2
      LSI1
      LSI2
      LSI3
      LSI4
      LSI5
      name
      uid
      identityId
      phone
      picture
      city
      numFollowers
      numFollowing
      follower {
        PK
        SK
        name
        uid
        identityId
        followedSK
        picture
      }
      placeId
      geo
      timestamp
      coordinates {
        latitude
        longitude
      }
      categories
      placeType
      imgUrl
      placeInfo {
        name
        priceLvl
        orderUrls
        displayPhone
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        menuUrl
        imgUrl
        phone
        yelpAlias
        categories
      }
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      dish
      rating {
        overall
        food
        value
        service
        atmosphere
      }
      review
      updatedAt
      createdAt
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
      SK
      GSI1
      GSI2
      LSI1
      LSI2
      LSI3
      LSI4
      LSI5
      name
      uid
      identityId
      phone
      picture
      city
      numFollowers
      numFollowing
      follower {
        PK
        SK
        name
        uid
        identityId
        followedSK
        picture
      }
      placeId
      geo
      timestamp
      coordinates {
        latitude
        longitude
      }
      categories
      placeType
      imgUrl
      placeInfo {
        name
        priceLvl
        orderUrls
        displayPhone
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        menuUrl
        imgUrl
        phone
        yelpAlias
        categories
      }
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      dish
      rating {
        overall
        food
        value
        service
        atmosphere
      }
      review
      updatedAt
      createdAt
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
      SK
      GSI1
      GSI2
      LSI1
      LSI2
      LSI3
      LSI4
      LSI5
      name
      uid
      identityId
      phone
      picture
      city
      numFollowers
      numFollowing
      follower {
        PK
        SK
        name
        uid
        identityId
        followedSK
        picture
      }
      placeId
      geo
      timestamp
      coordinates {
        latitude
        longitude
      }
      categories
      placeType
      imgUrl
      placeInfo {
        name
        priceLvl
        orderUrls
        displayPhone
        address
        placeUrl
        coordinates {
          latitude
          longitude
        }
        menuUrl
        imgUrl
        phone
        yelpAlias
        categories
      }
      placeUserInfo {
        uid
        name
        picture
        identityId
      }
      dish
      rating {
        overall
        food
        value
        service
        atmosphere
      }
      review
      updatedAt
      createdAt
    }
  }
`;
