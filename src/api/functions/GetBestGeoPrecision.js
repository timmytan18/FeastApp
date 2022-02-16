import { GEOHASH_PRECISION_AREAS } from '../../constants/constants';

const getBestGeoPrecision = ({ area }) => {
  let bestPrecision = 9;
  for (let i = 0; i < GEOHASH_PRECISION_AREAS.length; i += 1) {
    if (area / GEOHASH_PRECISION_AREAS[i] > 5) {
      if (i + 1 < GEOHASH_PRECISION_AREAS.length && area / GEOHASH_PRECISION_AREAS[i + 1] < 100) {
        bestPrecision = i + 2;
      } else {
        bestPrecision = i + 1;
      }
      break;
    }
  }
  return bestPrecision;
};

export default getBestGeoPrecision;
