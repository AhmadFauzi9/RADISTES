'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginScreen from '@/components/auth/LoginScreen';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const { currentUser, isAuthLoaded } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (isAuthLoaded && currentUser) {
      router.push('/');
    }
  }, [currentUser, isAuthLoaded, router]);

  return <LoginScreen />;
}
