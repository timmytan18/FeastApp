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
        default:
            return state;
    }
};

export default Reducer;