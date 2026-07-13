'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { StatCard } from '../../../types/analytics';
import { defaultStats, quickActions } from '../../../data/analytics';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatCard[]>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const gymsFetch = api.get('/gyms/All');
        const membersFetch = user?.gymId
          ? api.get(`/members/all/${user.gymId}`)
          : Promise.resolve({ data: { value: [] } });

        const [gymsRes, membersRes] = await Promise.allSettled([gymsFetch, membersFetch]);

        const gyms = gymsRes.status === 'fulfilled'
          ? (gymsRes.value.data?.value ?? gymsRes.value.data ?? [])
          : [];
        const members = membersRes.status === 'fulfilled'
          ? (membersRes.value.data?.value ?? membersRes.value.data ?? [])
          : [];

        setStats([
          { label: 'Total Gyms',    value: gyms.length,    icon: '🏛️', gradient: '', glow: 'rgba(236,72,153,0.2)',  change: 'All locations' },
          { label: 'Total Members', value: members.length, icon: '👤', gradient: '', glow: 'rgba(168,85,247,0.2)',  change: 'Across all gyms' },
          { label: 'Active Plans',  value: '—',            icon: '📋', gradient: '', glow: 'rgba(244,114,182,0.2)', change: 'Membership plans' },
          { label: 'Total Sales',   value: '—',            icon: '💎', gradient: '', glow: 'rgba(232,121,249,0.2)', change: 'Revenue tracking' },
        ]);
      } catch {
        setStats(defaultStats);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {user?.firstName || 'Admin'} 🌸
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s what&apos;s happening across your gyms today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse bg-white/80 border border-black/5"
              >
                <div className="h-4 w-20 rounded mb-4 bg-slate-200" />
                <div className="h-8 w-12 rounded bg-slate-200" />
              </div>
            ))
          : stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl p-6 transition-transform duration-200 hover:scale-[1.02] cursor-default bg-white border border-black/5 backdrop-blur-xl shadow-glass"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{stat.icon}</span>
                  {stat.change && (
                    <span className="text-xs text-slate-500 px-2 py-1 rounded-full bg-slate-100">
                      {stat.change}
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-slate-500 text-sm mt-1">{stat.label}</p>
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] bg-white/80 border border-black/5 backdrop-blur-xl hover:bg-pink-500/5 hover:border-pink-500/10 block"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <p className="text-slate-900 font-medium text-sm group-hover:text-pink-600 transition-colors">
                {action.label}
              </p>
              <p className="text-slate-500 text-xs mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
