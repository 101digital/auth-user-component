import { DeviceEventEmitter, EmitterSubscription } from 'react-native';
import { AuthApiClient } from './api-client/auth-api-client';
import { AuthServices } from './services/auth-services';
import { AuthComponentConfig } from './types';

let dListener:EmitterSubscription;
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
      AuthApiClient.instance().configure(configs);
      AuthServices.instance().configure(configs);
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
    dListener = DeviceEventEmitter.addListener('authcomponent.session.expired', listener);
  }

  public removeSessionListener(listener: (...args: any[]) => any) {
    if (!dListener) {
      return;
    }
    dListener.remove();
  }
}
