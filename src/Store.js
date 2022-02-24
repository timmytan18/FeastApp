import React, { createContext, useReducer } from 'react';
import Reducer from './Reducer';
import { RATING_CATEGORIES } from './constants/constants';

const initialState = {
  user: null,
  reloadMapTrigger: false,
  review: null,
  ratings: { ...RATING_CATEGORIES },
  location: { longitude: null, latitude: null },
  savedPosts: new Set(),
  restaurants: [],
  headerHeight: null,
  error: null,
  deviceHeight: null,
};

const Store = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, initialState);
  return (
    <Context.Provider value={[state, dispatch]}>
      {children}
    </Context.Provider>
  );
};

export const Context = createContext(initialState);
export default Store;
