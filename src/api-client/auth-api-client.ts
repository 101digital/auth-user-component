import { Base64 } from 'js-base64';
import { AuthComponentConfig } from '..';
import axios, { AxiosInstance } from 'axios';

export class AuthApiClient {
  private static _instance: AuthApiClient = new AuthApiClient();

  private _axiosInstance?: AxiosInstance;

  constructor() {
    if (AuthApiClient._instance) {
      throw new Error('Error: Instantiation failed: Use AuthComponent.instance() instead of new.');
    }
    AuthApiClient._instance = this;
  }

  public static instance(): AuthApiClient {
    return AuthApiClient._instance;
  }

  public initClient(configs: AuthComponentConfig) {
    if (!this._axiosInstance) {
      const { tokenBaseUrl, ternantDomain, clientId, clientSecret } = configs;
      const baseURL = `${tokenBaseUrl}?tenantDomain=${ternantDomain}`;
      this._axiosInstance = axios.create({
        baseURL,
        headers: {
          Authorization: `Basic ${Base64.encode(`${clientId}:${clientSecret}`)}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
      });
    }
  }

  public getAuthApiClient = () => {
    return this._axiosInstance!;
  };
}
