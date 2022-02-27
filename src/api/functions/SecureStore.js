import * as SecureStore from 'expo-secure-store';

const keys = {
  BING_KEY: 'BING_KEY',
  GOOGLE_KEY: 'GOOGLE_KEY',
};

async function secureSave(key, value) {
  await SecureStore.setItemAsync(key, value);
}

async function getSecureValue(key) {
  const value = await SecureStore.getItemAsync(key);
  return value || null;
}

async function deleteSecureValue(key) {
  await SecureStore.deleteItemAsync(key);
}

export {
  secureSave, getSecureValue, deleteSecureValue, keys,
};
