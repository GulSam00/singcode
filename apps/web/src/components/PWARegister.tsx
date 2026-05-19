'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(err => {
      console.error('Service Worker registration failed:', err);
    });
  }, []);

  return null;
}
