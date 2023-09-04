// AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/AuthService';
import { getSecureData, setSecureData } from '../utils/keychainStorage';

// Define the user details interface
interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  apps: { appName: string }[]; // Modify this to match app data structure
}

// Define the context value type for authentication
interface AuthContextType {
  user: { access_token: string } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Create the authentication context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load tokens from secure storage when the app starts
    const loadTokens = async () => {
      const access_token = await getSecureData('access_token');

      if (access_token) {
        setUser({ access_token });
      }

      setLoading(false);
    };

    loadTokens();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { access_token } = await authService.login(email, password); // Use authService here

      // Store tokens securely using AsyncStorage
      await setSecureData('access_token', access_token);

      setUser({ access_token });

      return true; // Successful login
    } catch (error) {
      console.log('Login failed', error);

      throw new Error('Login failed');
    }
  };

  const logout = async () => {
    // Clear tokens from secure storage
    await setSecureData('access_token', '');

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
