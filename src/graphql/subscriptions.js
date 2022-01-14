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
      imgUrl
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
      imgUrl
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
      imgUrl
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
