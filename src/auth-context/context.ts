import { Profile } from '../types';
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
  clearError: () => void;
}

export const authDefaultValue: AuthContextData = {
  isSignedIn: false,
  isSigning: false,
  errorSignIn: undefined,
  login: async () => undefined,
  clearError: () => null,
};

export const AuthContext = React.createContext<AuthContextData>(authDefaultValue);

export const useAuthContextValue = (): AuthContextData => {
  const [_profile, setProfile] = useState<Profile | undefined>(undefined);
  const [_isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [_isSigning, setIsSigning] = useState<boolean>(false);
  const [_errorSignIn, setErrorSignIn] = useState<Error | undefined>();

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
      setIsSigning(false);
      return data;
    } catch (error) {
      setIsSigning(false);
      setErrorSignIn(error);
      return undefined;
    }
  }, []);

  const checkLogin = useCallback(async () => {
    const profile = await authComponentStore.getProfile();
    if (profile) {
      setProfile(profile);
      setIsSignedIn(true);
    }
  }, []);

  const clearError = useCallback(() => {
    setErrorSignIn(undefined);
  }, []);

  return useMemo(
    () => ({
      profile: _profile,
      isSignedIn: _isSignedIn,
      isSigning: _isSigning,
      login,
      clearError,
    }),
    [_profile, _isSignedIn, _isSigning]
  );
};
