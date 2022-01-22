import PropTypes from 'prop-types';
import geohash from 'ngeohash';
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { getPlaceInDBQuery } from '../../api/functions/queryFunctions';

const Category = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
});

const Chain = PropTypes.shape({
  id: PropTypes.string,
  name: PropTypes.string,
});

const propTypes = {
  places: PropTypes.shape({
    categories: PropTypes.arrayOf(Category),
    chains: PropTypes.arrayOf(Chain),
    fsq_id: PropTypes.string,
    geocodes: PropTypes.shape({
      main: PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
      }),
    }),
    location: PropTypes.shape({
      locality: PropTypes.string, // city
      region: PropTypes.string, // state
      country: PropTypes.string,
      address: PropTypes.string,
      postcode: PropTypes.string,
    }),
    name: PropTypes.string,
  }).isRequired,
};

function scrapePlaceData(currItem) {
  // Destructure place attributes
  const {
    fsq_id: placeId,
    name,
    location: {
      locality: city,
      region, // state
      country,
      address,
      postcode,
    },
    geocodes: {
      main: {
        latitude: placeLat,
        longitude: placeLng,
      },
    },
    categories,
    chains,
  } = currItem;

  // Remove nonalphanumeric chars from name (spaces, punctionation, underscores, etc.)
  const strippedName = name.replace(/[^0-9a-z]/gi, '').toLowerCase();
  const hash = geohash.encode(placeLat, placeLng);

  (async function createPlaceItem() {
    const cognitoUser = await Auth.currentAuthenticatedUser();
    const token = cognitoUser.signInUserSession.idToken.jwtToken;
    const category = categories[0].name;
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
      category,
      chain: chains.length ? chains[0].name : '',
    };
    console.log(JSON.stringify(data));

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
      console.log('Could not run scraper', e);
    }
  }());
}

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const fetchPlaces = async ({ places }) => {
  await delay(30000); // wait 30 seconds

  const failedToFetch = [];
  places.forEach(async (item) => {
    const {
      fsq_id: placeId,
      name,
    } = item;

    const placePK = `PLACE#${placeId}`;
    // Remove nonalphanumeric chars from name (spaces, punctionation, underscores, etc.)
    const strippedName = name.replace(/[^0-9a-z]/gi, '').toLowerCase();
    const placeSK = `#INFO#${strippedName}`;
    try {
      const placeInDB = await getPlaceInDBQuery({ placePK });
      if (!placeInDB) {
        failedToFetch.push(item);
        console.log('Failed to fetch place: ', item.name, item.location.address, item.location.locality);
      }
    } catch (e) {
      console.log('Fetch Dynamo place data error', e);
    }
  });
};

function scrapeTest({ places }) {
  // Send data to Lambda to scrape
  try {
    places.forEach((item) => {
      console.log(item);
      scrapePlaceData(item);
    });
  } catch (e) {
    console.log('Error running scraper', e);
  }

  try {
    fetchPlaces({ places });
  } catch (e) {
    console.log('Error fetching places from DB', e);
  }
}

scrapeTest.propTypes = propTypes;

export default scrapeTest;
