'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { token, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.replace(token ? '/dashboard' : '/login');
    }
  }, [token, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div
        className="w-10 h-10 rounded-full animate-spin"
        style={{
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#ec4899',
        }}
      />
    </div>
  );
}
