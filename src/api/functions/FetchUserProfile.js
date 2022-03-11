import {
  getUserProfileQuery,
  getIsFollowingQuery,
  fulfillPromise,
} from './queryFunctions';

const fetchCurrentUser = async ({
  currentPK, currentSK, currentProfilePic, myUID, myPK,
}) => {
  try {
    const { promise, getValue, errorMsg } = getUserProfileQuery({ PK: currentPK, SK: currentSK });
    const currentUser = await fulfillPromise(promise, getValue, errorMsg);
    currentUser.PK = currentPK;
    currentUser.SK = currentSK;
    currentUser.picture = currentProfilePic;
    // Check if I am following the current user
    if (currentPK !== myPK) {
      const {
        promise: isFollowingPromise,
        getValue: getIsFollowingValue,
        errorMsg: isFollowingErrorMsg,
      } = getIsFollowingQuery({ currentPK, myUID });
      currentUser.following = await fulfillPromise(
        isFollowingPromise,
        getIsFollowingValue,
        isFollowingErrorMsg,
      );
    }
    return currentUser;
  } catch (err) {
    console.warn('Error fetching current user: ', err);
    return null;
  }
};

const fetchCurrentUserUID = async ({ fetchUID, myUID }) => {
  try {
    const { promise, getValue, errorMsg } = getUserProfileQuery({ uid: fetchUID });
    const currentUser = await fulfillPromise(promise, getValue, errorMsg);
    // Check if I am following the current user
    if (currentUser.uid !== myUID) {
      const {
        promise: isFollowingPromise,
        getValue: getIsFollowingValue,
        errorMsg: isFollowingErrorMsg,
      } = getIsFollowingQuery({ currentUID: fetchUID, myUID });
      currentUser.following = await fulfillPromise(
        isFollowingPromise,
        getIsFollowingValue,
        isFollowingErrorMsg,
      );
    }
    return currentUser;
  } catch (err) {
    console.warn('Error fetching current user: ', err);
    return null;
  }
};

export { fetchCurrentUser, fetchCurrentUserUID };
