// AuthService.ts
import { authApiClient } from './api-clients/AuthApiClient';
import { removeToken } from '../utils/keychainStorage';

class AuthService {
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
      const { appId, codeChallenge,redirectUrl,codeVerifier } = this._configs || {};
      // Step 1: Authorize
      const authApiClientInstance = authApiClient.getApiClient(); // Get the Axios instance
      const authResponse = await authApiClientInstance.get(
        `/as/authorize?response_type=code&client_id=${appId}&scope=profilepsf&code_challenge=${codeChallenge}&code_challenge_method=S256&acr_values=Single_Factor&redirect_uri=${redirectUrl}&response_mode=pi.flow`
      );

      // get authResponse flowId
      const flowId = authResponse.data.id;

      // Step 2: Login
      const loginResponse = await authApiClientInstance.post(`/flows/${flowId}`, {
        username: username,
        password: password,
      },{
        headers: {
          'Content-Type': 'application/vnd.pingidentity.usernamePassword.check+json',
        },
      });

      // get loginResponse resumeUrl
      const resumeUrl = loginResponse.data.resumeUrl;

      // Step 3: Resume
      const resumeResponse = await authApiClientInstance.get(resumeUrl);

      // get resumeResponse authCode
      const authCode = resumeResponse.data.authorizeResponse.code;

      // Step 4: Token
      const tokenResponse = await authApiClientInstance.post('/as/token', {
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: redirectUrl,
        client_id: appId,
        scope: 'profilepsf',
        code_verifier: codeVerifier,
      },{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      // get tokenResponse access_token
      const { access_token } = tokenResponse.data;
      return { access_token };
    } catch (error) {
      throw new Error('Authentication failed', error);
    }
  }
}

export const authService = AuthService.instance;
