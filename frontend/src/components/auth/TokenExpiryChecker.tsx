'use client';

import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

export default function TokenExpiryChecker() {
  const { isAuthenticated, checkTokenExpiry } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    checkTokenExpiry();

    const interval = setInterval(() => {
      checkTokenExpiry();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, checkTokenExpiry]);

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        checkTokenExpiry();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isAuthenticated, checkTokenExpiry]);

  return null;
}