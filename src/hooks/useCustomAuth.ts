'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export function useCustomAuth() {
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isLoaded) {
    return {
      isSignedIn: false,
      userId: null,
      userEmail: null,
      userName: null,
      userFirstName: null,
      userLastName: null,
      userUsername: null,
      isLoading: true,
    };
  }

  return {
    isSignedIn: !!isSignedIn,
    userId: userId || null,
    userEmail: user?.emailAddresses[0]?.emailAddress || null,
    userName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : null,
    userFirstName: user?.firstName || null,
    userLastName: user?.lastName || null,
    userUsername: user?.username || null,
    isLoading: false,
  };
}
