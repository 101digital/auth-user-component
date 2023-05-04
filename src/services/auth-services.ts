// @ts-ignore
import qs from 'qs';
import authComponentStore from './local-store';
import axios from 'axios';
import { AuthApiClient } from '../api-client/auth-api-client';
import { AuthComponentConfig, PKCE } from '../types';
import { authorize } from 'react-native-app-auth';
import { PASSPORT } from '../types';
import pkceChallenge from 'react-native-pkce-challenge';

export class AuthServices {
  private static _instance: AuthServices = new AuthServices();

  private _configs?: AuthComponentConfig;
  private _pkce: PKCE = pkceChallenge();

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

  private storeAccessToken(token: string) {
    if (this._configs) {
      this._configs.accessToken = token;
    }
  }

  public getAccessToken() {
    if (this._configs) {
      return this._configs.accessToken;
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

  public getLoginHintToken = async () => {
    const { identityPingUrl, accessToken } = this._configs || {};

    const responseTokenHint = await axios.get(`${identityPingUrl}/users/loginhint`, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });

    return responseTokenHint.data.data[0].token;
  };

  public getPairingCode = async () => {
    const { identityPingUrl, accessToken } = this._configs || {};

    const responseTokenHint = await axios.get(`${identityPingUrl}/users/loginhint`, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });

    return responseTokenHint.data.data[0];
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
    console.log('fetchProfile -> accessToken', accessToken);
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

  logout = async () => {
    await authComponentStore.clearAuths();
  };

  updateProfile = async (
    userId: string,
    firstName: string,
    lastName: string,
    profilePicture?: string
  ) => {
    const { membershipBaseUrl, accessToken } = this._configs!;
    const body = {
      firstName: firstName,
      lastName: lastName,
      listCustomFields: [
        {
          customKey: 'logo',
          customValue: profilePicture,
        },
      ],
    };
    const response = await axios.put(`${membershipBaseUrl}/users/${userId}`, body, {
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
    const { identityBaseUrl } = this._configs!;
    const publicAppToken = await this.fetchAppAccessToken();
    const body = {
      email:email,
      idType: "IdNumber",
      idNumber: nric
    };
    const response = await axios.post(
      `${identityBaseUrl}/users/passwords/validate-reset-request`,
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
      recoveryCode:recoveryCode,
      newPassword:newPassword,
    };
    const response = await axios.post(
      `${authBaseUrl}/flows/${flowId}`,
        body,
        {
          headers: {
            'access-control-allow-origin': '*',
            'Content-Type': 'application/vnd.pingidentity.password.recover+json',
          },
        }
      );
    return response.data;
  };

  registerDevice = async (
    token: string,
    platform: 'IOS' | 'Android',
    userId: string,
    appId: string,
    entityId: string
  ) => {
    const { notificationBaseUrl, accessToken } = this._configs!;
    const body = {
      entityId,
      appId,
      userId,
      token,
      platform,
    };
    const response = await axios.post(`${notificationBaseUrl}/devices`, body, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
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

  public authorizePushOnly = async (
    loginHintToken: string,
    clientIdInit?: string,
    scope?: string
  ) => {
    const { clientId, responseType, responseMode } = this._configs || {};
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
            login_hint_token: loginHintToken,
          },
        });
      console.log('responseAuth -> response', responseAuth);
      if (responseAuth) {
        return responseAuth.data;
      }
    } catch (error) {
      console.log('error', error);
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
