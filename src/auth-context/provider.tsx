import React, { ReactNode } from 'react';
import { AuthContext, useAuthContextValue } from './context';

export type BankingProviderProps = {
  children: ReactNode;
};

const AuthProvider = (props: BankingProviderProps) => {
  const { children } = props;
  const authContextData = useAuthContextValue();

  return <AuthContext.Provider value={authContextData}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
