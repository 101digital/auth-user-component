import React from 'react';
import { render } from '@testing-library/react-native';
import { AuthServices } from '../../src/services/auth-services';
import qs from 'qs';
import axios from 'axios';

jest.mock('axios');

jest.mock('qs', () => ({
  stringify: jest.fn(() => 'foo'),
}));

jest.mock('react-native-app-auth', () => ({
  authorize: jest.fn(() => 'mock authorize response'),
}));

describe('Authentication Services testing', () => {
  //updateUserStatus
  it('updateUserStatus testing', async () => {
    let service = AuthServices.instance();
    const mockResponse = 'mock userVerification response';

    axios.patch.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.updateUserStatus();
    expect(responseData).toBeTruthy();
  });

  //deleteDevice
  it('deleteDevice testing', async () => {
    let service = AuthServices.instance();
    const mockResponse = { data: 'mock deleteDevice response' };

    axios.delete.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.deleteDevice();
    expect(responseData).toBeTruthy();
  });

  //getListDevices
  it('getListDevices testing', async () => {
    let service = AuthServices.instance();
    const mockResponse = { data: 'mock getListDevices response' };

    axios.get.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.getListDevices();
    expect(responseData).toBeTruthy();
  });

  //authorizePushOnly
  it('authorizePushOnly testing', async () => {
    let service = AuthServices.instance();
    const mockResponse = { data: 'mock authorizePushOnly response' };

    axios.get.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.authorizePushOnly();
    expect(responseData).toBeFalsy();
  });

  //updateUserInfo
  it('updateUserInfo testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      membershipBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock updateUserInfo response' };

    axios.patch.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.updateUserInfo(
      'mockUserId',
      'mockFullName',
      'mockNickName',
      'testId'
    );
    expect(responseData).toBe(mockResponse);
  });

  //updateReadNotification
  it('updateReadNotification testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock updateReadNotification response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.updateReadNotification('mockNotificationId');
    expect(responseData).toBeTruthy();
  });

  //getNotifications
  it('getNotifications testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock getNotifications response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.getNotifications('mockNotificationId');
    expect(responseData).toBeTruthy();
  });

  //getNotificationBadge
  it('getNotificationBadge testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock getNotificationBadge response' };

    axios.get.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.getNotificationBadge('mockNotificationId');
    expect(responseData).toBe(0);
  });

  //registerDevice
  it('registerDevice testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock registerDevice response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.registerDevice('mockNotificationId');
    expect(responseData).toBe(mockResponse);
  });

  //selectDevice
  it('selectDevice testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock selectDevice response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.selectDevice('mockNotificationId');
    expect(responseData).toBe(mockResponse);
  });

  //changeUserPasswordUsingRecoveryCode
  it('changeUserPasswordUsingRecoveryCode testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockResponse = { data: 'mock changeUserPasswordUsingRecoveryCode response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.changeUserPasswordUsingRecoveryCode('mockNotificationId');
    expect(responseData).toBe(mockResponse);
  });

  //validateUserForgotPassword
  it('validateUserForgotPassword testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      notificationBaseUrl: 'mockUrl',
    });

    const mockFetchAppAccessTokenFn = jest.fn(() => {});
    service.fetchAppAccessToken = mockFetchAppAccessTokenFn;

    const mockResponse = { data: 'mock validateUserForgotPassword response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.validateUserForgotPassword('mockNotificationId');

    expect(mockFetchAppAccessTokenFn).toBeCalled();
    expect(responseData).toBe(mockResponse);
  });

  //resetPassword
  it('resetPassword testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      identityBaseUrl: 'mockUrl',
    });

    const mockFetchAppAccessTokenFn = jest.fn(() => {});
    service.fetchAppAccessToken = mockFetchAppAccessTokenFn;

    const mockResponse = 'mock resetPassword response';

    axios.put.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.resetPassword('mockNotificationId');

    expect(mockFetchAppAccessTokenFn).toBeCalled();
    expect(responseData).toBe(mockResponse);
  });

  //requestResetUserPassword
  it('requestResetUserPassword testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      identityBaseUrl: 'mockUrl',
    });

    const mockFetchAppAccessTokenFn = jest.fn(() => {});
    service.fetchAppAccessToken = mockFetchAppAccessTokenFn;

    const mockResponse = { data: 'mock requestResetUserPassword response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.requestResetUserPassword('mockNotificationId');

    expect(mockFetchAppAccessTokenFn).toBeCalled();
    expect(responseData).toBe(mockResponse);
  });

  //recoveryUserPassword
  it('recoveryUserPassword testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      identityBaseUrl: 'mockUrl',
    });

    const mockFetchAppAccessTokenFn = jest.fn(() => {});
    service.fetchAppAccessToken = mockFetchAppAccessTokenFn;

    const mockResponse = { data: 'mock recoveryUserPassword response' };

    axios.get.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.recoveryUserPassword('mockNotificationId');

    expect(mockFetchAppAccessTokenFn).toBeCalled();
    expect(responseData).toBe(mockResponse);
  });

  //revokeToken
  it('revokeToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      authBaseUrl: 'mockUrl',
      clientId: 'mockClientId',
    });

    const mockResponse = { data: 'mock revokeToken response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.revokeToken();

    expect(responseData).toBe(mockResponse);
  });

  //loginOAuth2
  it('loginOAuth2 testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      authorizationBaseUrl: 'mockUrl',
      redirectUrl: 'mockRedirectUrl',
    });

    const responseData = await service.loginOAuth2('foo');

    expect(responseData).toBe('mock authorize response');
  });

  //changeUserPassword
  it('changeUserPassword testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      identityPingUrl: 'mockUrl',
      accessToken: 'mockAccessToken',
    });

    const mockResponse = 'mock changeUserPassword response';

    axios.put.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.changeUserPassword();

    expect(responseData).toBe(mockResponse);
  });

  //fetchProfile
  it('fetchProfile testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      identityPingUrl: 'mockUrl',
      accessToken: 'mockAccessToken',
    });

    const mockResponse = { data: 'mock recoveryUserPassword response', orgToken: undefined };

    axios.get.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.fetchProfile();

    expect(responseData).toBeTruthy();
  });

  //obtainTokenSingleFactor
  it('obtainTokenSingleFactor testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      authGrantType: 'mockUrl',
    });

    const mockResponse = { data: 'mock obtainTokenSingleFactor response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.obtainTokenSingleFactor();

    expect(responseData).toBeTruthy();
  });

  //getLoginhintTokenAndPairingCode
  it('getLoginhintTokenAndPairingCode testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      identityPingUrl: 'mockIdentityPingUrl',
    });

    const mockResponse = { data: 'mock getLoginhintTokenAndPairingCode response' };

    axios.get.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.getLoginhintTokenAndPairingCode();

    expect(responseData).toBeTruthy();

    axios.get.mockRejectedValueOnce(new Error('something bad happened'));
    const responseRejectData = await service.getLoginhintTokenAndPairingCode();

    expect(responseRejectData).toEqual({ loginHintToken: undefined, pairingCode: undefined });
  });

  //obtainToken
  it('obtainToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      authBaseUrl: 'mockIdentityPingUrl',
      authGrantType: 'mockAuthGrantType',
    });

    const mockResponse = { data: 'mock obtainToken response' };

    axios.post.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.obtainToken();

    expect(responseData).toBeTruthy();
  });

  //updateProfile
  it('updateProfile testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      membershipBaseUrl: 'mockMembershipBaseUrl',
    });

    const mockResponse = { data: 'mock updateProfile response' };

    axios.patch.mockResolvedValue({
      data: mockResponse,
    });

    const responseData = await service.updateProfile();

    expect(responseData).toBeTruthy();
  });

  //getDeviceId
  it('getDeviceId testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      deviceId: 'mockDeviceId',
    });

    expect(service.getDeviceId()).toBe('mockDeviceId');
  });

  //setDeviceId
  it('setDeviceId testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      deviceId: 'mockDeviceId',
    });
    service.setDeviceId('New device id');

    expect(service.getDeviceId()).toBe('New device id');
  });

  //getPairingCode
  it('getPairingCode testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      paringCode: 'mockParingCode',
    });

    expect(service.getPairingCode()).toBe('mockParingCode');
  });

  //setPairingCode
  it('setPairingCode testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      paringCode: 'mockParingCode',
    });

    service.setPairingCode('New paring code');

    expect(service.getPairingCode()).toBe('New paring code');
  });

  //getLoginHintToken
  it('getLoginHintToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      loginHintToken: 'mockLoginHintToken',
    });

    expect(service.getLoginHintToken()).toBe('mockLoginHintToken');
  });

  //setLoginHintToken
  it('setLoginHintToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      loginHintToken: 'mockLoginHintToken',
    });

    service.setLoginHintToken('New mockLoginHintToken');

    expect(service.getLoginHintToken()).toBe('New mockLoginHintToken');
  });

  //getJWTPushNotification
  it('getJWTPushNotification testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      jwtPushNotification: 'mockJWTPushNotification',
    });

    expect(service.getJWTPushNotification()).toBe('mockJWTPushNotification');
  });

  //storeJWTPushNotification
  it('storeJWTPushNotification testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      jwtPushNotification: 'mockJWTPushNotification',
    });

    service.storeJWTPushNotification('New mockJWTPushNotification');

    expect(service.getJWTPushNotification()).toBe('New mockJWTPushNotification');
  });

  //getOTT
  it('getOTT testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      ott: 'mockOTT',
    });

    expect(service.getOTT()).toBe('mockOTT');
  });

  //storeOTT
  it('storeOTT testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      ott: 'mockOTT',
    });

    service.storeOTT('New mockOTT');

    expect(service.getOTT()).toBe('New mockOTT');
  });

  //storeJWTPushNotification
  it('storeJWTPushNotification testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      jwtPushNotification: 'mockJWTPushNotification',
    });

    service.storeJWTPushNotification('New mockJWTPushNotification');

    expect(service.getJWTPushNotification()).toBe('New mockJWTPushNotification');
  });

  //getIdToken
  it('getIdToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      idToken: 'mockIDToken',
    });

    expect(service.getIdToken()).toBe('mockIDToken');
  });

  //storeIdToken
  it('storeIdToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      idToken: 'mockIDToken',
    });

    service.storeIdToken('New mockIDToken');

    expect(service.getIdToken()).toBe('New mockIDToken');
  });

  //getIdToken
  it('getIdToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      idToken: 'mockIDToken',
    });

    expect(service.getIdToken()).toBe('mockIDToken');
  });

  //storeAccessToken
  it('storeAccessToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      accessToken: 'mockAccessToken',
    });

    service.storeAccessToken('New mockAccessToken');

    expect(service.getAccessToken()).toBe('New mockAccessToken');
  });

  //getAccessToken
  it('getAccessToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      accessToken: 'mockAccessToken',
    });

    expect(service.getAccessToken()).toBe('mockAccessToken');
  });

  //getLocale
  it('getLocale testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      locale: 'en',
    });

    expect(service.getLocale()).toBe('en');
  });

  //setDeviceId
  it('setDeviceId testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      deviceId: 'mockDeviceId',
    });

    service.setDeviceId('New mockDeviceId');

    expect(service.getDeviceId()).toBe('New mockDeviceId');
  });

  //getAccessToken
  it('getAccessToken testing', async () => {
    let service = AuthServices.instance();
    service.configure({
      deviceId: 'mockDeviceId',
    });

    expect(service.getDeviceId()).toBe('mockDeviceId');
  });
});
