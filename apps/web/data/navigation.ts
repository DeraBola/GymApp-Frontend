import { Permissions } from '../lib/auth';

export interface NavLink {
  href: string;
  label: string;
  icon: string;
  /** Hide the link from users who lack this permission (the backend would reject them anyway) */
  permission?: string;
  /** Cross-gym pages only Super Admins use */
  superAdminOnly?: boolean;
}

export interface NavSection {
  title: string;
  links: NavLink[];
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    links: [
      { href: '/dashboard/analytics', label: 'Analytics', icon: '✦' },
      { href: '/dashboard/gyms', label: 'All Gyms', icon: '🏛️', superAdminOnly: true },
      // Locations of the gym being managed (gym users see this instead of All Gyms)
      { href: '/dashboard/branches', label: 'Branches', icon: '📍' },
    ],
  },
  {
    title: 'Gym Operations',
    links: [
      { href: '/dashboard/members', label: 'Members', icon: '👤' },
      { href: '/dashboard/staff', label: 'Staff', icon: '🧑‍💼', permission: Permissions.ManageStaffs },
      { href: '/dashboard/classes', label: 'Classes', icon: '🧘' },
      { href: '/dashboard/equipment', label: 'Equipment', icon: '🏋️' },
      { href: '/dashboard/repairs', label: 'Repairs', icon: '🔧' },
    ],
  },
  {
    title: 'Business',
    links: [
      { href: '/dashboard/plans', label: 'Membership Plans', icon: '📋' },
      { href: '/dashboard/payments', label: 'Payments', icon: '💳' },
      { href: '/dashboard/inventory', label: 'Inventory', icon: '📦' },
      { href: '/dashboard/sales', label: 'Sales', icon: '💎' },
    ],
  },
  {
    title: 'Access Control',
    links: [
      { href: '/dashboard/users', label: 'Users', icon: '🧑‍🤝‍🧑' },
      { href: '/dashboard/roles', label: 'Roles', icon: '🛡️', superAdminOnly: true },
      { href: '/dashboard/permissions', label: 'Permissions', icon: '🔑', superAdminOnly: true },
    ],
  },
];

export const navLinks: NavLink[] = navSections.flatMap((s) => s.links);
