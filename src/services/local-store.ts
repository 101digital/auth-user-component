import { BiometricMethod } from '../types';
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
const SELECTED_BIOMETRIC_METHOD = 'authcomponent.selectedBioMethod';
const PROFILE_KEY = 'authcomponent.profile';
const LOGIN_TOKEN_HINT = 'authcomponent.loginTokenHint';
const PIN_TOKEN = 'authcomponent.pinToken';
const BIO_TOKEN = 'authcomponent.biometricToken';
const QR_INBOUND_IMAGE = 'qr.inboundImage';
const BIO_PUBLIC_KEY = 'authcomponent.bioPublicKey';
const IS_USER_LOGGED = 'authcomponent.isUserLogged';

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

  storeIsEnableBiometric = (isEnable: boolean) =>
    AsyncStorage.setItem(IS_ENABLE_BIOMETRIC, JSON.stringify(isEnable));

  getIsEnableBiometric = () => AsyncStorage.getItem(IS_ENABLE_BIOMETRIC);

  storeSelectedBiometricMethod = (method: BiometricMethod) =>
    AsyncStorage.setItem(SELECTED_BIOMETRIC_METHOD, method);

  getSelectedBiometricMethod = () => AsyncStorage.getItem(SELECTED_BIOMETRIC_METHOD);

  storeIsUserLogged = (isLogged: boolean) =>
    AsyncStorage.setItem(IS_USER_LOGGED, JSON.stringify(isLogged));

  getIsUserLogged = async () => {
    try {
      const value = await AsyncStorage.getItem(IS_USER_LOGGED);
      return value ? JSON.parse(value) : false;
    } catch (_) {
      return false;
    }
  };

  clearAuths = async () => {
    await AsyncStorage.multiRemove([
      REFRESH_TOKEN_KEY,
      ACCESS_TOKEN_KEY,
      ORG_TOKEN_KEY,
      PROFILE_KEY,
      LOGIN_TOKEN_HINT,
      QR_INBOUND_IMAGE,
      IS_USER_LOGGED,
    ]);
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

  setBiometric = async (keyBio: string) => {
    const loginHintToken = await AuthServices.instance().getLoginHintToken();
    const salt = await this.getSalt();
    const key = await AESCryptoStore.generateKey(keyBio, salt, cost, keySize); //cost 10000
    const encryptedData = await AESCryptoStore.encryptData(loginHintToken, key);

    await SInfo.setItem(BIO_TOKEN, JSON.stringify(encryptedData), sensitiveInfoOptions);
    await SInfo.setItem(BIO_PUBLIC_KEY, keyBio, sensitiveInfoOptions);
  };

  validatePin = async (pinNumber: string) => {
    try {
      const dataEncrypted = await SInfo.getItem(PIN_TOKEN, sensitiveInfoOptions);
      const salt = await this.getSalt();
      const key = await AESCryptoStore.generateKey(pinNumber, salt, cost, keySize); //cost = 10000
      const loginHintToken = await AESCryptoStore.decryptData(JSON.parse(dataEncrypted), key);

      return await AuthServices.instance().authorizePushOnly(loginHintToken);
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };

  validateBiometric = async () => {
    try {
      const bioPublicKey = await SInfo.getItem(BIO_PUBLIC_KEY, sensitiveInfoOptions);
      const dataEncrypted = await SInfo.getItem(BIO_TOKEN, sensitiveInfoOptions);
      const salt = await this.getSalt();
      const key = await AESCryptoStore.generateKey(bioPublicKey, salt, cost, keySize); //cost = 10000
      const loginHintToken = await AESCryptoStore.decryptData(JSON.parse(dataEncrypted), key);

      return await AuthServices.instance().authorizePushOnly(loginHintToken);
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };
}

const instance = new AuthComponentStore();
export default instance;
