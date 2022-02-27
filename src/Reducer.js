const Reducer = (state, action) => {
  switch (action.type) {
    case 'SET_DEVICE_HEIGHT':
      return {
        ...state,
        deviceHeight: action.payload,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'SET_LOCATION':
      return {
        ...state,
        location: {
          longitude: action.payload.longitude,
          latitude: action.payload.latitude,
        },
      };
    case 'SET_SAVED_POSTS':
      return {
        ...state,
        savedPosts: action.payload.savedPosts,
      };
    case 'SET_RELOAD_MAP':
      return {
        ...state,
        reloadMapTrigger: !state.reloadMapTrigger,
      };
    case 'SET_REVIEW_RATING':
      return {
        ...state,
        review: action.payload.review,
        rating: action.payload.rating,
      };
    default:
      return state;
  }
};

export default Reducer;
