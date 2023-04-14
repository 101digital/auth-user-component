// @ts-ignore
import qs from 'qs';
import authComponentStore from './local-store';
import axios from 'axios';
import { AuthApiClient } from '../api-client/auth-api-client';
import { AuthComponentConfig } from '../types';
import { authorize } from 'react-native-app-auth';
import { Base64 } from 'js-base64';
import { PASSPORT } from 'react-native-auth-component/src/utils';

export class AuthServices {
  private static _instance: AuthServices = new AuthServices();

  private _configs?: AuthComponentConfig;

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

  public adbLogin = async (
    username: string,
    password: string,
    clientIdInit?: string,
    scope?: string,
    acr_values = 'Multi_Factor'
  ) => {
    const { clientId, redirectUrl, responseType, responseMode } = this._configs || {};
    const responseAuth = await AuthApiClient.instance()
      .getAuthApiClient()
      .get('as/authorize', {
        params: {
          response_type: responseType,
          client_id: clientIdInit ? clientIdInit : clientId,
          scope: scope ? scope : 'openid profilep',
          code_challenge:
            'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
          redirect_uri: redirectUrl,
          response_mode: responseMode,
          acr_values: 'Single_Factor',
        },
        headers: {
          Cookie:
            'ST=8cadd807-93c8-4208-8852-ca690b2617a6; ST-NO-SS=8cadd807-93c8-4208-8852-ca690b2617a6',
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
    const { redirectUrl } = this._configs || {};
    const body = qs.stringify({
      grant_type: 'authorization_code',
      code: authorizeCode,
      redirect_uri: redirectUrl,
      scope: 'openid  profilep',
      code_verifier: 'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
    });

    const response = await AuthApiClient.instance()
      .getAuthApiClient()
      .post('as/token', body, {
        headers: {
          Authorization: `Basic ${Base64.encode(
            `${'3de6d91d-29f9-444b-8e26-770c4a236d79'}:${'8Gafe42ZOiJipKrAqY1U-cPPZ-SAywfezFLbAmuFultDmuv9F.6WWVTvKjudC_zy'}`
          )}`,
        },
      });

    await authComponentStore.storeAccessToken(response.data.access_token);

    return {
      access_token: response.data.access_token,
      refresh_token: '',
    };
  };

  public getLoginHintToken = async () => {
    const { identityPingUrl } = this._configs || {};

    const access_token = await authComponentStore.getAccessToken();
    const responseTokenHint = await axios.get(`${identityPingUrl}/users/loginhint`, {
      headers: {
        Authorization: `${access_token}`,
      },
    });

    return responseTokenHint.data.data[0].token;
  };

  public getPairingCode = async () => {
    const { identityPingUrl } = this._configs || {};

    const access_token = await authComponentStore.getAccessToken();
    const responseTokenHint = await axios.get(`${identityPingUrl}/users/loginhint`, {
      headers: {
        Authorization: `${access_token}`,
      },
    });

    return responseTokenHint.data.data[0].pairingCode;
  };

  public obtainTokenSingleFactor = async (authorizeCode: string, scope?: string) => {
    const { redirectUrl, clientId, authBaseUrl } = this._configs || {};
    const body = qs.stringify({
      grant_type: 'authorization_code',
      code: authorizeCode,
      redirect_uri: redirectUrl,
      scope: scope ? scope : 'openid  profilep',
      code_verifier: 'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
      client_id: clientId,
    });

    const response = await axios.post(`${authBaseUrl}/as/token`, body);
    const access_token = response.data.access_token;
    await authComponentStore.storeAccessToken(response.data.access_token);

    return {
      access_token: response.data.access_token,
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
    const { access_token, refresh_token } = response.data;
    await authComponentStore.storeAccessToken(access_token);
    await authComponentStore.storeRefreshToken(refresh_token);
    return response.data;
  };

  public refreshToken = async (refreshToken: string, grant_type = 'refresh_token') => {
    const body = qs.stringify({ grant_type, refresh_token: refreshToken });
    const response = await AuthApiClient.instance().getAuthApiClient().post('', body);
    const { access_token, refresh_token } = response.data;
    await authComponentStore.storeAccessToken(access_token);
    await authComponentStore.storeRefreshToken(refresh_token);
    return response.data;
  };

  public adbAuthorizeToken = async (token: string) => {
    const { redirectUrl } = this._configs!;
    try {
      const body = qs.stringify({
        response_type: 'code',
        client_id: '0eb2b7cf-1817-48ec-a62d-eae404776cff',
        redirect_uri: redirectUrl,
        scope: 'openid profile profilep',
        code_challenge:
          'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
        response_mode: 'pi.flow',
        login_hint_token: token,
      });

      await AuthApiClient.instance().getAuthApiClient().post('as/authorize', body);
      return true;
    } catch (error) {
      console.log('error', error);
      return false;
    }
  };

  public adbRefreshToken = async () => {
    const loginHintToken = await this.getLoginHintToken();
    const { redirectUrl } = this._configs!;
    const body = qs.stringify({
      response_type: 'code',
      client_id: '0eb2b7cf-1817-48ec-a62d-eae404776cff',
      redirect_uri: redirectUrl,
      scope: 'openid profile profilep',
      code_challenge: 'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
      response_mode: 'pi.flow',
      login_hint_token: loginHintToken,
    });
    const responseAuthorize = await AuthApiClient.instance()
      .getAuthApiClient()
      .post('as/authorize', body);

    return await this.obtainTokenSingleFactor(responseAuthorize.data.id);
  };

  public fetchProfile = async () => {
    const { membershipBaseUrl } = this._configs!;
    const accessToken = await authComponentStore.getAccessToken();
    const response = await axios.get(`${membershipBaseUrl}/users/me`, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    const { data } = response.data;
    const organisationUser = data?.memberships?.filter((el: any) => el.organisationName);
    const memberShip = organisationUser?.length > 0 ? organisationUser[0] : data?.memberships[0];
    await authComponentStore.storeOrgToken(memberShip?.token ?? '');
    return { orgToken: memberShip?.token ?? undefined, data };
  };

  logout = async () => {
    await authComponentStore.clearAuths();
  };

  fetchAppAccessToken = async () => {
    const body = qs.stringify({
      grant_type: this._configs?.appGrantType ?? 'client_credentials',
      scope: this._configs?.appScope ?? 'PRODUCTION',
    });
    const response = await AuthApiClient.instance().getAuthApiClient().post('as/token', body);
    return response.data.access_token;
  };

  updateProfile = async (
    userId: string,
    firstName: string,
    lastName: string,
    profilePicture?: string
  ) => {
    const { membershipBaseUrl } = this._configs!;
    const accessToken = await authComponentStore.getAccessToken();
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
    const { identityBaseUrl } = this._configs!;
    const accessToken = await authComponentStore.getAccessToken();
    const body = {
      currentPassword,
      newPassword,
      confirmNewPassword,
    };

    const response = await axios.put(`${identityBaseUrl}/users/passwords`, body, {
      headers: {
        Authorization: `${accessToken}`,
      },
    });
    return response.data;
  };

  recoveryUserPassword = async (mobileNumber: string) => {
    const { identityBaseUrl } = this._configs!;
    const accessToken = await this.fetchAppAccessToken();
    const response = await axios.get(`${identityBaseUrl}/users/${mobileNumber}/recovery-options`, {
      headers: {
        Authorization: `${accessToken}`,
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

  registerDevice = async (
    token: string,
    platform: 'IOS' | 'Android',
    userId: string,
    appId: string,
    entityId: string
  ) => {
    const { notificationBaseUrl } = this._configs!;
    const accessToken = await authComponentStore.getAccessToken();
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
    idType?: string
  ) => {
    const { membershipBaseUrl } = this._configs!;
    const accessToken = await authComponentStore.getAccessToken();
    let body = {};
    let fistName = 'fistName';
    let lastName = 'lastName';
    const arrName = fullName.split(' ');
    if (arrName.length > 0) {
      lastName = arrName[arrName.length - 1];
      fistName = arrName.slice(0, arrName.length - 1).join(' ');
    }
    const updateInfoPayload = {
      fullName: fullName,
      nickName: nickname,
      firstName: fistName,
      lastName: lastName,
    };
    if (idType === PASSPORT) {
      body = {
        ...updateInfoPayload,
        kycDetails: {
          altIdNumber: id,
          idType,
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
    const { clientId, redirectUrl, responseType, responseMode } = this._configs || {};
    try {
      const responseAuth = await AuthApiClient.instance()
        .getAuthApiClient()
        .get('as/authorize', {
          params: {
            response_type: responseType,
            client_id: clientIdInit ? clientIdInit : clientId,
            scope: scope ? scope : 'openid profilep',
            code_challenge:
              'mjc9QqK3PHOoW4gAU6mTtd0MMrcDzmilXfePfCFtO5K33rzALUimBrwsuoigelpiNqzN7IOSOQ',
            redirect_uri: redirectUrl,
            response_mode: responseMode,
            acr_values: 'Push_Only',
            login_hint_token: loginHintToken,
          },
          headers: {
            Cookie:
              'ST=8cadd807-93c8-4208-8852-ca690b2617a6; ST-NO-SS=8cadd807-93c8-4208-8852-ca690b2617a6',
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
}
