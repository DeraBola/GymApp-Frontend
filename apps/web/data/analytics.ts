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
  { label: 'Register a Member', href: '/dashboard/members', icon: '👤', desc: 'Sign up a new member at the front desk' },
  { label: 'Request a Payment', href: '/dashboard/payments', icon: '💳', desc: 'Send a member a Paystack checkout link' },
  { label: 'Record a Sale', href: '/dashboard/sales', icon: '💎', desc: 'Log a shop sale and see this month’s revenue' },
  { label: 'Schedule a Class', href: '/dashboard/classes', icon: '🧘', desc: 'Add a class and assign an instructor' },
  { label: 'Log a Repair', href: '/dashboard/repairs', icon: '🔧', desc: 'Track broken equipment until it’s fixed' },
  { label: 'Manage Access', href: '/dashboard/users', icon: '🛡️', desc: 'Add users and decide what they can do' },
];
