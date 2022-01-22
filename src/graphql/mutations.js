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
      coordinates {
        latitude
        longitude
      }
      placeType
      placeInfo {
        name
        priceLvl
        orderUrl
        displayPhone
        address {
          addressRaw
          address1
          city
          zip
          state
          country
        }
        placeUrl
        coordinates {
          latitude
          longitude
        }
        description
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
      }
      rating {
        overall
        food
        value
        service
        ambience
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
      coordinates {
        latitude
        longitude
      }
      placeType
      placeInfo {
        name
        priceLvl
        orderUrl
        displayPhone
        address {
          addressRaw
          address1
          city
          zip
          state
          country
        }
        placeUrl
        coordinates {
          latitude
          longitude
        }
        description
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
      }
      rating {
        overall
        food
        value
        service
        ambience
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
      coordinates {
        latitude
        longitude
      }
      placeType
      placeInfo {
        name
        priceLvl
        orderUrl
        displayPhone
        address {
          addressRaw
          address1
          city
          zip
          state
          country
        }
        placeUrl
        coordinates {
          latitude
          longitude
        }
        description
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
      }
      rating {
        overall
        food
        value
        service
        ambience
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
      coordinates {
        latitude
        longitude
      }
      placeType
      placeInfo {
        name
        priceLvl
        orderUrl
        displayPhone
        address {
          addressRaw
          address1
          city
          zip
          state
          country
        }
        placeUrl
        coordinates {
          latitude
          longitude
        }
        description
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
      }
      rating {
        overall
        food
        value
        service
        ambience
      }
      review
      updatedAt
      createdAt
    }
  }
`;
