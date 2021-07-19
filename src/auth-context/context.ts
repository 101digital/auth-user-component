import { Profile, ProfileCustomField } from '../types';
import authComponentStore from '../services/local-store';
import React, { useCallback, useEffect } from 'react';
import { useMemo, useState } from 'react';
import { AuthServices } from '../services/auth-services';

export interface AuthContextData {
  profile?: Profile;
  isSignedIn: boolean;
  isSigning: boolean;
  errorSignIn?: Error;
  login: (username: string, password: string) => Promise<Profile | undefined>;
  logout: () => void;
  clearError: () => void;
  updateProfile: (profile: Profile) => void;
  profilePicture?: string;
}

export const authDefaultValue: AuthContextData = {
  isSignedIn: false,
  isSigning: false,
  errorSignIn: undefined,
  login: async () => undefined,
  logout: () => null,
  clearError: () => null,
  updateProfile: () => null,
};

export const AuthContext = React.createContext<AuthContextData>(authDefaultValue);

export const useAuthContextValue = (): AuthContextData => {
  const [_profile, setProfile] = useState<Profile | undefined>(undefined);
  const [_isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [_isSigning, setIsSigning] = useState<boolean>(false);
  const [_errorSignIn, setErrorSignIn] = useState<Error | undefined>();
  const [_profilePicture, setProfilePicture] = useState<string | undefined>(undefined);

  useEffect(() => {
    checkLogin();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      setIsSigning(true);
      await AuthServices.instance().login(username, password);
      const { data } = await AuthServices.instance().fetchProfile();
      await authComponentStore.storeProfile(data);
      setProfile(data);
      setIsSignedIn(true);
      getProfilePicture(data);
      setIsSigning(false);
      return data;
    } catch (error) {
      setIsSigning(false);
      setErrorSignIn(error);
      return undefined;
    }
  }, []);

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

  const clearError = useCallback(() => {
    setErrorSignIn(undefined);
  }, []);

  const logout = useCallback(async () => {
    await authComponentStore.clearAuths();
    setIsSignedIn(false);
    setProfile(undefined);
  }, []);

  const updateProfile = useCallback(async (profile: Profile) => {
    setProfile(profile);
    getProfilePicture(profile);
    await authComponentStore.storeProfile(profile);
  }, []);

  return useMemo(
    () => ({
      profile: _profile,
      isSignedIn: _isSignedIn,
      isSigning: _isSigning,
      login,
      clearError,
      logout,
      updateProfile,
      profilePicture: _profilePicture,
    }),
    [_profile, _isSignedIn, _isSigning, _profilePicture]
  );
};
