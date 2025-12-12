"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { getCurrentUser } from '@/lib/api/auth';
import { UserResponseDto } from '@/lib/type/auth';


export type User = {
  username: string;
  email: string | null;
  roles: string[];
};

export type UserResponse = {
  status: boolean;
  message: string;
  data: User;
};


type UserProfileContextType = {
  userProfile: UserResponseDto | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const [userProfile, setUserProfile] = useState<UserResponseDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getCurrentUser();
      setUserProfile(res);
       console.log("User data" ,res);
      localStorage.setItem('userProfile', JSON.stringify(res));
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to fetch user data');
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) {
      setUserProfile(JSON.parse(saved));
      setLoading(false);
    } else {
      fetchUserProfile();
    }
  }, []);

  return (
    <UserProfileContext.Provider value={{ userProfile, loading, error, refetch: fetchUserProfile }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (!context) throw new Error('useUserProfile must be used within a UserProfileProvider');
  return context;
};
