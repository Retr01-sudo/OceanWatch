import React from 'react';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ReportsProvider } from '@/contexts/ReportsContext';
import '../../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ReportsProvider>
          <Component {...pageProps} />
        </ReportsProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

