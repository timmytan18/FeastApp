/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getFeastItem = /* GraphQL */ `
  query GetFeastItem($PK: String!, $SK: String!) {
    getFeastItem(PK: $PK, SK: $SK) {
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
      grid
      coordinates {
        latitude
        longitude
      }
      placeType
      placeInfo {
        name
        priceLvl
        delivery
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
export const listFeastItems = /* GraphQL */ `
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByGSI1 = /* GraphQL */ `
  query ItemsByGSI1(
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByGSI2 = /* GraphQL */ `
  query ItemsByGSI2(
    $GSI2: String
    $SK: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByGSI2(
      GSI2: $GSI2
      SK: $SK
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByLSI1 = /* GraphQL */ `
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByLSI2 = /* GraphQL */ `
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByLSI3 = /* GraphQL */ `
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByLSI4 = /* GraphQL */ `
  query ItemsByLSI4(
    $PK: String
    $LSI4: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByLSI4(
      PK: $PK
      LSI4: $LSI4
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
export const itemsByLSI5 = /* GraphQL */ `
  query ItemsByLSI5(
    $PK: String
    $LSI5: ModelIntKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelFeastItemFilterInput
    $limit: Int
    $nextToken: String
  ) {
    itemsByLSI5(
      PK: $PK
      LSI5: $LSI5
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
        grid
        coordinates {
          latitude
          longitude
        }
        placeType
        placeInfo {
          name
          priceLvl
          delivery
          displayPhone
          placeUrl
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
      nextToken
    }
  }
`;
