'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  _id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const loadStoredAuth = async () => {
      const storedToken = localStorage.getItem('doctor_tracker_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const res = await fetch(`${API_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${storedToken}`,
            },
          });

          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            // Token expired or invalid
            localStorage.removeItem('doctor_tracker_token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching auth user:', error);
        }
      }
      setLoading(false);
    };

    loadStoredAuth();
  }, [API_URL]);

  // Route protection logic
  useEffect(() => {
    if (!loading) {
      const isPublicPath = pathname === '/login';
      if (!token && !isPublicPath) {
        router.push('/login');
      } else if (token && isPublicPath) {
        router.push('/dashboard');
      }
    }
  }, [token, loading, pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('doctor_tracker_token', data.token);
        setToken(data.token);
        setUser({ _id: data._id, email: data.email });
        router.push('/dashboard');
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Server error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('doctor_tracker_token');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
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
