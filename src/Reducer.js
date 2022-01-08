const Reducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            return {
                ...state,
                user: action.payload
            };
        case 'SET_LOCATION':
            return {
                ...state,
                location: {
                    longitude: action.payload.longitude,
                    latitude: action.payload.latitude
                }
            }
        case 'SET_REVIEW_RATINGS':
            return {
                ...state,
                review: action.payload.review,
                ratings: action.payload.ratings
            }
        default:
            return state;
    }
};

export default Reducer;