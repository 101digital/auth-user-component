import { Profile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AESCryptoStore from './aes-crypto';
import SInfo from 'react-native-sensitive-info';
import base64 from 'react-native-base64';
import { AuthServices } from '../services/auth-services';
import { generateSecureRandom } from 'react-native-securerandom';

const REFRESH_TOKEN_KEY = 'authcomponent.refreshToken';
const USER_NAME = 'authcomponent.userName';
const ACCESS_TOKEN_KEY = 'authcomponent.accessToken';
const ORG_TOKEN_KEY = 'authcomponent.orgToken';
const IS_ENABLE_BIOMETRIC = 'authcomponent.enableBio';
const PROFILE_KEY = 'authcomponent.profile';
const LOGIN_TOKEN_HINT = 'authcomponent.loginTokenHint';
const PIN_TOKEN = 'authcomponent.pinToken';

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

  storeUserName = (userName: string) => AsyncStorage.setItem(USER_NAME, userName);

  getUserName = () => AsyncStorage.getItem(USER_NAME);

  storeAccessToken = (accessToken: string) => AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  getAccessToken = () => AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  storeOrgToken = (orgToken: string) => AsyncStorage.setItem(ORG_TOKEN_KEY, orgToken);

  getOrgToken = () => AsyncStorage.getItem(ORG_TOKEN_KEY);

  storeProfile = (profile: Profile) => AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  storeIsEnableBiometric = (isEnable: boolean) =>
    AsyncStorage.setItem(IS_ENABLE_BIOMETRIC, JSON.stringify(isEnable));

  getIsEnableBiometric = () => AsyncStorage.getItem(IS_ENABLE_BIOMETRIC);

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

  getSalt = async () => {
    const salt = await SInfo.getItem('key', sensitiveInfoOptions);
    if (!!salt && salt.length > 0) {
      return base64.decode(salt);
    } else {
      const random = await generateSecureRandom(saltLength);
      const encoded = base64.encodeFromByteArray(random);
      SInfo.setItem('key', encoded, sensitiveInfoOptions);

      return base64.decode(encoded);
    }
  };

  setPin = async (pinNumber: string) => {
    const loginHintToken = await AuthServices.instance().getLoginHintToken();
    const salt = await this.getSalt();
    const key = await AESCryptoStore.generateKey(pinNumber, salt, cost, keySize); //cost 10000
    const encryptedData = await AESCryptoStore.encryptData(loginHintToken, key);

    await SInfo.setItem(PIN_TOKEN, JSON.stringify(encryptedData), sensitiveInfoOptions);
  };

  setBiometric = async () => {
    const loginHintToken = await AuthServices.instance().getLoginHintToken();

    const hasAnySensors = await SInfo.isSensorAvailable();
    if (hasAnySensors) {
      await SInfo.setItem(LOGIN_TOKEN_HINT, loginHintToken, {
        ...sensitiveInfoOptions,
        touchID: true, // will store and protect your data by requiring to unlock using fingerprint or FaceID
        showModal: true,
        kSecAccessControl: 'kSecAccessControlBiometryAny',
      });
    }
  };

  validatePin = async (pinNumber: string) => {
    // get pin token (encrypted)
    try {
      const dataEncrypted = await SInfo.getItem(PIN_TOKEN, sensitiveInfoOptions);
      // generate salt
      const salt = await this.getSalt();
      // generate key (with user pin inputted number )
      const key = await AESCryptoStore.generateKey(pinNumber, salt, cost, keySize); //cost = 10000
      // decrypted loginhint token (with user pin inputted number)
      const loginHintToken = await AESCryptoStore.decryptData(JSON.parse(dataEncrypted), key);
      // authorize loginhint token => calling api authorize token => return true/false
      return await AuthServices.instance().adbAuthorizeToken(loginHintToken);
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };

  validateBiometric = async () => {
    const loginHintToken = await SInfo.getItem(LOGIN_TOKEN_HINT, {
      ...sensitiveInfoOptions,
      touchID: true,
      showModal: true, //required (Android) - Will prompt user's fingerprint on Android
      // required (iOS) -  A fallback string for iOS
      kSecUseOperationPrompt: 'We need your permission to retrieve encrypted data',
    });

    return await AuthServices.instance().adbAuthorizeToken(loginHintToken);
  };
}

const instance = new AuthComponentStore();
export default instance;
