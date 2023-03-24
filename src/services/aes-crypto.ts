import Aes from 'react-native-aes-crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY_LENGTH = 16;

type EncryptedData = {
  cipher: string;
  iv: string;
};

class AESCryptoStore {
  generateKey = (password: string, salt: string, cost: number, length: number) =>
    Aes.pbkdf2(password, salt, cost, length);

  encryptData = async (text: string, key: string): Promise<EncryptedData> => {
    return Aes.randomKey(KEY_LENGTH).then(async (iv) => {
      const cipher = await Aes.encrypt(text, key, iv, ALGORITHM);

      return {
        cipher,
        iv,
      };
    });
  };

  decryptData = (encryptedData: EncryptedData, key: string) =>
    Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, ALGORITHM);
}

const instance = new AESCryptoStore();
export default instance;
