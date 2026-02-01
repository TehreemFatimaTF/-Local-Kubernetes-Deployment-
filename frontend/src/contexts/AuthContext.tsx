'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Optimized: Check for existing token on initial load ONCE
    const initAuth = () => {
      const storedToken = localStorage.getItem('better-auth-token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Decode the JWT to get user info and check expiration
        const [, tokenPayload] = storedToken.split('.');
        if (!tokenPayload) {
          throw new Error('Invalid token format');
        }

        const decodedPayload = JSON.parse(atob(tokenPayload));

        // Check expiration FIRST (faster check)
        if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
          localStorage.removeItem('better-auth-token');
          setLoading(false);
          return;
        }

        // Token is valid - set state once
        setToken(storedToken);
        setUser({
          id: decodedPayload.id || 'unknown',
          email: decodedPayload.email || 'unknown',
          name: decodedPayload.name || null,
        });
      } catch (error) {
        console.error('Error decoding token', error);
        localStorage.removeItem('better-auth-token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []); // Only run once on mount

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.login(email, password);

      if (response.error) {
        throw new Error(response.error);
      }

      // Backend returns nested structure: response.data.data.token
      if (response.data && response.data.data && response.data.data.token) {
        const token = response.data.data.token;

        setToken(token);
        localStorage.setItem('better-auth-token', token);

        // Decode user info from token
        try {
          const tokenPayload = token.split('.')[1];
          if (tokenPayload) {
            const decodedPayload = JSON.parse(atob(tokenPayload));
            setUser({
              id: decodedPayload.id || 'unknown',
              email: decodedPayload.email || 'unknown',
              name: decodedPayload.name || null,
            });
          }
        } catch (error) {
          console.error('Error decoding token', error);
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.register(email, password, name);

      if (response.error) {
        throw new Error(response.error);
      }

      // Backend returns nested structure: response.data.data.token
      if (response.data && response.data.data && response.data.data.token) {
        const token = response.data.data.token;
        setToken(token);
        localStorage.setItem('better-auth-token', token);

        // Decode user info from token
        try {
          const tokenPayload = token.split('.')[1];
          if (tokenPayload) {
            const decodedPayload = JSON.parse(atob(tokenPayload));
            setUser({
              id: decodedPayload.id || 'unknown',
              email: decodedPayload.email || 'unknown',
              name: decodedPayload.name || name,
            });
          }
        } catch (error) {
          console.error('Error decoding token', error);
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('better-auth-token');
    router.push('/login');
  }, [router]);

  const isAuthenticated = useCallback((): boolean => {
    return !!token;
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
