'use client';

import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import i18n from '../i18n/i18n';

const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentLanguage, isRTL } = useAppContext();

  useEffect(() => {
    // Change language when context language changes
    if (currentLanguage) {
      i18n.changeLanguage(currentLanguage);
    }
    
    // Update document direction based on language
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [currentLanguage, isRTL]);

  return <>{children}</>;
};

export default LanguageProvider;