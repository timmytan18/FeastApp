import PropTypes from 'prop-types';
import { API, graphqlOperation } from 'aws-amplify';
import geohash from 'ngeohash';
import { getPlaceInDBQuery } from './queryFunctions';
import FSCATEGORIES from '../../constants/FSCategories';
import coordinateDistance from './CoordinateDistance';
import config from '../../config';

const Category = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  icon: PropTypes.shape({
    prefix: PropTypes.string,
    suffix: PropTypes.string,
  }),
});

const PlaceItem = PropTypes.shape({
  categories: PropTypes.arrayOf(Category),
  distance: PropTypes.number,
  geocodes: PropTypes.shape({
    main: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
  }),
  location: PropTypes.shape({
    locality: PropTypes.string, // city
    address: PropTypes.string,
    postcode: PropTypes.string,
  }),
  name: PropTypes.string,
});

const propTypes = {
  results: PropTypes.arrayOf(PlaceItem).isRequired,
};

function compareTwoStrings(a, b, isAddress) {
  if (!a || !b) return 0;
  const first = a.replace(/\s+/g, '');
  const second = b.replace(/\s+/g, '');

  if (!first.length && !second.length) return 1; // if both are empty strings
  if (!first.length || !second.length) return 0; // if only one is empty string
  if (first === second) return 1; // identical
  if (first.length === 1 && second.length === 1) return 0; // both are 1-letter strings
  if (first.length < 2 || second.length < 2) return 0; // if either is a 1-letter string

  const firstBigrams = new Map();
  for (let i = 0; i < first.length - 1; i += 1) {
    const bigram = first.substring(i, i + 2);
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram) + 1
      : 1;

    firstBigrams.set(bigram, count);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i += 1) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.has(bigram)
      ? firstBigrams.get(bigram)
      : 0;

    if (count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize += 1;
    }
  }

  const score = (2.0 * intersectionSize) / (first.length + second.length - 2);

  if (score >= 0.7 && !isAddress) {
    return score;
  }
  const firstLower = first.toLowerCase();
  const secondLower = second.toLowerCase();
  if (firstLower.includes(secondLower) || secondLower.includes(firstLower)) {
    return isAddress ? 2 : 0.7;
  }
  return score;
}

// Group matches together using BFS with connected components
function groupMatches(matches) {
  const groups = [];
  const visited = new Set([]);
  Object.entries(matches).forEach(([key, value]) => {
    const res = new Set([]);
    const queue = [];
    value.forEach((item) => {
      if (!(visited.has(`${key},${item}`))) {
        queue.push([parseInt(key, 10), item]);
      }
    });
    while (queue.length) {
      const curr = queue.shift();
      const a = curr[0];
      const b = curr[1];
      const currStr = `${a},${b}`;
      if (!(visited.has(currStr))) {
        res.add(a);
        res.add(b);
        visited.add(currStr);
        visited.add(`${b},${a}`);
        matches[b].forEach((item) => {
          queue.push([b, item]);
        });
      }
    }
    if (res.size) {
      groups.push(res);
    }
  });
  return groups;
}

// Compare similarity of FS item data and Google Places item data
function compareToGooglePlaces(item, place) {
  const nameSim = compareTwoStrings(item.name, place.name, false);
  const [itemLat, itemLng] = item.geocodePoints[0].coordinates;
  const { lat: placeLat, lng: placeLng } = place.geometry.location;
  const dist = coordinateDistance(itemLat, itemLng, placeLat, placeLng);
  const distSim = dist === 0 ? 2 : 0.1 / dist;
  const itemAddress = item.Address.addressLine;
  const placeAddress = place.formatted_address;
  const addressSim = compareTwoStrings(itemAddress, placeAddress, true);

  const score = 0.5 * nameSim + 0.3 * Math.min(1, distSim) + 0.3 * addressSim;
  return score;
}

const GEOHASH_PRECISION = 12;

export default async function filterFSItems({ results }) {
  // Filter out places that aren't in dining and drinking categories and null items
  let items = [];
  results.forEach((item) => {
    if (item) {
      const [placeLat, placeLng] = item.geocodePoints[0].coordinates;
      const hash = geohash.encode(placeLat, placeLng, GEOHASH_PRECISION);
      item.placeId = hash;
      items.push(item);
    }
  });

  // let items = results;

  const matches = {};

  const wordsToRemove = 'restaurant|shop|store|place';

  // Extract string inside parentheses; concatenate strings outside parentheses
  function separateNameInOutParentheses(nameWithParen, parenStartInd) {
    const end = nameWithParen.lastIndexOf(')');
    const nameInsideParen = nameWithParen.slice(parenStartInd + 1, end).replace('aka ', '');
    const nameWithParenRemoved = nameWithParen.substring(0, parenStartInd)
      + nameWithParen.substring(end + 1);
    return { nameInsideParen, nameWithParenRemoved };
  }

  // Calculate similarity between every pair of items
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      // Check for invalid item/name
      if (!items[i] || !items[j] || !items[i].name || !items[j].name) {
        continue;
      }

      // If identical geohash, add to matches
      if (items[i].placeId === items[j].placeId) {
        if (matches[i]) {
          matches[i].push(j);
        } else {
          matches[i] = [j];
        }
        if (matches[j]) {
          matches[j].push(i);
        } else {
          matches[j] = [i];
        }
        continue;
      }

      // Reset similarity scores
      let nameSim = 0;
      let distSim = 0;
      let addressSim = 0;
      let sameCity = false;
      let sameZip = false;

      // Remove generic restaurant words (wordsToRemove) and extra spaces
      const nameA = items[i].name.replace(new RegExp(`\\b(${wordsToRemove})\\b`, 'gi'), ' ').trim().replace(/\s{2,}/g, ' ');
      const nameB = items[j].name.replace(new RegExp(`\\b(${wordsToRemove})\\b`, 'gi'), ' ').trim().replace(/\s{2,}/g, ' ');
      if (nameA && nameB) {
        const parenA = nameA.indexOf('(');
        const parenB = nameB.indexOf('(');
        // If only one of the names has parentheses, compare the name inside the parentheses
        if ((parenA === -1 && parenB !== -1) || (parenA !== -1 && parenB === -1)) {
          if (parenA === -1) {
            // eslint-disable-next-line max-len
            const { nameInsideParen, nameWithParenRemoved } = separateNameInOutParentheses(nameB, parenB);
            nameSim = Math.max(
              compareTwoStrings(nameA, nameWithParenRemoved, false),
              compareTwoStrings(nameA, nameInsideParen, false),
            );
          } else {
            // eslint-disable-next-line max-len
            const { nameInsideParen, nameWithParenRemoved } = separateNameInOutParentheses(nameA, parenA);
            nameSim = Math.max(
              compareTwoStrings(nameWithParenRemoved, nameB, false),
              compareTwoStrings(nameInsideParen, nameB, false),
            );
          }
        } else {
          nameSim = compareTwoStrings(nameA, nameB, false);
        }
      }

      if (nameSim >= 0.5) {
        // Calculate distance similarity use coordinates
        const [latA, lngA] = items[i].geocodePoints[0].coordinates;
        const [latB, lngB] = items[j].geocodePoints[0].coordinates;
        if (latA && lngA && latB && lngB) {
          const dist = coordinateDistance(latA, lngA, latB, lngB);
          distSim = dist === 0 ? 2 : 0.1 / dist;
        }
        // Calculate address similarity using address, city, and zip
        const { locality: localityA, postalCode: postcodeA } = items[i].Address;
        const { locality: localityB, postalCode: postcodeB } = items[j].Address;
        let addressA = items[i].Address.addressLine;
        let addressB = items[j].Address.addressLine;
        // If both addresses contain the city name after the first index, remove it from both
        if (addressA.toLowerCase().includes(localityA.toLowerCase(), 1)
          && addressB.toLowerCase().includes(localityB.toLowerCase(), 1)) {
          addressA = addressA.replace(localityA, '');
          addressB = addressB.replace(localityB, '');
        }
        if (addressA && addressB) {
          addressSim = compareTwoStrings(addressA, addressB, true);
        }
        if (localityA && localityB && localityA === localityB) {
          sameCity = true;
        } else if (distSim > 0.2) {
          distSim = 0.2;
        }
        if (postcodeA && postcodeB && postcodeA === postcodeB) {
          sameZip = true;
        } else if (distSim > 0.3) {
          distSim = 0.3;
        }

        const score = 0.5 * nameSim
          + 0.3 * distSim
          + 0.3 * addressSim
          + (sameCity ? 0.05 : 0)
          + (sameZip ? 0.15 : 0);

        // Add each item to the matches group of the other
        if (score > 0.8) {
          if (matches[i]) {
            matches[i].push(j);
          } else {
            matches[i] = [j];
          }
          if (matches[j]) {
            matches[j].push(i);
          } else {
            matches[j] = [i];
          }
        }
      }
    }
  }

  const groups = groupMatches(matches);

  if (groups.length) {
    for (let i = 0; i < groups.length; i += 1) {
      // If any item in group is in db, remove
      let removed = false;
      for (const a of groups[i].keys()) {
        const exists = await getPlaceInDBQuery({ placePK: `PLACE#${items[a].placeId}` });
        if (exists) {
          removed = true;
          groups[i].delete(a);
        }
      }

      // Remove duplicates by checking Google Places API
      if (groups[i].size && !removed) {
        // For every item in a group, call GPlaces API to find potential match
        const key = config.GOOGLE_GEO_API_KEY;
        const places = {};
        for (const a of groups[i].keys()) {
          const { name, point } = items[a];
          const [lat, lng] = point.coordinates;
          const request = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&fields=name,geometry,formatted_address,place_id&locationbias=point:${lat},${lng}&key=${key}`;
          const res = await fetch(request);
          let data = await res.json();
          data = data.candidates;
          data.forEach((place) => {
            places[place.place_id] = place;
          });
        }
        // If there are less potential matches than items in group, only
        // remove the ones that have the highest score from group as
        // items remaining in group are to be deleted
        if (Object.keys(places).length < groups[i].size) {
          const scores = [];
          for (const b in places) {
            let best = 0;
            let res = -1;
            for (const a of groups[i].keys()) {
              const score = compareToGooglePlaces(items[a], places[b]);
              if (score > best) {
                best = score;
                res = a;
              }
            }
            scores.push({ best, res });
          }
          // Sort by best scores
          scores.sort((a, b) => ((a.score > b.score) ? 1 : -1));
          // Remove items in group with highest scores that should be kept
          for (let j = 0; j < Object.keys(places).length; j += 1) {
            groups[i].delete(scores[j].res);
          }
        } else { // If there are the same or more potential matches than items in group,
          groups[i].clear(); // remove all items in group
        }
      }

      // Remove remaining places in group from overall items
      if (groups[i].size) {
        for (const a of groups[i].keys()) {
          items[a] = null;
        }
      }
    }
  }

  items = items.filter((n) => n);
  return items;
}

filterFSItems.propTypes = propTypes;

// async function filterFSItems({ results }) {
//   // Filter out places that aren't in dining and drinking categories and null items
//   const items = [];
//   results.forEach((item) => {
//     if (item && item.categories) {
//       for (let i = 0; i < item.categories.length; i += 1) {
//         if (item.categories[i].id in FSCATEGORIES) {
//           items.push(item);
//           break;
//         }
//       }
//     }
//   });
//   return items;
// }

// filterFSItems.propTypes = propTypes;

// export default filterFSItems;
