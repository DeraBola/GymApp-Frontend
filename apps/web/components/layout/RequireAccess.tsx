'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

interface RequireAccessProps {
  children: ReactNode;
  /** Permission needed to see the page; omit with superAdminOnly for Super Admin pages */
  permission?: string;
  superAdminOnly?: boolean;
  title?: string;
  message?: string;
}

/**
 * Guards a page for people who open its URL directly; the sidebar already hides
 * links they can't use. The API enforces the same rules.
 */
export function RequireAccess({
  children,
  permission,
  superAdminOnly = false,
  title = 'You don’t have access to this page',
  message = 'Ask your gym admin if you need it.',
}: RequireAccessProps) {
  const { isAdmin, can } = useAuth();
  const allowed = superAdminOnly ? isAdmin : !permission || can(permission);

  if (allowed) return <>{children}</>;

  return (
    <div className="text-center py-24 px-4">
      <p className="text-5xl mb-3">🔒</p>
      <p className="font-semibold text-slate-800">{title}</p>
      <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">{message}</p>
      <Link href="/dashboard/analytics" className="text-pink-600 text-sm mt-4 inline-block hover:text-pink-700 transition-colors">
        Back to dashboard →
      </Link>
    </div>
  );
}
