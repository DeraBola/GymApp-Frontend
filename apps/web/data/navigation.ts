export interface NavLink {
  href: string;
  label: string;
  icon: string;
}

export const navLinks: NavLink[] = [
  { href: '/dashboard/analytics', label: 'Analytics', icon: '✦' },
  { href: '/dashboard/gyms', label: 'Gyms', icon: '🏛️' },
  { href: '/dashboard/members', label: 'Members', icon: '👤' },
  { href: '/dashboard/payments', label: 'Payments', icon: '💳' },
  { href: '/dashboard/permissions', label: 'Permissions', icon: '🔑' },
  { href: '/dashboard/roles', label: 'Roles', icon: '🛡️' },
];
