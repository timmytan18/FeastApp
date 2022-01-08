
// Map over categories and set each value to default 4
const DEFAULT_RATING = 4;
const RATING_CATEGORIES = 
    ['overall', 'food', 'value', 'service', 'ambience'].reduce((k,v)=> (k[v]=DEFAULT_RATING, k), {});

export { RATING_CATEGORIES };