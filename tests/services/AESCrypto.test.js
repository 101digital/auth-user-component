import React from 'react';
import { render } from '@testing-library/react-native';
import AESCrypto from '../../src/services/aes-crypto';
import { pbkdf2, randomKey, decrypt } from 'react-native-aes-crypto';

import axios from 'axios';

jest.mock('react-native-aes-crypto', () => ({
  pbkdf2: jest.fn(() => 'foo'),
  randomKey: jest.fn(() => 'foo'),
  decrypt: jest.fn(() => 'foo'),
}));

describe('Authentication Services testing', () => {
  it('should call pbkdf2 function with correct parameter when calling generateKey function', async () => {
    AESCrypto.generateKey('dummyPassword', '12345', '12345', 2);

    expect(pbkdf2).toHaveBeenCalledWith('dummyPassword', '12345', '12345', 2);
  });

  it('should call randomKey function with correct parameter when calling encryptData function', async () => {
    AESCrypto.encryptData('mockText', 'mockKey');

    expect(randomKey).toHaveBeenCalled();
  });

  it('should call decrypt function with correct parameter when calling decryptData function', async () => {
    AESCrypto.decryptData('mockText', 'mockKey');

    expect(decrypt).toHaveBeenCalled();
  });
});
