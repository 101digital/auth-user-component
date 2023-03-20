import { Profile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AESCryptoStore from './aes-crypto';
import Aes from 'react-native-aes-crypto';

const REFRESH_TOKEN_KEY = 'authcomponent.refreshToken';
const ACCESS_TOKEN_KEY = 'authcomponent.accessToken';
const ORG_TOKEN_KEY = 'authcomponent.orgToken';
const PROFILE_KEY = 'authcomponent.profile';
const LOGIN_TOKEN_HINT = 'authcomponent.loginTokenHint';

class AuthComponentStore {
  storeRefreshToken = (refreshToken: string) =>
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  storeAccessToken = (accessToken: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  storeOrgToken = (orgToken: string) => AsyncStorage.setItem(ORG_TOKEN_KEY, orgToken);

  getOrgToken = () => AsyncStorage.getItem(ORG_TOKEN_KEY);

  storeProfile = (profile: Profile) => AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  storeLoginTokenHint = async (hint: string) => {
    console.log('storeLoginTokenHint -> hint', hint);
    try {
      const key = await AESCryptoStore.generateKey(hint, 'salt', 5000, 256);
      console.log('Key:', key);

      const encryptedData = await AESCryptoStore.encryptData(
        'These violent delights have violent ends',
        key
      );
      console.log('Encrypted:', encryptedData);

      const text = AESCryptoStore.decryptData(encryptedData, key);
      console.log('Decrypted:', text);
    } catch (error) {
      console.log('error', error);
    }
  };

  getLoginTokenHint = () => AsyncStorage.getItem(LOGIN_TOKEN_HINT);

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
    await AsyncStorage.removeItem(LOGIN_TOKEN_HINT);
  };
}

const instance = new AuthComponentStore();
export default instance;
