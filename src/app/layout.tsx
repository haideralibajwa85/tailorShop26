import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppProvider } from '../context/AppContext';
import Navigation from '../components/Navigation';
import LanguageProvider from '../components/LanguageProvider';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tailor Shop Management',
  description: 'Complete Tailor Shop Management System with Supabase Backend',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <AppProvider>
          <LanguageProvider>
            <Navigation />
            <main>
              {children}
            </main>
            <Toaster position="top-right" />
          </LanguageProvider>
        </AppProvider>
      </body>
    </html>
  );
}