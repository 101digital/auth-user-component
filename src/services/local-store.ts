import { Profile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AESCryptoStore from './aes-crypto';
import SInfo from 'react-native-sensitive-info';
import base64 from 'react-native-base64';
import { AuthServices } from '../services/auth-services';
import { generateSecureRandom } from 'react-native-securerandom';

const REFRESH_TOKEN_KEY = 'authcomponent.refreshToken';
const ACCESS_TOKEN_KEY = 'authcomponent.accessToken';
const ORG_TOKEN_KEY = 'authcomponent.orgToken';
const PROFILE_KEY = 'authcomponent.profile';
const LOGIN_TOKEN_HINT = 'authcomponent.loginTokenHint';
const PIN_TOKEN = 'authcomponent.pinToken';
const BIO_TOKEN = 'authcomponent.bioToken';

const keySize = 256;
const cost = 10000;
const saltLength = 12;

const sensitiveInfoOptions = {
  sharedPreferencesName: 'mySharedPrefs',
  keychainService: 'myKeychain',
};

class AuthComponentStore {
  storeRefreshToken = (refreshToken: string) =>
    AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  getRefreshToken = () => AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  storeAccessToken = (accessToken: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  storeOrgToken = (orgToken: string) => AsyncStorage.setItem(ORG_TOKEN_KEY, orgToken);

  getOrgToken = () => AsyncStorage.getItem(ORG_TOKEN_KEY);

  storeProfile = (profile: Profile) => AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  storeLoginTokenHint = async (hint: string) => this.storeSensitiveData(hint, LOGIN_TOKEN_HINT);

  getLoginTokenHint = async () => this.getSensitiveData(LOGIN_TOKEN_HINT);

  storePinToken = async (pin: string) => this.storeSensitiveData(pin, PIN_TOKEN);

  getPinToken = async () => this.getSensitiveData(PIN_TOKEN);

  storeBiometricToken = async (hint: string) => this.storeSensitiveData(hint, BIO_TOKEN);

  getBiometricToken = async () => this.getSensitiveData(BIO_TOKEN);

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
    await SInfo.setItem('key', '', sensitiveInfoOptions);
    await SInfo.setItem(PIN_TOKEN, '', sensitiveInfoOptions);
    await SInfo.setItem(BIO_TOKEN, '', sensitiveInfoOptions);
    await SInfo.setItem(LOGIN_TOKEN_HINT, '', sensitiveInfoOptions);
  };

  getSalt = async () => {
    const salt = await SInfo.getItem('key', sensitiveInfoOptions);
    if (!!salt && salt.length > 0) {
      return base64.decode(salt);
    } else {
      const random = await generateSecureRandom(saltLength);
      SInfo.setItem('key', base64.encodeFromByteArray(random), sensitiveInfoOptions);

      return Buffer.from(random.buffer).toString();
    }
  };

  storeSensitiveData = async (data: string, keyPassword: string) => {
    console.log('storeSensitiveData -> data', data);
    try {
      const salt = await this.getSalt();
      console.log('storeSensitiveData -> salt', salt);
      const key = await AESCryptoStore.generateKey(keyPassword, salt, cost, keySize);
      console.log('Key:', key);

      const encryptedData = await AESCryptoStore.encryptData(data, key);

      await SInfo.setItem(keyPassword, JSON.stringify(encryptedData), sensitiveInfoOptions);
    } catch (error) {
      console.log('error', error);
    }
  };

  getSensitiveData = async (keyPassword: string) => {
    console.log('getSensitiveData => keyPassword', keyPassword);
    try {
      const dataEncrypted = await SInfo.getItem(keyPassword, sensitiveInfoOptions);
      const salt = await this.getSalt();
      console.log('salt', salt);
      const key = await AESCryptoStore.generateKey(keyPassword, salt, cost, keySize);
      const decryptedData = await AESCryptoStore.decryptData(JSON.parse(dataEncrypted), key);
      console.log('getSensitiveData => decryptedData', decryptedData);
      return decryptedData;
    } catch (error) {
      console.log('error', error);
    }
  };

  setPin = async () => {
    const loginHintToken = await AuthServices.instance().getLoginHintToken();
    console.log('setPin -> loginHintToken', loginHintToken);
  };
}

const instance = new AuthComponentStore();
export default instance;
