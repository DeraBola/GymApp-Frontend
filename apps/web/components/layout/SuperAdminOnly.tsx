'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

/**
 * Wraps pages that only Super Admins may see (roles and permissions are shared
 * by every gym). Anyone else who opens the URL directly gets a short explanation.
 */
export function SuperAdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();

  if (isAdmin) return <>{children}</>;

  return (
    <div className="text-center py-24 px-4">
      <p className="text-5xl mb-3">🔒</p>
      <p className="font-semibold text-slate-800">Only Super Admins can manage roles and permissions</p>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
        Roles are shared by every gym on the platform. To change what someone in your gym can do, assign them a different role from their user page.
      </p>
      <Link href="/dashboard/users" className="text-pink-600 text-sm mt-4 inline-block hover:text-pink-700 transition-colors">
        Go to Users →
      </Link>
    </div>
  );
}
