'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  glow: string;
  change?: string;
}

interface Gym {
  id: string;
  name: string;
}

interface Member {
  id: string;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [gymsRes, membersRes] = await Promise.allSettled([
          api.get('/gyms'),
          api.get('/members'),
        ]);

        const gyms: Gym[] = gymsRes.status === 'fulfilled' ? (gymsRes.value.data?.value ?? gymsRes.value.data ?? []) : [];
        const members: Member[] = membersRes.status === 'fulfilled' ? (membersRes.value.data?.value ?? membersRes.value.data ?? []) : [];

        setStats([
          {
            label: 'Total Gyms',
            value: gyms.length,
            icon: '🏛️',
            gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.1))',
            glow: 'rgba(236,72,153,0.2)',
            change: 'All locations',
          },
          {
            label: 'Total Members',
            value: members.length,
            icon: '👤',
            gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.1))',
            glow: 'rgba(168,85,247,0.2)',
            change: 'Across all gyms',
          },
          {
            label: 'Active Plans',
            value: '—',
            icon: '📋',
            gradient: 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(236,72,153,0.1))',
            glow: 'rgba(244,114,182,0.2)',
            change: 'Membership plans',
          },
          {
            label: 'Total Sales',
            value: '—',
            icon: '💎',
            gradient: 'linear-gradient(135deg, rgba(232,121,249,0.2), rgba(168,85,247,0.1))',
            glow: 'rgba(232,121,249,0.2)',
            change: 'Revenue tracking',
          },
        ]);
      } catch {
        setStats([
          { label: 'Total Gyms', value: '—', icon: '🏛️', gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.1))', glow: 'rgba(236,72,153,0.2)' },
          { label: 'Total Members', value: '—', icon: '👤', gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.1))', glow: 'rgba(168,85,247,0.2)' },
          { label: 'Active Plans', value: '—', icon: '📋', gradient: 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(236,72,153,0.1))', glow: 'rgba(244,114,182,0.2)' },
          { label: 'Total Sales', value: '—', icon: '💎', gradient: 'linear-gradient(135deg, rgba(232,121,249,0.2), rgba(168,85,247,0.1))', glow: 'rgba(232,121,249,0.2)' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {user?.firstName || 'Admin'} 🌸
        </h1>
        <p className="text-white/40 text-sm mt-1">Here&apos;s what&apos;s happening across your gyms today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="h-4 w-20 rounded mb-4" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <div className="h-8 w-12 rounded" style={{ background: 'rgba(255,255,255,0.08)' }} />
              </div>
            ))
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-6 transition-transform duration-200 hover:scale-[1.02] cursor-default"
                style={{
                  background: stat.gradient,
                  border: '1px solid rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  boxShadow: `0 8px 32px ${stat.glow}`,
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.change && (
                    <span
                      className="text-xs text-white/50 px-2 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-white/50 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Manage Gyms', href: '/dashboard/gyms', icon: '🏛️', desc: 'View and manage all gym locations' },
            { label: 'View Members', href: '/dashboard/members', icon: '👤', desc: 'Browse and manage gym members' },
            { label: 'Analytics', href: '/dashboard/analytics', icon: '✦', desc: 'View detailed analytics reports' },
          ].map((action) => (
            <a
              key={action.href}
              href={action.href}
              className="rounded-2xl p-5 transition-all duration-200 group hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(236,72,153,0.1)';
                (e.currentTarget as HTMLAnchorElement).style.border = '1px solid rgba(236,72,153,0.2)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLAnchorElement).style.border = '1px solid rgba(255,255,255,0.08)';
              }}
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <p className="text-white font-medium text-sm group-hover:text-pink-300 transition-colors">{action.label}</p>
              <p className="text-white/40 text-xs mt-1">{action.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
