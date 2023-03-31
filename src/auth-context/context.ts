import {
  Profile,
  ProfileCustomField,
  CountryInformation,
  Recovery,
  VerificationMethod,
} from '../types';
import authComponentStore from '../services/local-store';
import React, { useCallback, useEffect } from 'react';
import { useMemo, useState } from 'react';
import { AuthServices } from '../services/auth-services';
import _ from 'lodash';

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
  updateProfile: (
    userId: string,
    firstName: string,
    lastName: string,
    profilePicture?: string
  ) => Promise<boolean>;
  fetchProfile: () => void;
  isUpdatingProfile?: boolean;
  errorUpdateProfile?: Error;
  clearUpdateProfileError: () => void;
  changeUserPassword: (
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string
  ) => void;
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
    platform: 'IOS' | 'Android',
    userId: string,
    appId: string,
    entityId: string
  ) => Promise<boolean>;
  isDeviceRegistering: boolean;
  isDeviceRegistered: boolean;
  updateUserInfo: (
    userId: string,
    fullName: string,
    nickName: string,
    id: string
  ) => Promise<boolean>;
  adbLogin: (username: string, password: string) => Promise<boolean>;
  isVerifyLogin: boolean;
  errorVerifySignIn?: Error;
  adbLoginVerifyOtp: (otp: string) => Promise<boolean>;
  adbResendOTP: () => void;
  adbLoginWithoutOTP: (username: string, password: string) => Promise<string | undefined>;
  flowId?: string;
  isManualLogin: boolean;
  isValidatedSubsequenceLogin: boolean;
  setIsValidatedSubsequenceLogin: (isValidated: boolean) => void;
  verificationMethodKey: VerificationMethod;
  setVerificationMethodKey: (method: VerificationMethod) => void;
  verifyPassword: (password: string) => Promise<boolean>;
  adbGetAccessToken: (username: string, password: string) => void;
  adbGetPairingCode: () => Promise<string>;
  adbAuthorizePushOnly: (loginHintToken: string) =>Promise<boolean>;
  adbGetLoginHintToken: () => Promise<string>;
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
  adbLoginWithoutOTP: async () => undefined,
  isManualLogin: false,
  isValidatedSubsequenceLogin: false,
  setIsValidatedSubsequenceLogin: () => undefined,
  verificationMethodKey: VerificationMethod.PENDING,
  setVerificationMethodKey: () => undefined,
  verifyPassword: async () => false,
  adbGetAccessToken: () => false,
  adbGetPairingCode: async () => '',
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
  const [_isManualLogin, setisManualLogin] = useState<boolean>(false);
  const [_isValidatedSubsequenceLogin, setIsValidatedSubsequenceLogin] = useState<boolean>(false);
  const [_verificationMethodKey, setVerificationMethodKey] = useState<VerificationMethod>(
    VerificationMethod.PENDING
  );

  useEffect(() => {
    checkLogin();
  }, []);

  const loginOAuth2 = useCallback(async () => {
    try {
      setIsSigning(true);
      const { accessToken, refreshToken } = await AuthServices.instance().loginOAuth2();
      await authComponentStore.storeAccessToken(accessToken);
      await authComponentStore.storeRefreshToken(refreshToken);
      const { data } = await AuthServices.instance().fetchProfile();
      await authComponentStore.storeProfile(data);
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
        await authComponentStore.storeProfile(data);
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
        setUsername(username);
        setPassword(undefined);
        await authComponentStore.storeUserName(username);
      }
    } catch (error) {
      setIsSigning(false);
      setErrorSignIn(error as Error);
      return false;
    }
    return true;
  }, []);

  const adbGetAccessToken = useCallback(async (username: string, password: string) => {
    try {
      const resLogin = await AuthServices.instance().adbLogin(
        username,
        password,
        '4b6cea4c-88be-4ffe-b061-952b233f8b6b',
        'profilepsf'
      );
      const resAfterValidate = await AuthServices.instance().afterValidateOtp(resLogin.resumeUrl);
      await AuthServices.instance().obtainTokenSingleFactor(
        resAfterValidate.authorizeResponse.code,
        'profilepsf'
      );
    } catch (error) {}
  }, []);

  const adbLoginWithoutOTP = useCallback(async (username: string, password: string) => {
    try {
      setIsSigning(true);
      const resLogin = await AuthServices.instance().adbLogin(
        username,
        password,
        '4b6cea4c-88be-4ffe-b061-952b233f8b6b',
        'profilepsf',
        'Single_Factor'
      );
      if (resLogin.error) {
        return resLogin;
      } else {
        const resAfterValidate = await AuthServices.instance().afterValidateOtp(resLogin.resumeUrl);
        await AuthServices.instance().obtainTokenSingleFactor(
          resAfterValidate.authorizeResponse.code
        );
        const { data } = await AuthServices.instance().fetchProfile();
        await authComponentStore.storeProfile(data);
        await authComponentStore.storeUserName(username);
        setPassword(undefined);
        setProfile({ ...data });
        setIsSignedIn(true);
        setisManualLogin(true);
        return resLogin._embedded.user.id;
      }
    } catch (error) {
      setErrorSignIn(error as Error);
      throw error;
    } finally {
      setIsSigning(false);
    }
  }, []);

  const verifyPassword = useCallback(async (password: string) => {
    try {
      setIsSigning(true);
      if (_username) {
        const resLogin = await AuthServices.instance().adbLogin(
          _username,
          password,
          '0eb2b7cf-1817-48ec-a62d-eae404776cff',
          'profilepsf'
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
        const data = await AuthServices.instance().adbLogin(_username, _password);
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

  const adbLoginVerifyOtp = useCallback(
    async (otp: string) => {
      try {
        setIsVerifyLogin(true);
        if (_flowId && _flowId.length > 0) {
          const loginData = await AuthServices.instance().adbVerifyLogin(otp, _flowId);
          const afterValidateData = await AuthServices.instance().afterValidateOtp(
            loginData.resumeUrl
          );
          await AuthServices.instance().obtainToken(afterValidateData.authorizeResponse.code);
          const { data } = await AuthServices.instance().fetchProfile();
          await authComponentStore.storeProfile(data);
          setProfile({ ...data });
          setisManualLogin(true);
          setIsSignedIn(true);
          setIsVerifyLogin(false);
        }
      } catch (error) {
        setIsVerifyLogin(false);
        setErrorVerifySignIn(error as Error);
      }
      return true;
    },
    [_flowId]
  );

  const getProfilePicture = (profile: Profile) => {
    const profileImage = profile?.listCustomFields.filter((p: ProfileCustomField) => {
      return p.customKey === 'logo';
    });
    if (profileImage && profileImage.length > 0) {
      setProfilePicture(profileImage[0].customValue);
    }
  };

  const checkLogin = useCallback(async () => {
    const profile = await authComponentStore.getProfile();
    if (profile) {
      setProfile(profile);
      setIsSignedIn(true);
      getProfilePicture(profile);
    }
  }, []);

  const clearSignInError = useCallback(() => {
    setErrorSignIn(undefined);
  }, []);

  const logout = useCallback(async () => {
    await authComponentStore.clearAuths();
    setIsSignedIn(false);
    setProfile(undefined);
  }, []);

  const updateProfile = useCallback(
    async (userId: string, firstName: string, lastName: string, profilePicture?: string) => {
      try {
        setIsUpdatingProfile(true);
        await AuthServices.instance().updateProfile(userId, firstName, lastName, profilePicture);
        const { data } = await AuthServices.instance().fetchProfile();
        setProfile(data);
        getProfilePicture(data);
        await authComponentStore.storeProfile(data);
        setIsUpdatingProfile(false);
        return true;
      } catch (error) {
        setIsUpdatingProfile(false);
        setErrorUpdateProfile(error as Error);
        return false;
      }
    },
    []
  );

  const fetchProfile = useCallback(async () => {
    try {
      setIsUpdatingProfile(true);
      const { data } = await AuthServices.instance().fetchProfile();
      setProfile(data);
      getProfilePicture(data);
      await authComponentStore.storeProfile(data);
      setIsUpdatingProfile(false);
      return true;
    } catch (error) {
      setIsUpdatingProfile(false);
      setErrorUpdateProfile(error as Error);
      return false;
    }
  }, []);

  const clearUpdateProfileError = useCallback(() => {}, []);

  const changeUserPassword = useCallback(
    async (currentPassword: string, newPassword: string, confirmNewPassword: string) => {
      try {
        setIsChangingPassword(true);
        await AuthServices.instance().changeUserPassword(
          currentPassword,
          newPassword,
          confirmNewPassword
        );
        setIsChangePassword(true);
        setTimeout(() => {
          setIsChangePassword(false);
        }, 500);
        setIsChangingPassword(false);

        return true;
      } catch (error) {
        setIsChangingPassword(false);
        setErrorChangePassword(error as Error);
        return undefined;
      }
    },
    []
  );

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
    async (
      token: string,
      platform: 'IOS' | 'Android',
      userId: string,
      appId: string,
      entityId: string
    ) => {
      try {
        setIsDeviceRegistering(true);
        await AuthServices.instance().registerDevice(token, platform, userId, appId, entityId);
        setIsDeviceRegistered(true);
        return true;
      } catch (error) {
        setIsDeviceRegistering(false);
        return false;
      } finally {
        setIsDeviceRegistering(false);
      }
    },
    []
  );

  const updateUserInfo = useCallback(
    async (userId: string, fullName: string, nickName: string, id: string) => {
      try {
        setIsUpdatingProfile(true);
        const response = await AuthServices.instance().updateUserInfo(
          userId,
          fullName,
          nickName,
          id
        );
        const { data } = response;
        setProfile(data);
        await authComponentStore.storeProfile(data);
        setIsUpdatingProfile(false);
        return true;
      } catch (error) {
        setIsUpdatingProfile(false);
        setErrorUpdateProfile(error as Error);
        return false;
      }
    },
    []
  );

  const adbGetLoginHintToken = useCallback(async () => {
    try {
      setIsSigning(true);
      const data = await AuthServices.instance().getLoginHintToken();
      return data;
    } catch (error) {
      setIsSigning(false);
      setErrorSignIn(error as Error);
      return '';
    }
  }, []);

  const adbAuthorizePushOnly = useCallback(async (loginHintToken: string) => {
    try {
      setIsSigning(true);
      const data = await AuthServices.instance().authorizePushOnly(loginHintToken);
    } catch (error) {
      return false;
    }
    return true;
  }, []);

  const adbGetPairingCode = useCallback(async () => {
    try {
      const response = await AuthServices.instance().getPairingCode();
      return response;
    } catch (error) {}
  }, []);

  return useMemo(
    () => ({
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
      adbLoginWithoutOTP,
      flowId: _flowId,
      isManualLogin: _isManualLogin,
      isValidatedSubsequenceLogin: _isValidatedSubsequenceLogin,
      setIsValidatedSubsequenceLogin,
      verificationMethodKey: _verificationMethodKey,
      setVerificationMethodKey,
      verifyPassword,
      adbGetAccessToken,
      adbGetPairingCode,
      adbAuthorizePushOnly,
      adbGetLoginHintToken,
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
      _verificationMethodKey,
    ]
  );
};
