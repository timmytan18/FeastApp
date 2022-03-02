import AsyncStorage from '@react-native-async-storage/async-storage';

const localDataKeys = {
  SEEN_STORIES: 'SEEN_STORIES',
};

const getLocalData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.warn(`Error getting ${key} data:`, e);
  }
  return null;
};

const storeLocalData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    console.warn(`Error saving ${key} data:`, e);
  }
};

const mergeLocalData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.mergeItem(key, jsonValue);
  } catch (e) {
    console.warn(`Error merging ${key} data:`, e);
  }
};

const clearAllLocalData = async () => {
  try {
    await AsyncStorage.clear();
  } catch (e) {
    console.warn('Error clearing all local storage', e);
  }
};

export {
  getLocalData, storeLocalData, mergeLocalData, localDataKeys, clearAllLocalData,
};
