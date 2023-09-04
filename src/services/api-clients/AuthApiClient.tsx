import axios, { AxiosInstance } from 'axios';
class AuthApiClient {
  private static _instance: AuthApiClient;
  private _axiosInstance?: AxiosInstance;

  private constructor() {}

  public static getInstance(): AuthApiClient {
    if (!AuthApiClient._instance) {
      AuthApiClient._instance = new AuthApiClient();
    }
    return AuthApiClient._instance;
  }

  public configure(configs: { authBaseUrl: string; envId: string }) {
    if (!this._axiosInstance) {
      const AUTH_BASE_URL = `${configs.authBaseUrl}${configs.envId}`;
      this._axiosInstance = axios.create({
        baseURL: AUTH_BASE_URL,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  }

  public getApiClient(): AxiosInstance {
    if (!this._axiosInstance) {
      throw new Error('Error: API client is not configured. Call configure() first.');
    }
    return this._axiosInstance;
  }
}

export const authApiClient = AuthApiClient.getInstance();
