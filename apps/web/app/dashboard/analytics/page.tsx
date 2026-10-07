'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { useGym } from '../../../context/GymContext';
import api from '../../../lib/api';
import { extractData, extractPagedResult } from '../../../lib/apiHelpers';
import { formatMoney } from '../../../lib/format';
import { StatCard } from '../../../types/analytics';
import { defaultStats, quickActions } from '../../../data/analytics';
import { GymContextChip } from '../../../components/ui/GymContextChip';
import { APP_NAME } from '../../../lib/brand';

const countOf = async (url: string) => {
  const res = await api.get(url, { params: { page: 1, pageSize: 1 } });
  return extractPagedResult(res)?.totalCount ?? 0;
};

export default function DashboardPage() {
  const { user, can, isAdmin } = useAuth();
  const { gyms, gymId, isLoadingGyms } = useGym();
  const [stats, setStats] = useState<StatCard[]>(defaultStats);
  const [counts, setCounts] = useState({ plans: 0, members: 0, staff: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const gymName = gyms.find((g) => g.id === gymId)?.name;

  useEffect(() => {
    if (isLoadingGyms) return;
    const fetchStats = async () => {
      setIsLoading(true);
      if (!gymId) {
        setStats(defaultStats.map((s, i) => (i === 0 ? { ...s, value: gyms.length, change: 'All locations' } : s)));
        setIsLoading(false);
        return;
      }
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const [members, plans, staff, report] = await Promise.allSettled([
        countOf(`/members/all/${gymId}`),
        countOf(`/plans/gym/${gymId}`),
        api.get(`/staffs/gym/${gymId}`).then((r) => extractPagedResult(r)?.totalCount ?? 0),
        api.get(`/sales-report/${gymId}`, { params: { startDate: monthStart.toISOString(), endDate: now.toISOString() } })
          .then((r) => extractData<{ totalSales: number; totalPaymentsCollected: number }>(r)),
      ]);
      const val = <T,>(r: PromiseSettledResult<T>, fallback: T) => (r.status === 'fulfilled' ? r.value : fallback);
      const rep = val(report, null);
      setCounts({ members: val(members, 0), plans: val(plans, 0), staff: val(staff, 0) });
      setStats([
        { label: 'Members', value: val(members, 0), icon: '👤', gradient: '', glow: '', change: gymName ?? 'This gym' },
        { label: 'Membership Plans', value: val(plans, 0), icon: '📋', gradient: '', glow: '', change: 'Available' },
        { label: 'Payments This Month', value: rep ? formatMoney(rep.totalPaymentsCollected) : '—', icon: '💳', gradient: '', glow: '', change: 'Collected' },
        { label: 'Sales This Month', value: rep ? formatMoney(rep.totalSales) : '—', icon: '💎', gradient: '', glow: '', change: 'Inventory sales' },
      ]);
      setIsLoading(false);
    };
    fetchStats();
  }, [gymId, isLoadingGyms, gyms.length, gymName]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // First-run checklist: the order a new gym owner actually needs to set things up in.
  const setupSteps = [
    { done: gyms.length > 0 || !!gymId, label: 'Create your gym', href: '/dashboard/gyms' },
    { done: counts.plans > 0, label: 'Add membership plans', href: '/dashboard/plans' },
    { done: counts.staff > 0, label: 'Add your staff', href: '/dashboard/staff' },
    { done: counts.members > 0, label: 'Register your first member', href: '/dashboard/members' },
  ];
  const setupComplete = setupSteps.every((s) => s.done);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {user?.firstName || 'Admin'} 🌸
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {gymName ? <>Here&apos;s what&apos;s happening at <span className="capitalize">{gymName}</span>.</> : 'Here’s what’s happening across your gyms.'}
          </p>
        </div>
        <GymContextChip />
      </div>

      {/* Getting started */}
      {!isLoading && !setupComplete && (isAdmin || can('ManageUsers')) && (
        <div className="rounded-2xl p-6 bg-white border border-pink-500/20">
          <h2 className="text-base font-semibold text-slate-900">Get your gym ready</h2>
          <p className="text-slate-500 text-sm mt-1 mb-4">Finish these steps and {APP_NAME} is ready for day-to-day use.</p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {setupSteps.map((step, i) => (
              <li key={step.label}>
                <Link
                  href={step.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors no-underline ${
                    step.done ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-pink-300 hover:bg-pink-50 text-slate-700'
                  }`}
                >
                  <span className={`w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${step.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {step.done ? '✓' : i + 1}
                  </span>
                  <span className="text-sm font-medium">{step.label}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-6 animate-pulse bg-white/80 border border-black/5">
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
                    <span className="text-xs text-slate-500 px-2 py-1 rounded-full bg-slate-100 capitalize">{stat.change}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-2xl p-5 transition-all duration-200 hover:scale-[1.02] bg-white/80 border border-black/5 backdrop-blur-xl hover:bg-pink-500/5 hover:border-pink-500/10 block"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <p className="text-slate-900 font-medium text-sm group-hover:text-pink-600 transition-colors">{action.label}</p>
              <p className="text-slate-500 text-xs mt-1">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
