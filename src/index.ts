import { DeviceEventEmitter } from 'react-native';
import { authApiClient } from './services/api-clients/AuthApiClient';
import { authService } from './services/AuthService';
import { AuthComponentConfig } from './types';

export class AuthComponent {
  private static _instance: AuthComponent = new AuthComponent();

  private _configs?: AuthComponentConfig;

  constructor() {
    if (AuthComponent._instance) {
      throw new Error('Error: Instantiation failed: Use AuthComponent.instance() instead of new.');
    }
    AuthComponent._instance = this;
  }

  public static instance(): AuthComponent {
    return AuthComponent._instance;
  }

  public configure(configs: AuthComponentConfig) {
    return new Promise<void>((resolve) => {
      this._configs = configs;
      // Configure the authApiClient and authService with the provided configs
      authApiClient.configure(configs);
      authService.configure(configs);
      resolve();
    });
  }

  public getConfigs() {
    if (this._configs === undefined) {
      throw new Error('Error: AuthComponent must be configured before using');
    }
    return this._configs;
  }

  public addSessionListener(listener: (data: any) => void) {
    DeviceEventEmitter.addListener('authcomponent.session.expired', listener);
  }

  public removeSessionListener(listener: (...args: any[]) => any) {
    DeviceEventEmitter.removeListener('authcomponent.session.expired', listener);
  }
}
