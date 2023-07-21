import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { DeviceEventEmitter, Platform } from 'react-native';
import { AuthServices } from '../services/auth-services';
import DeviceInfo from 'react-native-device-info';
import { ONE_TIME_TOKEN_KEY } from '../types';

type TokenData = {
  accessToken?: string;
  orgToken?: string;
  refreshToken?: string;
};
let failedQueue: any = [];

type OriginalRequest = AxiosRequestConfig & { retry?: boolean; queued?: boolean };

const shouldIntercept = (error: AxiosError) => {
  try {
    return error.response?.status === 401 || error.response?.status === 403;
  } catch (e) {
    return false;
  }
};

const attachTokenToRequest = (
  request: AxiosRequestConfig,
  token?: string,
  orgToken?: string,
  withOrgToken?: boolean
) => {
  request.headers.Authorization = token;
  if (withOrgToken) {
    request.headers['org-token'] = orgToken;
  }
};

const forceLogout = async () => {
  DeviceEventEmitter.emit('authcomponent.session.expired');
};

export const createAuthorizedApiClient = (baseURL: string) => {
  const options = {
    attachTokenToRequest,
    shouldIntercept,
    forceLogout,
  };

  const instance = axios.create({
    baseURL,
  });

  const processQueue = (error: any, accessToken?: string, orgToken?: string) => {
    failedQueue.forEach((prom: any) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve({ accessToken, orgToken });
      }
    });
    failedQueue = [];
  };

  const onRequest = async (request: AxiosRequestConfig) => {
    let authBearer = AuthServices.instance().getAccessToken();

    if (request.headers[ONE_TIME_TOKEN_KEY]) {
      authBearer = request.headers[ONE_TIME_TOKEN_KEY];
      request.headers[ONE_TIME_TOKEN_KEY] = '';
      delete request.headers[ONE_TIME_TOKEN_KEY];
    }

    const httpClient = 'Axios';
    const platform = `${Platform.OS}/${DeviceInfo.getSystemVersion()}`;
    const security = 'U';
    const os = `${
      Platform.OS === 'ios' ? 'ios' : DeviceInfo.getBaseOsSync()
    }/${DeviceInfo.getSystemVersion()}`;
    const localization = AuthServices.instance().getLocale();
    const mobileAppNameAndVersion = `${DeviceInfo.getApplicationName()}/${DeviceInfo.getVersion()}`;
    const mobilePingDeviceId = AuthServices.instance().getDeviceId();

    if (authBearer) {
      request.headers.Authorization = `${authBearer}`;
      request.headers[
        'user-agent'
      ] = `${httpClient} (${platform} ; ${security} ; ${os} ; ${localization} ; ${mobileAppNameAndVersion} DeviceId:${mobilePingDeviceId})`;
    }
    return request;
  };

  const onResponseSuccess = (response: AxiosResponse) => {
    if (response.request?.headers?.[ONE_TIME_TOKEN_KEY]) {
      AuthServices.instance().storeOTT('');
    }
    if(response.message === 'Network Error') {
      DeviceEventEmitter.emit('network_error');
    }
    return response;
  };

  const onResponseFailed = (error: AxiosError) => {
    if(error.message === 'Network Error') {
      DeviceEventEmitter.emit('network_error');
    }
    throw error;
  };

  instance.interceptors.request.use(onRequest);
  instance.interceptors.response.use(onResponseSuccess, onResponseFailed);

  return instance;
};
