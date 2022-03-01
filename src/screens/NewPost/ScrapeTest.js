import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { getPlaceInDBQuery, fulfillPromise } from '../../api/functions/queryFunctions';

const propTypes = {
  places: PropTypes.shape({
    placeId: PropTypes.string,
    geocodePoints: PropTypes.arrayOf(
      PropTypes.shape({
        coordinates: PropTypes.arrayOf(PropTypes.number),
      }),
    ),
    Address: PropTypes.shape({
      locality: PropTypes.string, // city
      adminDistrict: PropTypes.string, // state
      countryRegion: PropTypes.string,
      addressLine: PropTypes.string,
      postalCode: PropTypes.string,
    }),
    name: PropTypes.string,
  }).isRequired,
};

function scrapePlaceData(currItem) {
  // Destructure place attributes
  const {
    placeId,
    name,
    Address: {
      locality: city, // city
      adminDistrict: region, // state
      countryRegion: country,
      addressLine: address,
      postalCode: postcode,
    },
    geocodePoints: [{ coordinates: [placeLat, placeLng] }],
  } = currItem;

  // Remove nonalphanumeric chars from name (spaces, punctionation, underscores, etc.)
  const strippedName = name.replace(/[^0-9a-z]/gi, '').toLowerCase();
  const hash = geohash.encode(placeLat, placeLng);

  (async function createPlaceItem() {
    const cognitoUser = await Auth.currentAuthenticatedUser();
    const token = cognitoUser.signInUserSession.idToken.jwtToken;
    const data = {
      placeId,
      geohash: hash,
      strippedName,
      name,
      address,
      city,
      region,
      zip: postcode,
      country,
    };

    try {
      await fetch('https://fyjcth1v7d.execute-api.us-east-2.amazonaws.com/dev/scraper', {
        method: 'PUT',
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('Error running scraper: ', e);
    }
  }());
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchPlaces = async ({ places }) => {
  await delay(20000); // wait 20 seconds

  const failedToFetch = [];
  places.forEach(async (item) => {
    const {
      placeId,
      name,
    } = item;

    const placePK = `PLACE#${placeId}`;
    // Remove nonalphanumeric chars from name (spaces, punctionation, underscores, etc.)
    const strippedName = name.replace(/[^0-9a-z]/gi, '').toLowerCase();
    try {
      const { promise, getValue, errorMsg } = getPlaceInDBQuery({ placePK });
      const placeInDB = await fulfillPromise(promise, getValue, errorMsg);
      if (!placeInDB) {
        failedToFetch.push(item);
        console.warn('Failed to fetch place: ', item.name, item.location.address, item.location.locality);
      }
    } catch (e) {
      console.warn('Error fetching DB place data: ', e);
    }
  });
};

function scrapeTest({ places }) {
  // Send data to Lambda to scrape
  try {
    places.forEach((item) => {
      scrapePlaceData(item);
    });
  } catch (e) {
    console.warn('Error running scraper: ', e);
  }

  try {
    fetchPlaces({ places });
  } catch (e) {
    console.warn('Error fetching places from DB: ', e);
  }
}

scrapeTest.propTypes = propTypes;

export default scrapeTest;
