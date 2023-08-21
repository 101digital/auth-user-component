import React from 'react';
import { AuthContext } from 'react-native-auth-component';
export * from '@react-native-async-storage/async-storage/jest/async-storage-mock';

jest.mock('react-native-auth-component', () => {
  return () => ({});
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('react-native-sensitive-info', () => {
  return () => ({});
});

jest.mock('react-native-base64', () => {
  return () => ({});
});

jest.mock('react-native-securerandom', () => {
  return () => ({});
});

jest.mock('qs', () => {
  return () => ({});
});

jest.mock('js-base64', () => {
  return () => ({});
});

jest.mock('react-native-app-auth', () => {
  return () => ({});
});

jest.mock('react-native-pkce-challenge', () => {
  return () => ({});
});
