'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmModal } from '@repo/ui';
import { navLinks } from '../../data/navigation';
import { Logo } from '../ui/Logo';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const sidebarContent = (
    <aside className="flex flex-col h-full w-64 bg-white border-r border-slate-200">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-200">
        <Logo />
        <p className="text-slate-500 text-xs ml-[3.25rem] -mt-1">Management</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-3 mb-3">Menu</p>
        {navLinks.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onMobileClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'text-pink-600 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20'
                  : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-50 border border-transparent'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 bg-gradient-to-br from-pink-500 to-purple-500">
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 text-xs font-medium truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-slate-500 text-xs truncate">{user?.role}</p>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
            className="text-slate-400 hover:text-rose-500 transition-colors text-sm shrink-0"
          >
            ↩
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex fixed left-0 top-0 h-screen z-50">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="relative z-10 h-full shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      <ConfirmModal
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => { logout(); setShowLogoutConfirm(false); }}
        title="Log out?"
        message="Are you sure you want to log out of FitTitans?"
        confirmLabel="Yes, Log Out"
        confirmColor="warning"
      />
    </>
  );
}
