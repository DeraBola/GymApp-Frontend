import { QuickAction, StatCard } from '../types/analytics';

export const defaultStats: StatCard[] = [
  {
    label: 'Total Gyms',
    value: '—',
    icon: '🏛️',
    gradient: 'linear-gradient(135deg, rgba(236,72,153,0.2), rgba(168,85,247,0.1))',
    glow: 'rgba(236,72,153,0.2)',
  },
  {
    label: 'Total Members',
    value: '—',
    icon: '👤',
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.1))',
    glow: 'rgba(168,85,247,0.2)',
  },
  {
    label: 'Active Plans',
    value: '—',
    icon: '📋',
    gradient: 'linear-gradient(135deg, rgba(244,114,182,0.2), rgba(236,72,153,0.1))',
    glow: 'rgba(244,114,182,0.2)',
  },
  {
    label: 'Total Sales',
    value: '—',
    icon: '💎',
    gradient: 'linear-gradient(135deg, rgba(232,121,249,0.2), rgba(168,85,247,0.1))',
    glow: 'rgba(232,121,249,0.2)',
  },
];

export const quickActions: QuickAction[] = [
  { label: 'Manage Gyms', href: '/dashboard/gyms', icon: '🏛️', desc: 'View and manage all gym locations' },
  { label: 'View Members', href: '/dashboard/members', icon: '👤', desc: 'Browse and manage gym members' },
  { label: 'Payments', href: '/dashboard/payments', icon: '💳', desc: 'Track transactions and revenue' },
];
