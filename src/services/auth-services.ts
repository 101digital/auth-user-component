// @ts-ignore
import qs from 'qs';
import authComponentStore from '../store';
import axios from 'axios';
import { AuthComponentConfig } from '..';
import { AuthApiClient } from '../api-client/auth-api-client';

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

  public login = async (
    username: string,
    password: string,
    grant_type = 'password',
    scope = 'openid'
  ) => {
    const body = qs.stringify({
      grant_type,
      username,
      password,
    });
    const response = await AuthApiClient.instance().getAuthApiClient().post('', body, {
      params: {
        scope,
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
    await authComponentStore.clearTokens();
  };

  fetchAppAccessToken = async () => {
    const { grantType, scope } = this._configs!;
    const body = qs.stringify({
      grant_type: grantType ?? 'client_credentials',
      scope: scope ?? 'PRODUCTION',
    });
    const response = await AuthApiClient.instance().getAuthApiClient().post('', body);
    return response.data.access_token;
  };
}
