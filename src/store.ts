import AsyncStorage from '@react-native-community/async-storage';

const REFRESH_TOKEN_KEY = 'refreshToken';
const ACCESS_TOKEN_KEY = 'accessToken';
const ORG_TOKEN_KEY = 'orgToken';

class AuthComponentStore {
  storeRefreshToken = (refreshToken: string) =>
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  storeAccessToken = (accessToken: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  storeOrgToken = (orgToken: string) => AsyncStorage.setItem(ORG_TOKEN_KEY, orgToken);

  getOrgToken = () => AsyncStorage.getItem(ORG_TOKEN_KEY);

  clearTokens = async () => {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(ORG_TOKEN_KEY);
  };
}

const instance = new AuthComponentStore();
export default instance;
