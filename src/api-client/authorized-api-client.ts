import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { DeviceEventEmitter } from 'react-native';
import { AuthServices } from '../services/auth-services';
import authComponentStore from '../services/local-store';

type TokenData = {
  accessToken?: string;
  orgToken?: string;
  refreshToken?: string;
};

let isRefreshed = false;
let isRefreshing = false;
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
  request.headers.Authorization = 'Bearer ' + token;
  if (withOrgToken) {
    request.headers['org-token'] = orgToken;
  }
};

const refreshTokens = async () => {
  const refreshToken = await authComponentStore.getRefreshToken();
  return new Promise<TokenData>((resolve, reject) => {
    AuthServices.instance()
      .refreshToken(refreshToken ?? '')
      .then(async ({ refresh_token, access_token }) => {
        const { orgToken } = await AuthServices.instance().fetchProfile();
        return [refresh_token, access_token, orgToken];
      })
      .then(([refresh_token, access_token, orgToken]) => {
        resolve({
          accessToken: access_token,
          refreshToken: refresh_token,
          orgToken,
        });
      })
      .catch((err) => reject(err));
  });
};

const forceLogout = async () => {
  DeviceEventEmitter.emit('authcomponent.session.expired');
};

export const createAuthorizedApiClient = (baseURL: string, withOrgToken: boolean = false) => {
  const options = {
    attachTokenToRequest,
    refreshTokens,
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
    const authBearer = await authComponentStore.getAccessToken();
    const orgToken = await authComponentStore.getOrgToken();
    if (authBearer) {
      request.headers.Authorization = `Bearer ${authBearer}`;
    }
    if (withOrgToken) {
      request.headers['org-token'] = orgToken;
    }
    return request;
  };

  const onResponseSuccess = (response: AxiosResponse) => response;

  const onResponseError = async (axiosError: AxiosError) => {
    if (!options.shouldIntercept(axiosError)) {
      return Promise.reject(axiosError);
    }
    const originalRequest: OriginalRequest = { ...axiosError.config };

    if (originalRequest.retry || originalRequest.queued) {
      return Promise.reject(axiosError);
    }

    if (isRefreshing) {
      return new Promise<TokenData>(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((data) => {
          if (isRefreshed) {
            originalRequest.queued = true;
            options.attachTokenToRequest(
              originalRequest,
              data.accessToken,
              data.orgToken,
              withOrgToken
            );
            return axios.request(originalRequest);
          }
        })
        .catch((_) => {
          return Promise.reject(axiosError);
        });
    }
    isRefreshing = true;
    originalRequest.retry = true;
    return new Promise((resolve, reject) => {
      options
        .refreshTokens()
        .then((data) => {
          options.attachTokenToRequest(
            originalRequest,
            data.accessToken,
            data.orgToken,
            withOrgToken
          );
          isRefreshed = true;
          processQueue(null, data.accessToken, data.orgToken);
          resolve(axios.request(originalRequest));
        })
        .catch(async (_) => {
          await options.forceLogout();
          processQueue(axiosError);
          reject(axiosError);
        })
        .finally(() => {
          isRefreshing = false;
          isRefreshed = false;
        });
    });
  };

  instance.interceptors.request.use(onRequest);
  instance.interceptors.response.use(onResponseSuccess, onResponseError);

  return instance;
};
