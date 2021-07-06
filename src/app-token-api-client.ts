import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
// @ts-ignore
import qs from 'qs';
import { AuthComponent } from '.';
import { AuthApiClient } from './auth-api-client';

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

const attachTokenToRequest = (request: AxiosRequestConfig, token?: string) => {
  request.headers.Authorization = 'Bearer ' + token;
};

const fetchAppAccessToken = async (): Promise<string> => {
  const configs = AuthComponent.instance().getConfigs();
  const body = qs.stringify({
    grant_type: configs.grantType ?? 'client_credentials',
    scope: configs.scope ?? 'PRODUCTION',
  });
  const response = await AuthApiClient.instance().getAuthApiClient().post('', body);
  return response.data.access_token;
};

export const createAppTokenApiClient = (baseURL: string) => {
  const options = {
    attachTokenToRequest,
    fetchAppAccessToken,
    shouldIntercept,
  };
  let appToken: string;

  const instance = axios.create({
    baseURL,
  });

  const processQueue = (error: any, accessToken?: string) => {
    failedQueue.forEach((prom: any) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(accessToken);
      }
    });
    failedQueue = [];
  };

  const onRequest = async (request: AxiosRequestConfig) => {
    if (!appToken) {
      appToken = await fetchAppAccessToken();
    }
    request.headers.Authorization = `Bearer ${appToken}`;
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
      return new Promise<string>(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((accessToken) => {
          if (isRefreshed) {
            originalRequest.queued = true;
            options.attachTokenToRequest(originalRequest, accessToken);
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
        .fetchAppAccessToken()
        .then((accessToken) => {
          options.attachTokenToRequest(originalRequest, accessToken);
          isRefreshed = true;
          processQueue(null, accessToken);
          resolve(axios.request(originalRequest));
        })
        .catch(async (_) => {
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
