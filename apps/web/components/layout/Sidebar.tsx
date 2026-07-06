'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { href: '/dashboard', label: 'Analytics', icon: '✦' },
  { href: '/dashboard/gyms', label: 'Gyms', icon: '🏛️' },
  { href: '/dashboard/members', label: 'Members', icon: '👤' },
  { href: '/dashboard/permissions', label: 'Permissions', icon: '🔑' },
  { href: '/dashboard/roles', label: 'Roles', icon: '🛡️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 flex flex-col z-50 bg-white"
      style={{
        borderRight: '1px solid #e2e8f0',
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{ borderBottom: '1px solid #e2e8f0' }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(236,72,153,0.3), rgba(168,85,247,0.3))',
            border: '1px solid rgba(236,72,153,0.4)',
          }}
        >
          🌸
        </div>
        <div>
          <p
            className="font-bold text-sm leading-tight text-slate-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            GymArch
          </p>
          <p className="text-slate-500 text-xs">Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">Menu</p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-pink-600'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-50'
              }`}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(168,85,247,0.1))',
                border: '1px solid rgba(236,72,153,0.2)',
                boxShadow: '0 4px 15px rgba(236,72,153,0.05)',
              } : {
                border: '1px solid transparent',
              }}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div
        className="px-3 py-4"
        style={{ borderTop: '1px solid #e2e8f0' }}
      >
        <div
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #a855f7)',
            }}
          >
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-xs font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-slate-500 text-xs truncate">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="text-slate-400 hover:text-rose-500 transition-colors text-sm shrink-0"
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}
