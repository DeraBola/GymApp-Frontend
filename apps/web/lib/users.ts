import api from './api';
import { extractPagedItems, extractPagedResult } from './apiHelpers';
import { AppUser } from '../types/user';
import { Role } from '../types/role';
import { isSuperAdminRole } from './auth';

const PAGE_SIZE = 100;

/** Every user, walking through all pages of /users/all. */
export async function fetchAllUsers(): Promise<AppUser[]> {
  const all: AppUser[] = [];
  for (let page = 1; page <= 50; page++) {
    const res = await api.get('/users/all', { params: { page, pageSize: PAGE_SIZE } });
    const result = extractPagedResult<AppUser>(res);
    all.push(...(result?.items ?? []));
    if (!result?.hasNextPage) break;
  }
  return all;
}

/**
 * The backend's GET /users/{id} only returns the signed-in user's own profile,
 * so look other users up in the full list instead.
 */
export async function fetchUserById(userId: string): Promise<AppUser | null> {
  const users = await fetchAllUsers();
  return users.find((u) => u.id === userId) ?? null;
}

export async function fetchUserRoles(userId: string): Promise<Role[]> {
  const res = await api.get(`/users/${userId}/roles`, { params: { page: 1, pageSize: 100 } });
  return extractPagedItems<Role>(res);
}

export async function fetchAllRoles(): Promise<Role[]> {
  const res = await api.get('/roles', { params: { page: 1, pageSize: 100 } });
  return extractPagedItems<Role>(res);
}

/** Gym admins can't hand out Super Admin (the API refuses it too), so hide it from them. */
export const assignableRoles = (roles: Role[], isSuperAdmin: boolean) =>
  isSuperAdmin ? roles : roles.filter((r) => !isSuperAdminRole(r.name));

export const fullName = (u?: { firstName?: string; lastName?: string } | null) =>
  [u?.firstName, u?.lastName].filter(Boolean).join(' ') || '—';

export const initials = (u?: { firstName?: string; lastName?: string } | null) =>
  `${u?.firstName?.[0] ?? ''}${u?.lastName?.[0] ?? ''}`.toUpperCase() || '?';
