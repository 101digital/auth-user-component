import { Base64 } from 'js-base64';
import { AuthComponentConfig } from '../types';
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

  public configure(configs: AuthComponentConfig) {
    if (!this._axiosInstance) {
      const { authBaseUrl, appPublicId, appPublicSecret } = configs;
      console.log('configure -> appPublicId', appPublicId);
      console.log('configure -> appPublicSecret', appPublicSecret);
      this._axiosInstance = axios.create({
        baseURL: authBaseUrl,
        headers: {
          Authorization: `Basic ${Base64.encode(`${appPublicId}:${appPublicSecret}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    }
  }

  public getAuthApiClient = () => {
    return this._axiosInstance!;
  };
}
