import { Profile, ProfileCustomField, CountryInformation } from '../types';
import authComponentStore from '../services/local-store';
import React, { useCallback, useEffect } from 'react';
import { useMemo, useState } from 'react';
import { AuthServices } from '../services/auth-services';

export interface AuthContextData {
  profile?: Profile;
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
  isUpdatingProfile?: boolean;
  errorUpdateProfile?: Error;
  clearUpdateProfileError: () => void;
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
  clearUpdateProfileError: () => null,
};

export const AuthContext = React.createContext<AuthContextData>(authDefaultValue);

export const useAuthContextValue = (): AuthContextData => {
  const [_profile, setProfile] = useState<Profile | undefined>(undefined);
  const [_isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [_isSigning, setIsSigning] = useState<boolean>(false);
  const [_errorSignIn, setErrorSignIn] = useState<Error | undefined>();
  const [_profilePicture, setProfilePicture] = useState<string | undefined>(undefined);
  const [_errorUpdateProfile, setErrorUpdateProfile] = useState<Error | undefined>();
  const [_isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);

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

  const clearUpdateProfileError = useCallback(() => {}, []);

  return useMemo(
    () => ({
      profile: _profile,
      isSignedIn: _isSignedIn,
      isSigning: _isSigning,
      login,
      clearSignInError,
      logout,
      updateProfile,
      profilePicture: _profilePicture,
      errorSignIn: _errorSignIn,
      errorUpdateProfile: _errorUpdateProfile,
      clearUpdateProfileError,
      isUpdatingProfile: _isUpdatingProfile,
      loginOAuth2,
    }),
    [
      _profile,
      _isSignedIn,
      _isSigning,
      _profilePicture,
      _errorSignIn,
      _errorUpdateProfile,
      _isUpdatingProfile,
    ]
  );
};
