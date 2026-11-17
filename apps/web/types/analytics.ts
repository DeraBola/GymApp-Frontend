export interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
  glow: string;
  change?: string;
}

export interface QuickAction {
  label: string;
  href: string;
  icon: string;
  desc: string;
  /** Only show to users with this permission */
  permission?: string;
}
