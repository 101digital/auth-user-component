import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to securely set data using AsyncStorage
export const setSecureData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, data);
    return true; // Successful
  } catch (error) {
    console.error('Error setting data in AsyncStorage:', error);
    return false; // Failed
  }
};

// Function to securely get data using AsyncStorage
export const getSecureData = async (key) => {
  try {
    const result = await AsyncStorage.getItem(key);
    if (result !== null) {
      return result; // Return the data
    }
    return null; // Data not found
  } catch (error) {
    console.error('Error getting data from AsyncStorage:', error);
    return null; // Failed
  }
};

// Function to securely remove data using AsyncStorage
export const removeToken = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true; // Successful
  } catch (error) {
    console.error('Error removing data from AsyncStorage:', error);
    return false; // Failed
  }
};
