// @ts-ignore
import qs from 'qs';
import authComponentStore from './local-store';
import axios from 'axios';
import { AuthApiClient } from '../api-client/auth-api-client';
import { AuthComponentConfig } from '../types';
import { authorize } from 'react-native-app-auth';

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

  public fetchProfile = async () => {
    const { membershipBaseUrl } = this._configs!;
    const accessToken = await authComponentStore.getAccessToken();
    const response = await axios.get(`${membershipBaseUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
    const response = await AuthApiClient.instance().getAuthApiClient().post('', body);
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
        Authorization: `Bearer ${accessToken}`,
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
      clientSecret,
      tokenBaseUrl,
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
      clientSecret,
      redirectUrl: redirectUrl,
      scopes: [authScope ?? 'openid'],
      serviceConfiguration: {
        authorizationEndpoint: authorizationBaseUrl,
        tokenEndpoint: tokenBaseUrl,
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
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };

  recoveryUserPassword = async (mobileNumber: string) => {
    const { identityBaseUrl } = this._configs!;
    const accessToken = await this.fetchAppAccessToken();
    const response = await axios.get(`${identityBaseUrl}/users/${mobileNumber}/recovery-options`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
        Authorization: `Bearer ${publicAppToken}`,
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
          Authorization: `Bearer ${publicAppToken}`,
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
    const publicAppToken = await this.fetchAppAccessToken();
    const body = {
      entityId,
      appId,
      userId,
      token,
      platform,
    };
    const response = await axios.post(`${notificationBaseUrl}/devices`, body, {
      headers: {
        Authorization: `Bearer ${publicAppToken}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  };
}
