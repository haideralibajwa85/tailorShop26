'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, supabase } from '../lib/supabase';
import { userAPI } from '../lib/api';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  isRTL: boolean;
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [isRTL, setIsRTL] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync auth state
  useEffect(() => {
    // Initial fetch
    const initAuth = async () => {
      try {
        const profile = await userAPI.getCurrentUser();
        setCurrentUser(profile);
      } catch (err) {
        console.error('Error fetching user on init:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    if (!supabase) {
      console.warn('Supabase client not available, skipping auth listener.');
      setLoading(false);
      return;
    }

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session) {
        try {
          const profile = await userAPI.getCurrentUser();
          setCurrentUser(profile);
        } catch (err) {
          console.error('Error fetching user on auth change:', err);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for saved language preference on initial load
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
    setIsRTL(savedLanguage === 'ur' || savedLanguage === 'ar');
  }, []);

  // Update RTL when language changes
  useEffect(() => {
    setIsRTL(currentLanguage === 'ur' || currentLanguage === 'ar');
    localStorage.setItem('language', currentLanguage);

    // Update document direction
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage, isRTL]);

  const value = {
    currentUser,
    setCurrentUser,
    currentLanguage,
    setCurrentLanguage,
    isRTL,
    loading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};