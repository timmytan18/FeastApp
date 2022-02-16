// Map over categories and set each value to default 4
const DEFAULT_RATING = 4;
const RATING_CATEGORIES = ['overall', 'food', 'value', 'service', 'atmosphere'].reduce((k, v) => (k[v] = DEFAULT_RATING, k), {});

const SEARCH_TYPES = { NAME: 'name', PLACE: 'place' };

const GEOHASH_PRECISION_AREAS = [
  2025.0, 63.28125, 1.9775390625, 0.061798095703125, parseFloat('0.0019311904907226562'), parseFloat('6.034970283508301e-05'),
  parseFloat('1.885928213596344e-06'), parseFloat('5.893525667488575e-08'), parseFloat('1.744670149253733e-09'), parseFloat('5.058365426240893e-11'),
];

export { RATING_CATEGORIES, SEARCH_TYPES, GEOHASH_PRECISION_AREAS };
