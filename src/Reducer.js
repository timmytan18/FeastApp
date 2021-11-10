const Reducer = (state, action) => {
    switch (action.type) {
        case 'SET_USER':
            console.log(action.payload)
            return {
                ...state,
                user: action.payload
            };
        case 'SET_LOCATION':
            console.log(action.payload)
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