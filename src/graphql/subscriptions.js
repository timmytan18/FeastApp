/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateFeastItem = /* GraphQL */ `
  subscription OnCreateFeastItem {
    onCreateFeastItem {
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
export const onUpdateFeastItem = /* GraphQL */ `
  subscription OnUpdateFeastItem {
    onUpdateFeastItem {
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
export const onDeleteFeastItem = /* GraphQL */ `
  subscription OnDeleteFeastItem {
    onDeleteFeastItem {
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
