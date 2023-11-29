// AuthService.ts
import { authApiClient } from './api-clients/AuthApiClient';
import { getSecureData } from '@/utils/keychainStorage';

import axios from 'axios';

export default class AuthService {
  private static _instance: AuthService;
  private _configs?: any;

  private constructor() {}

  public configure(configs: any) {
    this._configs = configs;
  }

  public getLocale() {
    if (this._configs) {
      return this._configs.locale;
    }
  }

  public static get instance(): AuthService {
    if (!this._instance) {
      this._instance = new AuthService();
    }
    return this._instance;
  }

  public async login(username: string, password: string) {
    try {
      const { appId, codeChallenge, redirectUrl, codeVerifier } = this._configs || {};
      // Step 1: Authorize
      const authApiClientInstance = authApiClient.getApiClient(); // Get the Axios instance
      const authResponse = await authApiClientInstance.get(
        `/as/authorize?response_type=code&client_id=${appId}&scope=profilepsf&code_challenge=${codeChallenge}&code_challenge_method=S256&acr_values=Single_Factor&response_mode=pi.flow`
      );

      // get authResponse flowId
      const flowId = authResponse.data.id;

      // Step 2: Login
      const loginResponse = await authApiClientInstance.post(
        `/flows/${flowId}`,
        {
          username: username,
          password: password,
        },
        {
          headers: {
            'Content-Type': 'application/vnd.pingidentity.usernamePassword.check+json',
          },
        }
      );

      // get loginResponse resumeUrl
      const resumeUrl = loginResponse.data.resumeUrl;

      // Step 3: Resume
      const resumeResponse = await authApiClientInstance.get(resumeUrl);

      // get resumeResponse authCode
      const authCode = resumeResponse.data.authorizeResponse.code;

      // Step 4: Token
      const tokenResponse = await authApiClientInstance.post(
        '/as/token',
        {
          grant_type: 'authorization_code',
          code: authCode,
          client_id: appId,
          scope: 'openid profilepsf',
          code_verifier: codeVerifier,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      // get tokenResponse access_token
      const { access_token } = tokenResponse.data;
      return { access_token };
    } catch (error) {
      throw new Error('Authentication failed', error);
    }
  }

  public getEnterpriseData = async (keys: string[], locale: string) => {
    const { enterpriseDataServicesBaseUrl, apiBaseUrl } = this._configs || {};
    const listEDKeys = keys.map((k) => k.replace('EntData_', '')).join(',');

    const access_token = await getSecureData('access_token');

    const url = `${apiBaseUrl}${enterpriseDataServicesBaseUrl}/data-groups`;

    try {
      const response = await axios.get(url, {
        params: {
          detailsLevel: 'FULL',
          dataGroupCodes: listEDKeys,
          language: locale,
          pageSize: keys.length,
        },
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      return response.data;
    } catch (e) {
      console.log('e', e);
    }
  };
}

export const authService = AuthService.instance;
