/**
 * Permission names issued by the backend (Web.Api/Endpoints/Permissions/PermissionConstants.cs).
 */
export const Permissions = {
  ManageUsers: 'ManageUsers',
  ManageRoles: 'ManageRoles',
  ViewDashboard: 'ViewDashboard',
  ManageGyms: 'ManageGyms',
  ManageStaffs: 'ManageStaffs',
} as const;

export type PermissionName = (typeof Permissions)[keyof typeof Permissions];

/**
 * Decode the payload of a JWT without verifying it (verification happens on the backend).
 */
export function decodeJwt(token: string | null): Record<string, unknown> | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/**
 * The backend adds one "permission" claim per permission, which serializes
 * as a string when there is one and an array when there are several.
 */
export function getTokenPermissions(token: string | null): string[] {
  const claim = decodeJwt(token)?.permission;
  if (Array.isArray(claim)) return claim.map(String);
  if (typeof claim === 'string') return [claim];
  return [];
}

/**
 * Only "Super Admin" / "SuperAdmin" bypasses permission checks on the backend
 * (it can reach every gym). A plain "Admin" is limited to its role's permissions.
 */
export function isSuperAdminRole(role?: string | null): boolean {
  return (role ?? '').replace(/[\s_-]/g, '').toLowerCase() === 'superadmin';
}

/** Admin-type role names, used to warn before someone removes their own admin access. */
export function isAdminRole(role?: string | null): boolean {
  const normalized = (role ?? '').replace(/[\s_-]/g, '').toLowerCase();
  return normalized === 'superadmin' || normalized === 'admin';
}
