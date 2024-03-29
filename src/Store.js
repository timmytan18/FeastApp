import React, { createContext, useReducer } from 'react';
import Reducer from './Reducer';

const initialState = {
  user: null,
  review: null,
  rating: null,
  location: { longitude: null, latitude: null },
  savedPosts: new Set(),
  bannedUsers: new Set(),
  restaurants: [],
  headerHeight: null,
  error: null,
  deviceHeight: null,
  reloadMapTrigger: false,
  reloadProfileTrigger: false,
  reloadNumCommentsId: null,
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
