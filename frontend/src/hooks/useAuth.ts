'use client';

import { useState, useEffect } from 'react';
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
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
}

const useAuth = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing token on initial load
    const storedToken = localStorage.getItem('better-auth-token');
    if (storedToken) {
      // Decode the JWT to get user info and check expiration
      try {
        const tokenPayload = storedToken.split('.')[1];
        if (tokenPayload) {
          const decodedPayload = JSON.parse(atob(tokenPayload));

          // Check if token is expired
          if (decodedPayload.exp) {
            const expirationTime = decodedPayload.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            if (currentTime >= expirationTime) {
              // Token is expired, clear it
              console.log('Token expired, clearing...');
              localStorage.removeItem('better-auth-token');
              setToken(null);
              setUser(null);
              setLoading(false);
              return;
            }
          }

          // Token is valid
          setToken(storedToken);
          setUser({
            id: decodedPayload.id || 'unknown',
            email: decodedPayload.email || 'unknown',
            name: decodedPayload.name || null,
          });
        }
      } catch (error) {
        console.error('Error decoding token', error);
        // If token is invalid, clear it
        localStorage.removeItem('better-auth-token');
        setToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      console.log('[DEBUG] useAuth.login called');
      const response = await apiClient.login(email, password);

      if (response.error) {
        throw new Error(response.error);
      }

      // Backend returns nested structure: response.data.data.token
      if (response.data && response.data.data && response.data.data.token) {
        const token = response.data.data.token;
        console.log('[DEBUG] Login successful, token received:', token.substring(0, 50) + '...');

        setToken(token);
        localStorage.setItem('better-auth-token', token);
        console.log('[DEBUG] Token saved to localStorage');

        // Decode user info from token
        try {
          const tokenPayload = token.split('.')[1];
          if (tokenPayload) {
            const decodedPayload = JSON.parse(atob(tokenPayload));
            console.log('[DEBUG] Token decoded:', decodedPayload);
            setUser({
              id: decodedPayload.id || 'unknown',
              email: decodedPayload.email || 'unknown',
              name: decodedPayload.name || null,
            });
          }
        } catch (error) {
          console.error('[DEBUG] Error decoding token', error);
        }
      }
    } catch (error: any) {
      console.error('[DEBUG] Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.register(email, password);

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
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('better-auth-token');
    router.push('/login');
  };

  const isAuthenticated = (): boolean => {
    return !!token;
  };

  return {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated,
  };
};

export default useAuth;