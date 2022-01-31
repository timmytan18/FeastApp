// Map over categories and set each value to default 4
const DEFAULT_RATING = 4;
const RATING_CATEGORIES = ['overall', 'food', 'value', 'service', 'atmosphere'].reduce((k, v) => (k[v] = DEFAULT_RATING, k), {});

const SEARCH_TYPES = { NAME: 'name', PLACE: 'place' };

export { RATING_CATEGORIES, SEARCH_TYPES };
