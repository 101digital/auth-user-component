import { BiometricMethod } from '../types';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AESCryptoStore from './aes-crypto';
import SInfo from 'react-native-sensitive-info';
import base64 from 'react-native-base64';
import { AuthServices } from '../services/auth-services';
import { generateSecureRandom } from 'react-native-securerandom';

const USER_NAME = 'authcomponent.userName';
const IS_ENABLE_BIOMETRIC = 'authcomponent.enableBio';
const SELECTED_BIOMETRIC_METHOD = 'authcomponent.selectedBioMethod';
const PIN_TOKEN = 'authcomponent.pinToken';
const BIO_TOKEN = 'authcomponent.biometricToken.currentSet';
const IS_USER_LOGGED = 'authcomponent.isUserLogged';

const keySize = 256;
const cost = 10000;
const saltLength = 12;

const sensitiveInfoOptions = {
  sharedPreferencesName: 'mySharedPrefs',
  keychainService: 'myKeychain',
};

const biometricChangeErrorCode = {
  error: {
    code: 'BIOMETRIC_CHANGE',
  },
};

class AuthComponentStore {
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
    let newLoginHintToken = AuthServices.instance().getLoginHintToken();
    if (!newLoginHintToken || newLoginHintToken.length === 0) {
      const { loginHintToken } = await AuthServices.instance().getLoginhintTokenAndPairingCode();
      newLoginHintToken = loginHintToken;
    }

    if (newLoginHintToken) {
      const salt = await this.getSalt();
      const key = await AESCryptoStore.generateKey(pinNumber, salt, cost, keySize); //cost 10000
      const encryptedData = await AESCryptoStore.encryptData(newLoginHintToken, key);

      await SInfo.setItem(PIN_TOKEN, JSON.stringify(encryptedData), sensitiveInfoOptions);
    } else {
      return false;
    }
  };

  setBiometric = async () => {
    let newLoginHintToken = AuthServices.instance().getLoginHintToken();
    if (!newLoginHintToken || newLoginHintToken.length === 0) {
      const { loginHintToken } = await AuthServices.instance().getLoginhintTokenAndPairingCode();
      newLoginHintToken = loginHintToken;
    }

    if (newLoginHintToken) {
      try {
        await SInfo.setItem(BIO_TOKEN, newLoginHintToken, {
          ...sensitiveInfoOptions,
          touchID: true, //add this key
          showModal: true, //add this key
          kSecAccessControl: 'kSecAccessControlBiometryCurrentSet', // optional - Add support for FaceID
          strings: {
            description: 'Do you want to allow AEON Bank to use Finger Print ID?',
            header:
              'AEON Bank uses Finger Print ID to restrict unauthorized users from accessing the app.',
          }
        });
        return true;
      } catch (error) {
        return false;
      }
    } else {
      return false;
    }
  };

  validatePin = async (pinNumber: string, isUpdating?: boolean) => {
    try {
      const dataEncrypted = await SInfo.getItem(PIN_TOKEN, sensitiveInfoOptions);
      const salt = await this.getSalt();
      const key = await AESCryptoStore.generateKey(pinNumber, salt, cost, keySize); //cost = 10000
      const loginHintToken = await AESCryptoStore.decryptData(JSON.parse(dataEncrypted), key);

      const authorizeReponse = await AuthServices.instance().authorizePushOnly(loginHintToken);
      if (isUpdating && authorizeReponse) {
        AuthServices.instance().setLoginHintToken(loginHintToken);
      }
      return authorizeReponse;
    } catch (error) {
      return error?.response?.data;
    }
  };

  validateBiometric = async (isUpdating?: boolean) => {
    try {
      const loginHintToken = await SInfo.getItem(BIO_TOKEN, {
        ...sensitiveInfoOptions,
        touchID: true,
        showModal: true,
        strings: {
          description: 'Do you want to allow AEON Bank to use Finger Print ID?',
          header:
            'AEON Bank uses Finger Print ID to restrict unauthorized users from accessing the app.',
        },
        kSecUseOperationPrompt: 'We need your permission to retrieve encrypted data',
      });
      if (!loginHintToken) {
        return biometricChangeErrorCode;
      }
      const authorizeReponse = await AuthServices.instance().authorizePushOnly(loginHintToken);
      if (isUpdating && authorizeReponse) {
        AuthServices.instance().setLoginHintToken(loginHintToken);
      }
      return authorizeReponse;
    } catch (error) {
      if (error.message === 'Key permanently invalidated') {
        return biometricChangeErrorCode;
      }
      return error?.response?.data;
    }
  };
}

const instance = new AuthComponentStore();
export default instance;
