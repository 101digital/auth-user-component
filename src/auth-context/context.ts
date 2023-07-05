import {
  Profile,
  ProfileCustomField,
  CountryInformation,
  Recovery,
  VerificationMethod,
  Devices,
} from '../types';
import authComponentStore from '../services/local-store';
import React, { useCallback, useEffect } from 'react';
import { useMemo, useState } from 'react';
import { AuthServices } from '../services/auth-services';
import _ from 'lodash';
import { NativeModules, Platform } from 'react-native';
import { SINGLE_FACTOR_ACR_VALUE, SINGLE_FACTOR_SCOPE } from '../utils';

export interface AuthContextData {
  profile?: Profile;
  recovery?: Recovery;
  profilePicture?: string;
  isSignedIn: boolean;
  isSigning: boolean;
  errorSignIn?: Error;
  login: (
    username: string,
    password: string,
    country?: CountryInformation
  ) => Promise<Profile | undefined>;
  loginOAuth2: () => Promise<Profile | undefined>;
  logout: () => void;
  clearSignInError: () => void;
  updateProfile: (userId: string, data: any) => Promise<boolean>;
  fetchProfile: (onSuccess?: (data?: Profile) => void) => void;
  isUpdatingProfile?: boolean;
  errorUpdateProfile?: Error;
  clearUpdateProfileError: () => void;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
    handleResponse: (response: any) => void
  ) => void;
  validateUserForgotPassword: (email: string, nric: string) => Promise<boolean>;
  changeUserPasswordUsingRecoveryCode: (
    recoveryCode: string,
    newPassword: string,
    flowId: string
  ) => Promise<boolean>;
  adbForgotPasswordVerifyOtp: (otp: string, flowId: string) => Promise<boolean>;
  isChangingPassword: boolean;
  isChangePassword: boolean;
  errorChangePassword?: Error;
  requestResetUserPassword: (recoveryData?: Recovery) => Promise<boolean | undefined>;
  saveUserPhoneNumber: (phoneNumber: string) => void;
  recoveryUserPassword: () => Promise<{ data: Recovery[] } | undefined>;
  clearRecoveryUserPasswordError: () => void;
  errorRecoveryUserPassword?: Error;
  isRecoveringUserPassword: boolean;
  isRequestingResetUserPassword: boolean;
  setNewPassword?: React.Dispatch<React.SetStateAction<string>>;
  userMobileNumber?: string;
  saveUserNewPassword?: (newPassword: string) => void;
  requestRecoveryPassword: (verificationCode: string) => Promise<boolean>;
  isVerifying: boolean;
  isChangePasswordSuccess: boolean;
  errorUserVerify?: Error;
  errorRequestResetPassword?: Error;
  clearUserVerificationData: () => void;
  registerDevice: (
    token: string,
    platform: 'IOS' | 'Android'
  ) => Promise<boolean>;
  isDeviceRegistering: boolean;
  isDeviceRegistered: boolean;
  updateUserInfo: (
    userId: string,
    fullName: string,
    nickName: string,
    id: string,
    idType?: string,
    idIssuingCountry?: string,
    onError?: (err: Error) => void
  ) => Promise<boolean>;
  adbLogin: (username: string, password: string) => Promise<boolean>;
  isVerifyLogin: boolean;
  errorVerifySignIn?: Error;
  adbLoginVerifyOtp: (otp: string) => Promise<boolean>;
  adbResendOTP: () => void;
  adbLoginSingleFactor: (
    username: string,
    password: string,
    isSkipLogged?: boolean
  ) => Promise<string | undefined>;
  flowId?: string;
  isManualLogin: boolean;
  setIsManualLogin: (isManual: boolean) => void;
  isValidatedSubsequenceLogin: boolean;
  setIsValidatedSubsequenceLogin: (isValidated: boolean) => void;
  verifyPassword: (password: string) => Promise<boolean>;
  adbGetAccessToken: (username: string, password: string) => Promise<void>;
  pairingDevice: () => Promise<void>;
  adbAuthorizePushOnly: () => Promise<boolean>;
  obtainNewAccessToken: () => Promise<boolean>;
  saveResumeURL: (url: string) => void;
  reSelectDevice: () => Promise<boolean | undefined>;

  //rebinding
  getListDevices: () => Promise<Devices[] | undefined>;
  deleteDevice: (deviceId: string) => Promise<boolean>;
  updateUserStatus: (status: string) => Promise<boolean>;
  isUpdatingUserStatus: boolean;
  errorRebindedDevice?: Error;
  setIsSignedIn: (isLogged: boolean) => void;
  userMobileNumberHint?: string;
  currentVerificationMethod: VerificationMethod;
  setCurrentVerificationMethod: (method: VerificationMethod) => void;
  isReselectingDevice: boolean;
  clearErrorVerifySignIn: () => void;
  getNotificationBadge: () => void;
  badgeNumber: number;
  getNotifications: (pageNumber: number) => void;
  updateReadNotifications: (notificationId: string) => void;
  notificationData: any;
}

export const authDefaultValue: AuthContextData = {
  isSignedIn: false,
  isSigning: false,
  errorSignIn: undefined,
  login: async () => undefined,
  loginOAuth2: async () => undefined,
  logout: () => null,
  clearSignInError: () => null,
  updateProfile: async () => false,
  fetchProfile: async () => false,
  clearUpdateProfileError: () => null,
  changeUserPassword: async () => false,
  validateUserForgotPassword: async () => false,
  changeUserPasswordUsingRecoveryCode: async () => false,
  adbForgotPasswordVerifyOtp: async () => false,
  requestResetUserPassword: async () => false,
  isChangingPassword: false,
  isChangePassword: false,
  errorChangePassword: undefined,
  saveUserPhoneNumber: () => false,
  recoveryUserPassword: async () => undefined,
  clearRecoveryUserPasswordError: () => null,
  errorRecoveryUserPassword: undefined,
  isRecoveringUserPassword: false,
  isRequestingResetUserPassword: false,
  setNewPassword: undefined,
  userMobileNumber: undefined,
  saveUserNewPassword: undefined,
  requestRecoveryPassword: async () => false,
  isVerifying: false,
  isChangePasswordSuccess: false,
  errorUserVerify: undefined,
  errorRequestResetPassword: undefined,
  clearUserVerificationData: () => null,
  registerDevice: async () => false,
  isDeviceRegistering: false,
  isDeviceRegistered: false,
  updateUserInfo: async () => false,
  adbLogin: async () => false,
  isVerifyLogin: false,
  adbLoginVerifyOtp: async () => false,
  adbResendOTP: () => false,
  adbLoginSingleFactor: async () => undefined,
  isManualLogin: false,
  setIsManualLogin: () => undefined,
  isValidatedSubsequenceLogin: false,
  setIsValidatedSubsequenceLogin: () => undefined,
  verifyPassword: async () => false,
  adbGetAccessToken: async () => undefined,
  pairingDevice: async () => undefined,
  adbAuthorizePushOnly: async () => false,
  obtainNewAccessToken: async () => false,
  saveResumeURL: () => false,
  getListDevices: async () => undefined,
  deleteDevice: async () => false,
  updateUserStatus: async () => false,
  setIsSignedIn: () => undefined,
  isUpdatingUserStatus: false,
  currentVerificationMethod: VerificationMethod.PENDING,
  setCurrentVerificationMethod: () => false,
  reSelectDevice: async () => undefined,
  isReselectingDevice: false,
  clearErrorVerifySignIn: () => false,
  getNotificationBadge: async () => false,
  badgeNumber: 0,
  getNotifications: async () => false,
  updateReadNotifications: async () => false,
  notificationData: false,
};

export const AuthContext = React.createContext<AuthContextData>(authDefaultValue);

export const useAuthContextValue = (): AuthContextData => {
  const [_profile, setProfile] = useState<Profile | undefined>(undefined);
  const [_recovery, setRecovery] = useState<Recovery | undefined>(undefined);
  const [_isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [_isSigning, setIsSigning] = useState<boolean>(false);
  const [_errorSignIn, setErrorSignIn] = useState<Error | undefined>();
  const [_profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [_errorUpdateProfile, setErrorUpdateProfile] = useState<Error | undefined>();
  const [_isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

  const [_isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [_errorChangePassword, setErrorChangePassword] = useState<Error | undefined>();
  const [_isChangePassword, setIsChangePassword] = useState<boolean>(false);
  const [_isRecoveringUserPassword, setIsRecoveringUserPassword] = useState<boolean>(false);
  const [_errorRecoveryUserPassword, setErrorRecoveryUserPassword] = useState<Error | undefined>();

  const [_isRequestingResetPassword, setIsRequestingResetPassword] = useState<boolean>(false);
  const [_errorRequestResetPassword, setErrorRequestResetPassword] = useState<Error | undefined>();
  const [_userNewPassword, setUserNewPassword] = useState<string>('');

  const [_userMobileNumber, setUserMobileNumber] = useState<string>('');
  const [_isVerifying, setIsVerifying] = useState<boolean>(false);
  const [_errorUserVerify, setErrorUserVerify] = useState<Error | undefined>();
  const [_isChangePasswordSuccess, setIsChangePasswordSuccess] = useState<boolean>(false);

  const [_isDeviceRegistering, setIsDeviceRegistering] = useState<boolean>(false);
  const [_isDeviceRegistered, setIsDeviceRegistered] = useState<boolean>(false);
  const [_flowId, setFlowId] = useState<string>();
  const [_isVerifyLogin, setIsVerifyLogin] = useState<boolean>(false);
  const [_errorVerifySignIn, setErrorVerifySignIn] = useState<Error | undefined>();
  const [_username, setUsername] = useState<string>();
  const [_password, setPassword] = useState<string>();
  const [_isManualLogin, setIsManualLogin] = useState<boolean>(false);
  const [_isValidatedSubsequenceLogin, setIsValidatedSubsequenceLogin] = useState<boolean>(false);
  const [_resumeURL, saveResumeURL] = useState<string>();
  const [_errorRebindedDevice, setErrorRebindedDevice] = useState<Error | undefined>();
  const [_listBindedDevices, setListBindedDevices] = React.useState<Devices[]>();
  const [_isUpdatingUserStatus, setIsUpdatingUserStatus] = useState<boolean>(false);
  const [_userMobileNumberHint, setUserMobileNumberHint] = useState<string>();
  const [_currentVerificationMethod, setCurrentVerificationMethod] = useState<VerificationMethod>(
    VerificationMethod.PENDING
  );
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [_isReselectingDevice, setIsReselectingDevice] = useState<boolean>(false);
  const [_badgeNumber, setbadgeNumber] = useState<number>(0);
  const [_notificationData, setNotificationData] = useState<any>(null);

  const { PingOnesdkModule } = NativeModules;

  useEffect(() => {
    checkIsLogged();
  }, []);

  const clearErrorVerifySignIn = () => {
    setErrorVerifySignIn(undefined);
  };

  const checkIsLogged = async () => {
    const isLogged = await authComponentStore.getIsUserLogged();
    setIsSignedIn(isLogged);
  };

  const loginOAuth2 = useCallback(async () => {
    try {
      setIsSigning(true);
      const { data } = await AuthServices.instance().fetchProfile();
      setProfile({ ...data });
      setIsSignedIn(true);
      getProfilePicture(data);
      setIsSigning(false);
      return { ...data };
    } catch (error) {
      setIsSigning(false);
      setErrorSignIn(error as Error);
      return undefined;
    }
  }, []);

  const login = useCallback(
    async (username: string, password: string, country?: CountryInformation) => {
      try {
        setIsSigning(true);

        await AuthServices.instance().login(username, password);
        const { data } = await AuthServices.instance().fetchProfile();
        await authComponentStore.storeIsUserLogged(true);
        setProfile({ ...data, country });
        setIsSignedIn(true);
        getProfilePicture(data);
        setIsSigning(false);
        return { ...data, country };
      } catch (error) {
        setIsSigning(false);
        setErrorSignIn(error as Error);
        return undefined;
      }
    },
    []
  );

  const adbLogin = useCallback(async (username: string, password: string) => {
    try {
      setIsSigning(true);
      const data = await AuthServices.instance().adbLogin(username, password);
      if (data && data.id) {
        setFlowId(data.id);
        if (data._embedded.devices?.length > 0) {
          const smsDevice = data._embedded.devices.find(
            (dvc: Devices) => dvc.type === 'SMS' && dvc.status === 'ACTIVE'
          );
          if (smsDevice) {
            setUserMobileNumberHint(smsDevice.phone);
          }
        }
        if (data.selectedDevice?.id) {
          setSelectedDeviceId(data.selectedDevice.id);
        }
        authComponentStore.storeUserName(username);
        setUsername(username);
        setPassword(undefined);
        setIsSigning(false);
        return data;
      }
    } catch (error) {
      setIsSigning(false);
      setErrorSignIn(error as Error);
      return false;
    }
    return false;
  }, []);

  const adbLoginVerifyOtp = useCallback(
    async (otp: string) => {
      try {
        setIsVerifyLogin(true);
        if (_flowId && _flowId.length > 0) {
          const loginData = await AuthServices.instance().adbVerifyLogin(otp, _flowId);
          if (!loginData.resumeUrl) {
            return false;
          }
          const afterValidateData = await AuthServices.instance().resumeUrl(loginData.resumeUrl);
          AuthServices.instance().setSessionId(afterValidateData.session.id);
          await AuthServices.instance().obtainToken(afterValidateData.authorizeResponse.code);
          const { data } = await AuthServices.instance().fetchProfile();
          setProfile({ ...data });
          setIsVerifyLogin(false);
          return true;
        }
      } catch (error) {
        setIsVerifyLogin(false);
        setErrorVerifySignIn(error as Error);
      }
      return false;
    },
    [_flowId]
  );

  const adbGetAccessToken = useCallback(async (username: string, password: string) => {
    try {
      const resLogin = await AuthServices.instance().adbLogin(
        username,
        password,
        SINGLE_FACTOR_SCOPE,
        SINGLE_FACTOR_ACR_VALUE
      );
      const resAfterValidate = await AuthServices.instance().resumeUrl(resLogin.resumeUrl);
      AuthServices.instance().setSessionId(resAfterValidate.session.id);
      await AuthServices.instance().obtainTokenSingleFactor(
        resAfterValidate.authorizeResponse.code,
        SINGLE_FACTOR_SCOPE
      );
    } catch (error) {}
  }, []);

  const adbLoginSingleFactor = useCallback(
    async (username: string, password: string, isSkipLogged?: boolean) => {
      try {
        setIsSigning(true);
        const resLogin = await AuthServices.instance().adbLogin(
          username,
          password,
          SINGLE_FACTOR_SCOPE,
          SINGLE_FACTOR_ACR_VALUE
        );
        if (resLogin.error) {
          return resLogin;
        } else {
          const resAfterValidate = await AuthServices.instance().resumeUrl(resLogin.resumeUrl);
          AuthServices.instance().setSessionId(resAfterValidate.session.id);
          await AuthServices.instance().obtainTokenSingleFactor(
            resAfterValidate.authorizeResponse.code
          );
          const { data } = await AuthServices.instance().fetchProfile();
          await authComponentStore.storeIsUserLogged(true);
          await authComponentStore.storeUserName(username);
          setPassword(undefined);
          setProfile({ ...data });
          if (!isSkipLogged) {
            setIsSignedIn(true);
          }

          setIsManualLogin(true);
          return resLogin;
        }
      } catch (error) {
        setErrorSignIn(error as Error);
        throw error;
      } finally {
        setIsSigning(false);
      }
    },
    []
  );

  const verifyPassword = useCallback(async (password: string) => {
    try {
      setIsSigning(true);
      if (_username) {
        const resLogin = await AuthServices.instance().adbLogin(
          _username,
          password,
          SINGLE_FACTOR_SCOPE,
          SINGLE_FACTOR_ACR_VALUE
        );
        if (resLogin.resumeUrl) {
          return true;
        }
      }
    } catch (error) {
      setErrorSignIn(error as Error);
      return false;
    } finally {
      setIsSigning(false);
    }
    return false;
  }, []);

  const adbResendOTP = useCallback(async () => {
    try {
      setIsSigning(true);
      if (_username && _username.length > 0 && _password && _password.length > 0) {
        const data = await AuthServices.instance().adbLogin(
          _username,
          _password,
          SINGLE_FACTOR_ACR_VALUE
        );
        if (data && data.id) {
          setFlowId(data.id);
        }
      }
    } catch (error) {
      setErrorSignIn(error as Error);
      return false;
    }
    setIsSigning(false);
    return true;
  }, [_username, _password]);

  const getProfilePicture = (profile: Profile) => {
    const profileImage = profile?.listCustomFields.filter((p: ProfileCustomField) => {
      return p.customKey === 'logo';
    });
    if (profileImage && profileImage.length > 0) {
      setProfilePicture(profileImage[0].customValue);
    }
  };

  const clearSignInError = useCallback(() => {
    setErrorSignIn(undefined);
  }, []);

  const logout = useCallback(async () => {
    AuthServices.instance().revokeToken();
    setCurrentVerificationMethod(VerificationMethod.PIN);
    setIsValidatedSubsequenceLogin(false);
  }, []);

  const updateProfile = useCallback(async (userId: string, profile: Profile) => {
    try {
      setIsUpdatingProfile(true);
      const response = await AuthServices.instance().updateProfile(userId, profile);
      setProfile(response.data);
      return true;
    } catch (error) {
      setErrorUpdateProfile(error as Error);
    } finally {
      setIsUpdatingProfile(false);
    }
    return false;
  }, []);

  const fetchProfile = useCallback(async (onSuccess?: (data: Profile) => void) => {
    try {
      setIsUpdatingProfile(true);
      const { data } = await AuthServices.instance().fetchProfile();
      setProfile(data);
      getProfilePicture(data);
      await authComponentStore.storeIsUserLogged(true);
      setIsUpdatingProfile(false);
      if (onSuccess) {
        onSuccess(data);
      }
      return true;
    } catch (error) {
      setIsUpdatingProfile(false);
      setErrorUpdateProfile(error as Error);
      return false;
    }
  }, []);

  const clearUpdateProfileError = useCallback(() => {}, []);

  const changeUserPassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      confirmNewPassword: string,
      handleResponse: (response: any) => void
    ) => {
      try {
        const response = await AuthServices.instance().changeUserPassword(
          currentPassword,
          newPassword,
          confirmNewPassword
        );
        handleResponse(response);
      } catch (error) {
        handleResponse(error?.response?.data?.errors);
      }
    },
    []
  );

  const validateUserForgotPassword = useCallback(async (email: string, nric: string) => {
    try {
      setIsRecoveringUserPassword(true);
      const response = await AuthServices.instance().validateUserForgotPassword(email, nric);
      setIsRecoveringUserPassword(false);
      return response;
    } catch (error) {
      setIsRecoveringUserPassword(false);
      return error?.response?.data?.errors;
    }
  }, []);

  const changeUserPasswordUsingRecoveryCode = useCallback(
    async (recoveryCode: string, newPassword: string, flowId: string) => {
      try {
        setIsRecoveringUserPassword(true);
        const response = await AuthServices.instance().changeUserPasswordUsingRecoveryCode(
          recoveryCode,
          newPassword,
          flowId
        );
        setIsRecoveringUserPassword(false);
        if (response && response.id) {
          if (response._embedded.devices?.length > 0) {
            const smsDevice = response._embedded.devices.find(
              (dvc: Devices) => dvc.type === 'SMS' && dvc.status === 'ACTIVE'
            );
            if (smsDevice) {
              setUserMobileNumberHint(smsDevice.phone);
            }
          }
        }
        return response;
      } catch (error) {
        setIsRecoveringUserPassword(false);
        return error?.response?.data;
      }
    },
    []
  );

  const adbForgotPasswordVerifyOtp = useCallback(async (otp: string, flowId: string) => {
    try {
      setIsVerifyLogin(true);
      if (flowId && flowId.length > 0) {
        const loginData = await AuthServices.instance().adbVerifyLogin(otp, flowId);
        setIsVerifyLogin(false);
        if (loginData.status === 'COMPLETED') {
          return true;
        }
      }
    } catch (error) {
      setIsVerifyLogin(false);
    }
    return false;
  }, []);

  const saveUserPhoneNumber = useCallback(async (mobileNumber: string) => {
    setUserMobileNumber(mobileNumber);
  }, []);

  const recoveryUserPassword = useCallback(async () => {
    try {
      setIsRecoveringUserPassword(true);
      const response = await AuthServices.instance().recoveryUserPassword(_userMobileNumber);
      if (response.data && response.data.length > 0) {
        setRecovery(response.data[0]);
      }
      return response;
    } catch (error) {
      setErrorRecoveryUserPassword(error as Error);
      return undefined;
    } finally {
      setIsRecoveringUserPassword(false);
    }
  }, [_userMobileNumber]);

  const saveUserNewPassword = useCallback((newPassword) => {
    setUserNewPassword(newPassword);
  }, []);

  const requestResetUserPassword = useCallback(
    async (recoveryData?: Recovery) => {
      try {
        setIsRequestingResetPassword(true);
        const recovery = recoveryData || _recovery;
        if (recovery) {
          const result = await AuthServices.instance().requestResetUserPassword(
            recovery.channelId,
            recovery.recoveryCode
          );
          if (result && result.resendCode) {
            setRecovery({
              ...recovery,
              recoveryCode: result.resendCode,
            });
          }
        }
        return true;
      } catch (error) {
        setErrorRequestResetPassword(error as Error);
        return undefined;
      } finally {
        setIsRequestingResetPassword(false);
      }
    },
    [_recovery]
  );

  const clearRecoveryUserPasswordError = useCallback(() => {
    setErrorRecoveryUserPassword(undefined);
  }, []);

  const clearUserVerificationData = useCallback(() => {
    setErrorUserVerify(undefined);
    setErrorRequestResetPassword(undefined);
    setIsChangePasswordSuccess(false);
  }, []);

  const requestRecoveryPassword = useCallback(
    async (otp: string) => {
      try {
        setIsVerifying(true);
        await AuthServices.instance().resetPassword(_userNewPassword, otp);
        setIsChangePasswordSuccess(true);
        return true;
      } catch (error) {
        setErrorUserVerify(error as Error);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [_userNewPassword]
  );

  const registerDevice = useCallback(
    async (token: string, platform: 'IOS' | 'Android') => {
      try {
        if (_profile) {
          setIsDeviceRegistering(true);
          await AuthServices.instance().registerDevice(token, platform, _profile.userId);
          setIsDeviceRegistered(true);
          return true;
        } else {
          const { data } = await AuthServices.instance().fetchProfile();
          await AuthServices.instance().registerDevice(token, platform, data.userId);
          setProfile({ ...data });
          return true;
        }
      } catch (error) {
        setIsDeviceRegistering(false);
        return false;
      } finally {
        setIsDeviceRegistering(false);
      }
    },
    [_profile]
  );

  const updateUserInfo = useCallback(
    async (
      userId: string,
      fullName: string,
      nickName: string,
      id: string,
      idType?: string,
      idIssuingCountry?: string,
      onError?: (err: Error) => void
    ) => {
      try {
        setIsUpdatingProfile(true);
        const response = await AuthServices.instance().updateUserInfo(
          userId,
          fullName,
          nickName,
          id,
          idType,
          idIssuingCountry
        );
        const { data } = response;
        setProfile(data);
        await authComponentStore.storeIsUserLogged(true);
        setIsUpdatingProfile(false);
        return true;
      } catch (error) {
        onError && onError(error as Error);
        setIsUpdatingProfile(false);
        setErrorUpdateProfile(error as Error);
        return false;
      }
    },
    []
  );

  const pairingDevice = useCallback(async () => {
    try {
      const code = AuthServices.instance().getPairingCode();
      if (!code) {
        const { pairingCode } = await AuthServices.instance().getLoginhintTokenAndPairingCode();
        PingOnesdkModule.pairDevice(pairingCode);
      } else {
        PingOnesdkModule.pairDevice(code);
      }
    } catch (error) {}
  }, []);

  const adbAuthorizePushOnly = useCallback(async () => {
    try {
      const response = await AuthServices.instance().authorizePushOnly();
      if (response && response.selectedDevice?.id && response.authSession && response.resumeUrl) {
        PingOnesdkModule.setCurrentSessionId(response.authSession.id);
        saveResumeURL(response.resumeUrl);
        return true;
      }
    } catch (error) {
      return false;
    }
    return false;
  }, []);

  const obtainNewAccessToken = useCallback(async () => {
    try {
      if (_resumeURL) {
        const authResponse = await AuthServices.instance().resumeUrl(_resumeURL);

        if (authResponse && authResponse.authorizeResponse?.code) {
          await AuthServices.instance().obtainTokenSingleFactor(
            authResponse.authorizeResponse.code
          );
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }, [_resumeURL]);

  const getListDevices = useCallback(async () => {
    try {
      const response = await AuthServices.instance().getListDevices();
      if (response && response.data && response.data.length > 0) {
        return response.data;
      }
    } catch (error) {
      setErrorRebindedDevice(error as Error);
    }
  }, []);

  const deleteDevice = useCallback(async (deviceId: string) => {
    try {
      const response = await AuthServices.instance().deleteDevice(deviceId);
      if (response && response.data && response.data.length > 0) {
      }
      return true;
    } catch (error) {
      setErrorRebindedDevice(error as Error);
    }
    return false;
  }, []);

  const updateUserStatus = useCallback(
    async (status: string) => {
      if (_profile?.userId) {
        setIsUpdatingUserStatus(true);
        try {
          await AuthServices.instance().updateUserStatus(_profile?.userId, status);
          return true;
        } catch (error) {
          setErrorRebindedDevice(error as Error);
        } finally {
          setIsUpdatingUserStatus(false);
        }
      }
      return false;
    },
    [_profile]
  );

  const reSelectDevice = useCallback(async () => {
    if (selectedDeviceId && _flowId) {
      setIsReselectingDevice(true);
      try {
        const response = await AuthServices.instance().selectDevice(selectedDeviceId, _flowId);
        return true;
      } catch (error) {
      } finally {
        setIsReselectingDevice(false);
      }
    }
    return false;
  }, [selectedDeviceId, _flowId]);

  const getNotificationBadge = async () => {
    const response = await AuthServices.instance().getNotificationBadge();
    setbadgeNumber(response ? response : 0);
  };

  const getNotifications = async (pageNumber: number) => {
    const response = await AuthServices.instance().getNotifications(pageNumber);
    if (response) {
      let newData = Object.assign({}, response);
      if (newData.paging.pageNumber !== 1) {
        const dataNotifications = _notificationData?.data ? _notificationData?.data : [];
        newData.data = [...dataNotifications, ...newData.data];
      }
      setNotificationData(newData);
    }
  };

  const updateReadNotifications = async (notificationId: string) => {
    const response = await AuthServices.instance().updateReadNotification(notificationId);
    if (response) {
      let cloneData = [...(_notificationData?.data ? _notificationData?.data : [])];
      const itemIndex = cloneData.findIndex((item) => item.id === notificationId);
      cloneData[itemIndex].isView = true;
      let newUpdatedData = Object.assign({}, _notificationData);
      newUpdatedData.data = [...cloneData];
      setNotificationData(newUpdatedData);
    }
  };

  return useMemo(
    () => ({
      reSelectDevice,
      profile: _profile,
      recovery: _recovery,
      isSignedIn: _isSignedIn,
      isSigning: _isSigning,
      login,
      clearSignInError,
      logout,
      updateProfile,
      fetchProfile,
      changeUserPassword,
      validateUserForgotPassword,
      changeUserPasswordUsingRecoveryCode,
      adbForgotPasswordVerifyOtp,
      profilePicture: _profilePicture,
      errorSignIn: _errorSignIn,
      errorUpdateProfile: _errorUpdateProfile,
      clearUpdateProfileError,
      isUpdatingProfile: _isUpdatingProfile,
      loginOAuth2,
      isChangingPassword: _isChangingPassword,
      errorChangePassword: _errorChangePassword,
      isChangePassword: _isChangePassword,
      saveUserPhoneNumber,
      recoveryUserPassword,
      isRecoveringUserPassword: _isRecoveringUserPassword,
      errorRecoveryUserPassword: _errorRecoveryUserPassword,
      clearRecoveryUserPasswordError,
      isRequestingResetUserPassword: _isRequestingResetPassword,
      errorRequestResetPassword: _errorRequestResetPassword,
      requestResetUserPassword,
      saveUserNewPassword,
      userMobileNumber: _userMobileNumber,
      userNewPassword: _userNewPassword,
      requestRecoveryPassword,
      isVerifying: _isVerifying,
      isChangePasswordSuccess: _isChangePasswordSuccess,
      errorUserVerify: _errorUserVerify,
      clearUserVerificationData,
      registerDevice,
      isDeviceRegistering: _isDeviceRegistered,
      isDeviceRegistered: _isDeviceRegistered,
      updateUserInfo,
      adbLogin,
      adbLoginVerifyOtp,
      isVerifyLogin: _isVerifyLogin,
      errorVerifySignIn: _errorVerifySignIn,
      adbResendOTP,
      adbLoginSingleFactor,
      flowId: _flowId,
      isManualLogin: _isManualLogin,
      setIsManualLogin,
      isValidatedSubsequenceLogin: _isValidatedSubsequenceLogin,
      setIsValidatedSubsequenceLogin,
      verifyPassword,
      adbGetAccessToken,
      pairingDevice,
      adbAuthorizePushOnly,
      obtainNewAccessToken,
      saveResumeURL,
      errorRebindedDevice: _errorRebindedDevice,
      deleteDevice,
      getListDevices,
      updateUserStatus,
      setIsSignedIn,
      isUpdatingUserStatus: _isUpdatingUserStatus,
      userMobileNumberHint: _userMobileNumberHint,
      currentVerificationMethod: _currentVerificationMethod,
      setCurrentVerificationMethod,
      isReselectingDevice: _isReselectingDevice,
      clearErrorVerifySignIn,
      getNotificationBadge,
      badgeNumber: _badgeNumber,
      getNotifications,
      updateReadNotifications,
      notificationData: _notificationData,
    }),
    [
      _profile,
      _recovery,
      _isSignedIn,
      _isSigning,
      _profilePicture,
      _errorSignIn,
      _errorUpdateProfile,
      _isUpdatingProfile,
      _isChangingPassword,
      _errorChangePassword,
      _isChangePassword,
      _isRecoveringUserPassword,
      _errorRecoveryUserPassword,
      _errorRequestResetPassword,
      _isRequestingResetPassword,
      _userMobileNumber,
      _isVerifying,
      _isChangePasswordSuccess,
      _errorUserVerify,
      _userNewPassword,
      _isDeviceRegistering,
      _isDeviceRegistered,
      _isVerifyLogin,
      _flowId,
      _errorVerifySignIn,
      _username,
      _password,
      _isManualLogin,
      _isValidatedSubsequenceLogin,
      _resumeURL,
      _errorRebindedDevice,
      _isUpdatingUserStatus,
      _userMobileNumberHint,
      _currentVerificationMethod,
      selectedDeviceId,
      _isReselectingDevice,
      _badgeNumber,
      _notificationData,
    ]
  );
};
