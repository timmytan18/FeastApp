import {
  getBannedUsersQuery,
  fulfillPromise,
} from './queryFunctions';

const getBannedUsers = async (dispatch) => {
  const { promise, getValue, errorMsg } = getBannedUsersQuery();
  let bannedUsers = await fulfillPromise(promise, getValue, errorMsg);
  bannedUsers = bannedUsers.map((user) => user.uid);
  bannedUsers = new Set(bannedUsers);
  dispatch({
    type: 'SET_BANNED_USERS',
    payload: { bannedUsers },
  });
  return bannedUsers;
};

export default getBannedUsers;
