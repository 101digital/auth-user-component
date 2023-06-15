// @ts-ignore
import qs from 'qs';
import authComponentStore from './local-store';
import axios from 'axios';
import { AuthApiClient } from '../api-client/auth-api-client';
import { AuthComponentConfig, PKCE, Profile } from '../types';
import { authorize } from 'react-native-app-auth';
import { PASSPORT } from '../types';
import pkceChallenge from 'react-native-pkce-challenge';

export class AuthServices {
  private static _instance: AuthServices = new AuthServices();

  private _configs?: AuthComponentConfig;
  private _pkce: PKCE = pkceChallenge();
  private notificationPayload: any;

  constructor() {
    if (AuthServices._instance) {
      throw new Error('Error: Instantiation failed: Use AuthComponent.instance() instead of new.');
    }
    AuthServices._instance = this;
  }

  public static instance(): AuthServices {
    return AuthServices._instance;
  }

  public configure(configs: AuthComponentConfig) {
    this._configs = configs;
  }

  public storeAccessToken(token: string) {
    if (this._configs) {
      this._configs.accessToken = token;
      // if (this.notificationPayload) {
      //   const { token, platform, userId } = this.notificationPayload;
      //   this.registerDevice(token, platform, userId);
      // }
    }
  }

  public getLocale() {
    if (this._configs) {
      return this._configs.locale;
    }
  }

  public getAccessToken() {
    if (this._configs) {
      return this._configs.accessToken;
    }
  }

  public storeIdToken(token: string) {
    if (this._configs) {
      this._configs.idToken = token;
    }
  }

  public getIdToken() {
    if (this._configs) {
      return this._configs.idToken;
    }
  }

  public storeOTT(token: string) {
    if (this._configs) {
      this._configs.ott = token;
    }
  }

  public getOTT() {
    if (this._configs) {
      return this._configs.ott;
    }
  }

  public storeJWTPushNotification(token: string) {
    if (this._configs) {
      this._configs.jwtPushNotification = token;
    }
  }

  public getJWTPushNotification() {
    if (this._configs) {
      return this._configs.jwtPushNotification;
    }
  }

  public setLoginHintToken(token: string) {
    if (this._configs) {
      this._configs.loginHintToken = token;
    }
  }

  public getLoginHintToken() {
    if (this._configs) {
      return this._configs.loginHintToken;
    }
  }

  public setPairingCode(code: string) {
    if (this._configs) {
      this._configs.paringCode = code;
    }
  }

  public getPairingCode() {
    if (this._configs) {
      return this._configs.paringCode;
    }
  }

  public setDeviceId(id: string) {
    if (this._configs) {
      this._configs.deviceId = id;
    }
  }

  public getDeviceId() {
    if (this._configs) {
      return this._configs.deviceId;
    }
  }

  public setSessionId(sessionId: string) {
    if (this._configs) {
      return (this._configs.sessionId = sessionId);
    }
  }
  private refreshPKCEChallenge() {
    this._pkce = pkceChallenge();
    return this._pkce;
  }

  public fetchAppAccessToken = async () => {
    const body = qs.stringify({
      grant_type: this._configs?.appGrantType ?? 'client_credentials',
      scope: this._configs?.appScope ?? 'PRODUCTION',
    });
    const response = await AuthApiClient.instance().getAuthApiClient().post('as/token', body);
    return response.data.access_token;
  };

  public adbLogin = async (
    username: string,
    password: string,
    scope?: string,
    acr_values = 'Multi_Factor'
  ) => {
    const { clientId, responseType, responseMode } = this._configs || {};
    const { codeChallenge } = this.refreshPKCEChallenge();
    const responseAuth = await AuthApiClient.instance()
      .getAuthApiClient()
      .get('as/authorize', {
        params: {
          response_type: responseType,
          client_id: clientId,
          scope: scope ? scope : 'openid profilep',
          code_challenge: codeChallenge,
          code_challenge_method: 'S256',
          response_mode: responseMode,
          acr_values,
        },
      });
    const flowId = responseAuth.data?.id;

    if (flowId?.length > 0) {
      const response = await AuthApiClient.instance()
        .getAuthApiClient()
        .post(
          `flows/${flowId}`,
          {
            username,
            password,
          },
          {
            headers: {
              'Content-Type': 'application/vnd.pingidentity.usernamePassword.check+json',
            },
          }
        );
      return response.data;
    }
  };

  public adbVerifyLogin = async (otp: string, flowId: string) => {
    const response = await AuthApiClient.instance()
      .getAuthApiClient()
      .post(
        `flows/${flowId}`,
        {
          otp,
        },
        {
          headers: {
            'Content-Type': 'application/vnd.pingidentity.otp.check+json',
          },
        }
      );
    return response.data;
  };

  public resumeUrl = async (url: string) => {
    const response = await axios.get(url);
    return response.data;
  };

  public obtainToken = async (authorizeCode: string) => {
    const { authGrantType, authBaseUrl, clientId } = this._configs || {};
    const { codeVerifier } = this._pkce;
    const body = qs.stringify({
      grant_type: authGrantType,
      code: authorizeCode,
      scope: 'openid  profilep',
      code_verifier: codeVerifier,
      client_id: clientId,
    });
    const response = await axios.post(`${authBaseUrl}/as/token`, body);

    this.storeAccessToken(response.data.access_token);
    return {
      access_token: response.data.access_token,
      refresh_token: '',
    };
  };

  public getLoginhintTokenAndPairingCode = async () => {
    const { identityPingUrl, accessToken, sessionId } = this._configs || {};
    const responseTokenHint = await axios.get(`${identityPingUrl}/users/loginhint`, {
      headers: {
        Authorization: `${accessToken}`,
        'x-session-id': sessionId,
      },
    });

    const { pairingCode, token } = responseTokenHint.data.data[0];
    this.setLoginHintToken(token);
    this.setPairingCode(pairingCode);
    return {
      loginHintToken: token,
      pairingCode,
    };
  };

  public obtainTokenSingleFactor = async (authorizeCode: string, scope?: string) => {
    const { clientId, authBaseUrl, authGrantType } = this._configs || {};
    const { codeVerifier } = this._pkce;
    const body = qs.stringify({
      grant_type: authGrantType,
      code: authorizeCode,
      scope: scope ?? 'openid  profilep',
      code_verifier: codeVerifier,
      client_id: clientId,
    });

    const response = await axios.post(`${authBaseUrl}/as/token`, body);
    const access_token = response.data.access_token;
    this.storeAccessToken(access_token);
    return {
      access_token,
      refresh_token: '',
    };
  };

  public login = async (username: string, password: string, grantType?: string, scope?: string) => {
    const body = qs.stringify({
      grant_type: grantType ?? this._configs?.authGrantType ?? 'password',
      username,
      password,
    });
    const response = await AuthApiClient.instance()
      .getAuthApiClient()
      .post('', body, {
        params: {
          scope: scope ?? this._configs?.authScope ?? 'openid',
        },
      });
    const { access_token } = response.data;
    this.storeAccessToken(access_token);
    return response.data;
  };

  public refreshToken = async (refreshToken: string, grant_type = 'refresh_token') => {
    const body = qs.stringify({ grant_type, refresh_token: refreshToken });
    const response = await AuthApiClient.instance().getAuthApiClient().post('', body);
    const { access_token } = response.data;
    this.storeAccessToken(access_token);
    return response.data;
  };

  // public adbRefreshToken = async () => {
  //   const loginHintToken = await this.getLoginHintToken();
  //   const body = qs.stringify({
  //     response_type: 'code',
  //     client_id: this._configs?.clientId,
  //     scope: 'openid profile profilep',
  //     code_challenge: 'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
  //     response_mode: 'pi.flow',
  //     login_hint_token: loginHintToken,
  //   });
  //   const responseAuthorize = await AuthApiClient.instance()
  //     .getAuthApiClient()
  //     .post('as/authorize', body);

  //   return await this.obtainTokenSingleFactor(responseAuthorize.data.id);
  // };

  public fetchProfile = async () => {
    const { membershipBaseUrl, accessToken } = this._configs!;
    const response = await axios.get(`${membershipBaseUrl}/users/me`, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    const { data } = response.data;
    const organisationUser = data?.memberships?.filter((el: any) => el.organisationName);
    const memberShip = organisationUser?.length > 0 ? organisationUser[0] : data?.memberships[0];
    return { orgToken: memberShip?.token ?? undefined, data };
  };

  updateProfile = async (userId: string, data: any) => {
    const { membershipBaseUrl, accessToken } = this._configs!;
    const response = await axios.patch(`${membershipBaseUrl}/users/${userId}`, data, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    return response.data;
  };

  loginOAuth2 = async () => {
    if (!this._configs) {
      throw new Error("Error: Can't find the configurations for Auth component");
    }
    const {
      clientId,
      authBaseUrl,
      redirectUrl,
      authScope,
      authorizationBaseUrl,
      revocationBaseUrl,
      endSessionBaseUrl,
    } = this._configs;
    if (!authorizationBaseUrl) {
      throw new Error("Error: authorizationEndpoint can't be undefined");
    }
    if (!redirectUrl) {
      throw new Error("Error: redirectUrl can't be undefined");
    }
    const config = {
      clientId,
      redirectUrl: redirectUrl,
      scopes: [authScope ?? 'openid'],
      serviceConfiguration: {
        authorizationEndpoint: authorizationBaseUrl,
        tokenEndpoint: `${authBaseUrl}/as/token`,
        revocationEndpoint: revocationBaseUrl,
        endSessionEndpoint: endSessionBaseUrl,
      },
    };
    const response = await authorize(config);
    return response;
  };

  changeUserPassword = async (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ) => {
    const { identityPingUrl, accessToken } = this._configs!;
    const body = {
      currentPassword,
      newPassword,
      confirmNewPassword,
    };

    const response = await axios.put(`${identityPingUrl}/users/passwords`, body, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    return response.data;
  };

  public revokeToken = async () => {
    const { authBaseUrl, clientId, accessToken } = this._configs || {};
    const body = qs.stringify({
      token: accessToken,
      client_id: clientId,
    });
    const response = await axios.post(`${authBaseUrl}/as/revoke`, body);

    return response.data;
  };

  recoveryUserPassword = async (mobileNumber: string) => {
    const { identityBaseUrl } = this._configs!;
    const appAccessToken = await this.fetchAppAccessToken();
    const response = await axios.get(`${identityBaseUrl}/users/${mobileNumber}/recovery-options`, {
      headers: {
        Authorization: `${appAccessToken}`,
      },
    });
    return response.data;
  };

  requestResetUserPassword = async (channelId: string, recoveryCode: string) => {
    const { identityBaseUrl } = this._configs!;
    const publicAppToken = await this.fetchAppAccessToken();
    const body = {
      channelId,
      recoveryCode,
    };

    const response = await axios.post(`${identityBaseUrl}/users/passwords/reset-request`, body, {
      headers: {
        Authorization: `${publicAppToken}`,
      },
    });

    return response.data;
  };

  resetPassword = async (newPassword: string, otp: string) => {
    const { identityBaseUrl } = this._configs!;
    const publicAppToken = await this.fetchAppAccessToken();
    const body = {
      password: newPassword,
    };

    const response = await axios.put(
      `${identityBaseUrl}/users/passwords/reset-requests/${otp}`,
      body,
      {
        headers: {
          Authorization: `${publicAppToken}`,
        },
      }
    );

    return response.data;
  };

  validateUserForgotPassword = async (email: string, nric: string) => {
    const { identityPingUrl } = this._configs!;
    const publicAppToken = await this.fetchAppAccessToken();
    const body = {
      email: email,
      idType: 'IdNumber',
      idNumber: nric,
    };
    const response = await axios.post(
      `${identityPingUrl}/users/passwords/validate-reset-request`,
      body,
      {
        headers: {
          Authorization: `${publicAppToken}`,
        },
      }
    );
    return response.data;
  };

  changeUserPasswordUsingRecoveryCode = async (
    recoveryCode: string,
    newPassword: string,
    flowId: string
  ) => {
    const { authBaseUrl } = this._configs!;
    const body = {
      recoveryCode: recoveryCode,
      newPassword: newPassword,
    };
    const response = await axios.post(`${authBaseUrl}/flows/${flowId}`, body, {
      headers: {
        'access-control-allow-origin': '*',
        'Content-Type': 'application/vnd.pingidentity.password.recover+json',
      },
    });
    return response.data;
  };

  selectDevice = async (deviceId: string, flowId: string) => {
    const { authBaseUrl } = this._configs!;

    const body = {
      device: {
        id: deviceId,
      },
    };

    const response = await axios.post(`${authBaseUrl}/flows/${flowId}`, body, {
      headers: {
        'access-control-allow-origin': '*',
        'Content-Type': 'application/vnd.pingidentity.device.select+json',
      },
    });
    return response.data;
  };

  registerDevice = async (token: string, platform: 'IOS' | 'Android', userId: string) => {
    const { notificationBaseUrl, accessToken, notificationAppId, notificationEntityId } =
      this._configs!;
    const body = {
      entityId: notificationEntityId,
      appId: notificationAppId,
      userId,
      token,
      platform,
    };
    if (!this.notificationPayload) {
      this.notificationPayload = body;
    }
    const response = await axios.post(`${notificationBaseUrl}/devices`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };

  getNotificationBadge = async () => {
    const { notificationBaseUrl, accessToken } = this._configs!;
    let badgeNumber: number = 0;
    try {
      const response = await axios.get(
        `${notificationBaseUrl}/notifications?entityId=ADB&appId=SYSTEM`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('data notifications', response.data);
      if (response.data) {
        badgeNumber = response.data.additionalData?.totalNotView ?? 0;
        return badgeNumber;
      }
    } catch (error) {
      console.log('ERROR:', error);
      return badgeNumber;
    }
  };

  getNotifications = async (pageNumber: number, pageSize: number = 10) => {
    const { notificationBaseUrl, accessToken } = this._configs!;
    try {
      const response = await axios.get(
        `${notificationBaseUrl}/notifications?entityId=ADB&appId=SYSTEM&pageSize=${pageSize}&pageNumber=${pageNumber}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('data notifications list', response.data);
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.log('ERROR:', error);
      return false;
    }
  };

  updateReadNotification = async (notificationId: string) => {
    const { notificationBaseUrl, accessToken } = this._configs!;
    try {
      const response = await axios.post(
        `${notificationBaseUrl}/notifications/${notificationId}/status`,
        { status: 'READ' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('success Notifcation read', response.data);
      return true;
    } catch (error) {
      console.log('ERROR:', error);
      return false;
    }
  };

  updateUserInfo = async (
    userId: string,
    fullName: string,
    nickname: string,
    id: string,
    idType?: string,
    idIssuingCountry?: string
  ) => {
    const { membershipBaseUrl, accessToken } = this._configs!;
    let body = {};

    const updateInfoPayload = {
      fullName: fullName,
      nickName: nickname,
      firstName: fullName,
      lastName: fullName,
    };

    if (idType === PASSPORT) {
      body = {
        ...updateInfoPayload,
        kycDetails: {
          altIdNumber: id,
          idType,
          idIssuingCountry,
        },
      };
    } else {
      body = {
        ...updateInfoPayload,
        kycDetails: {
          altIdNumber: id,
        },
      };
    }

    const response = await axios.patch(`${membershipBaseUrl}/users/${userId}`, body, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    return response.data;
  };

  public authorizePushOnly = async (token?: string, clientIdInit?: string, scope?: string) => {
    const { clientId, responseType, responseMode, loginHintToken } = this._configs || {};
    try {
      const { codeChallenge } = this.refreshPKCEChallenge();
      const responseAuth = await AuthApiClient.instance()
        .getAuthApiClient()
        .get('as/authorize', {
          params: {
            response_type: responseType,
            client_id: clientIdInit ? clientIdInit : clientId,
            scope: scope ? scope : 'openid profilep',
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
            response_mode: responseMode,
            acr_values: 'Push_Only',
            login_hint_token: token ? token : loginHintToken,
          },
        });
      if (responseAuth) {
        if (token) {
          this.setLoginHintToken(token);
        }
        return responseAuth.data;
      }
    } catch (error) {
      return false;
    }
  };

  public getListDevices = async () => {
    const { accessToken } = this._configs || {};
    const response = await axios.get(`${this._configs?.identityPingUrl}/users/devices`, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    return response.data;
  };

  public deleteDevice = async (deviceId: string) => {
    const { accessToken } = this._configs || {};
    const response = await axios.delete(
      `${this._configs?.identityPingUrl}/users/devices/${deviceId}`,
      {
        headers: {
          Authorization: `${accessToken}`,
        },
      }
    );
    return response.data;
  };

  public updateUserStatus = async (userId: string, status: string) => {
    const { accessToken } = this._configs || {};
    try {
      await axios.patch(
        `${this._configs?.membershipBaseUrl}/users/${userId}`,
        { status },
        {
          headers: {
            Authorization: `${accessToken}`,
          },
        }
      );
      return true;
    } catch (err) {}
    return false;
  };
}
