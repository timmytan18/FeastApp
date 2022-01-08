import React, { createContext, useReducer } from 'react';
import Reducer from './Reducer';
import { RATING_CATEGORIES } from './constants/constants';

const initialState = {
    user: null,
    review: null,
    ratings: Object.assign({}, RATING_CATEGORIES),
    location: null,
    restaurants: [],
    headerHeight: null,
    error: null
};

const Store = ({ children }) => {
    const [state, dispatch] = useReducer(Reducer, initialState);
    return (
        <Context.Provider value={[state, dispatch]}>
            {children}
        </Context.Provider>
    )
};

export const Context = createContext(initialState);
export default Store;