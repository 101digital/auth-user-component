import { Profile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
const REFRESH_TOKEN_KEY = 'authcomponent.refreshToken';
const ACCESS_TOKEN_KEY = 'authcomponent.accessToken';
const ORG_TOKEN_KEY = 'authcomponent.orgToken';
const PROFILE_KEY = 'authcomponent.profile';

class AuthComponentStore {
  storeRefreshToken = (refreshToken: string) =>
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  storeAccessToken = (accessToken: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  storeOrgToken = (orgToken: string) => AsyncStorage.setItem(ORG_TOKEN_KEY, orgToken);

  getOrgToken = () => AsyncStorage.getItem(ORG_TOKEN_KEY);

  storeProfile = (profile: Profile) => AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  getProfile = async () => {
    try {
      const value = await AsyncStorage.getItem(PROFILE_KEY);
      return value ? JSON.parse(value) : undefined;
    } catch (_) {
      return undefined;
    }
  };

  clearAuths = async () => {
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(ORG_TOKEN_KEY);
    await AsyncStorage.removeItem(PROFILE_KEY);
  };
}

const instance = new AuthComponentStore();
export default instance;
