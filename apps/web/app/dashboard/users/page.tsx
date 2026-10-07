'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { AppTable, AppModal, Column } from '@repo/ui';
import {
  Box, Button, Checkbox, Chip, FormControlLabel, IconButton, InputAdornment, MenuItem, Stack,
  TablePagination, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import api from '../../../lib/api';
import { extractData, getErrorMessage } from '../../../lib/apiHelpers';
import { useAuth } from '../../../context/AuthContext';
import { useGym } from '../../../context/GymContext';
import { Permissions, isSuperAdminRole } from '../../../lib/auth';
import { assignableRoles, fetchAllRoles, fetchAllUsers, fetchUserRoles, fullName, initials } from '../../../lib/users';
import { formatDate } from '../../../lib/format';
import { AppUserWithRoles, CreateUserForm } from '../../../types/user';
import { Role } from '../../../types/role';

const emptyForm: CreateUserForm = { firstName: '', lastName: '', email: '', phoneNumber: '', password: '' };

function UsersPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleFilter = searchParams.get('roleId') ?? '';
  const { can, isAdmin } = useAuth();
  const { gyms, gymId: activeGymId } = useGym();
  const canManage = can(Permissions.ManageUsers);
  const gymName = (id?: string | null) => (id ? gyms.find((g) => g.id === id)?.name ?? 'Unknown gym' : null);

  const [users, setUsers] = useState<AppUserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [search, setSearch] = useState('');
  // Super Admin only: which gym's users to show ('' = every gym)
  const [gymFilter, setGymFilter] = useState('');
  const [newUserGymId, setNewUserGymId] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateUserForm>(emptyForm);
  const [newUserRoleIds, setNewUserRoleIds] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setRolesLoaded(false);
    // Roles load on their own so the role filter and heading still work if listing users fails.
    fetchAllRoles().then(setRoles).catch(() => setRoles([]));
    try {
      const allUsers = await fetchAllUsers();
      setUsers(allUsers);
      setIsLoading(false);

      // Roles live on a separate endpoint per user; fill them in once the list is showing.
      const withRoles = await Promise.all(
        allUsers.map(async (u) => ({ ...u, roles: await fetchUserRoles(u.id).catch(() => []) }))
      );
      setUsers(withRoles);
      setRolesLoaded(true);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load users.'));
      setUsers([]);
      setIsLoading(false);
      setRolesLoaded(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [search, roleFilter, gymFilter]);

  const activeRole = roles.find((r) => r.id === roleFilter);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter && !u.roles?.some((r) => r.id === roleFilter)) return false;
      if (gymFilter === 'none' ? !!u.gymId : gymFilter && u.gymId !== gymFilter) return false;
      if (!term) return true;
      return `${u.firstName} ${u.lastName} ${u.email} ${u.phoneNumber}`.toLowerCase().includes(term);
    });
  }, [users, search, roleFilter, gymFilter]);

  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize);

  const setRoleFilter = (roleId: string) => {
    router.replace(roleId ? `/dashboard/users?roleId=${roleId}` : '/dashboard/users');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // The API puts new users in the caller's gym; only a Super Admin chooses the gym.
      const res = await api.post('/users/register', { ...form, gymId: isAdmin ? newUserGymId || null : undefined });
      const created = extractData<{ id: string }>(res);
      if (created?.id && newUserRoleIds.length > 0) {
        try {
          await api.post('/users/roles', { userId: created.id, roleIds: newUserRoleIds });
        } catch (err) {
          toast.warn(getErrorMessage(err, 'User created, but assigning roles failed. Assign them from the user page.'));
        }
      }
      toast.success(`${form.firstName} ${form.lastName} was added.`);
      setShowCreate(false);
      setForm(emptyForm);
      setNewUserRoleIds([]);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create user.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreate = () => {
    setForm(emptyForm);
    setNewUserGymId(activeGymId ?? '');
    // Coming from a role's user list, pre-select that role.
    setNewUserRoleIds(roleFilter ? [roleFilter] : []);
    setShowCreate(true);
  };

  const columns: Column<AppUserWithRoles>[] = [
    {
      key: 'name',
      label: 'User',
      render: (row) => (
        <Link href={`/dashboard/users/${row.id}`} className="no-underline flex items-center gap-3 group">
          <span className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 bg-gradient-to-br from-pink-500 to-purple-500">
            {initials(row)}
          </span>
          <span className="flex flex-col min-w-0">
            <span className="text-sm font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">{fullName(row)}</span>
            <span className="text-xs text-slate-500 truncate normal-case">{row.email}</span>
          </span>
        </Link>
      ),
    },
    { key: 'phoneNumber', label: 'Phone' },
    ...(isAdmin
      ? [{
          key: 'gymId',
          label: 'Gym',
          render: (row: AppUserWithRoles) => (
            <Typography variant="body2" sx={{ textTransform: 'capitalize' }} color={row.gymId ? 'text.primary' : 'text.secondary'}>
              {/* No gym means all-gym access only for Super Admins; anyone else is unassigned. */}
              {gymName(row.gymId) ?? (row.roles?.some((r) => isSuperAdminRole(r.name)) ? 'All gyms' : 'Not assigned')}
            </Typography>
          ),
        }]
      : []),
    {
      key: 'roles',
      label: 'Roles',
      render: (row) =>
        !rolesLoaded ? (
          <Typography variant="caption" color="text.secondary">Loading…</Typography>
        ) : row.roles && row.roles.length > 0 ? (
          <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap' }}>
            {row.roles.map((r) => (
              <Chip key={r.id} label={r.name} size="small" sx={{ bgcolor: '#fdf4ff', color: '#9333ea', border: '1px solid #f3e8ff' }} />
            ))}
          </Stack>
        ) : (
          <Typography variant="caption" color="text.secondary">No role</Typography>
        ),
    },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button component={Link} href={`/dashboard/users/${row.id}`} size="small" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' }}>
          {canManage ? 'Manage' : 'View'}
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {activeRole && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem' }}>
          <Link href="/dashboard/roles" className="text-slate-500 hover:text-pink-500 transition-colors no-underline text-sm">Roles</Link>
          <span className="text-slate-400">›</span>
          <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>{activeRole.name}</Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">
            {activeRole ? `${activeRole.name} users` : 'Users'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {activeRole
              ? `Everyone with the ${activeRole.name} role. Select a user to edit their details or roles.`
              : isAdmin
                ? 'Everyone who can sign in, across all gyms. Roles decide what they can do.'
                : 'People in your gym who can sign in. Roles decide what they can do.'}
          </Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add User
          </Button>
        )}
      </Box>

      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
        <TextField
          placeholder="Search by name, email or phone..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          fullWidth
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
        />
        <TextField
          select
          size="small"
          label="Role"
          value={roles.some((r) => r.id === roleFilter) ? roleFilter : ''}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
        >
          <MenuItem value="">All roles</MenuItem>
          {roles.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
        </TextField>
        {isAdmin && (
          <TextField
            select
            size="small"
            label="Gym"
            value={gymFilter}
            onChange={(e) => setGymFilter(e.target.value)}
            sx={{ minWidth: 200, '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
          >
            <MenuItem value="">All gyms</MenuItem>
            <MenuItem value="none">No gym</MenuItem>
            {gyms.map((g) => <MenuItem key={g.id} value={g.id} sx={{ textTransform: 'capitalize' }}>{g.name}</MenuItem>)}
          </TextField>
        )}
      </Stack>

      <Box>
        <AppTable
          columns={columns}
          rows={pageRows}
          isLoading={isLoading || (!!roleFilter && !rolesLoaded)}
          emptyIcon="🧑‍🤝‍🧑"
          emptyTitle={activeRole ? `No one has the ${activeRole.name} role yet.` : search ? 'No users match your search.' : 'No users yet.'}
          emptySubtitle={canManage ? (activeRole ? 'Add a user here, or assign this role from a user’s page.' : "Use 'Add User' to invite someone.") : undefined}
        />
        {filtered.length > 0 && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </Box>

      <AppModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add User"
        subtitle="They'll sign in with this email and password. Share the password with them securely."
        maxWidth="sm"
      >
        <form onSubmit={handleCreate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="First Name" required fullWidth value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              <TextField label="Last Name" required fullWidth value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </Stack>
            <TextField label="Email" type="email" required fullWidth value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <TextField label="Phone Number" type="tel" required fullWidth value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
            <TextField
              label="Temporary Password"
              type={showPassword ? 'text' : 'password'}
              required
              fullWidth
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            {isAdmin && (
              <TextField
                select
                label="Gym"
                fullWidth
                value={newUserGymId}
                onChange={(e) => setNewUserGymId(e.target.value)}
                helperText={newUserGymId ? 'They will only see this gym’s data.' : 'No gym: use this only for another Super Admin.'}
              >
                <MenuItem value="">No gym (Super Admin)</MenuItem>
                {gyms.map((g) => <MenuItem key={g.id} value={g.id} sx={{ textTransform: 'capitalize' }}>{g.name}</MenuItem>)}
              </TextField>
            )}
            {roles.length > 0 && (
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }} color="text.primary">Roles</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Roles decide which parts of the dashboard this person can manage.
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
                  {assignableRoles(roles, isAdmin).map((r) => (
                    <FormControlLabel
                      key={r.id}
                      label={r.name}
                      control={
                        <Checkbox
                          size="small"
                          checked={newUserRoleIds.includes(r.id)}
                          onChange={(e) => setNewUserRoleIds((ids) => (e.target.checked ? [...ids, r.id] : ids.filter((id) => id !== r.id)))}
                          sx={{ color: '#ec4899', '&.Mui-checked': { color: '#ec4899' } }}
                        />
                      }
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowCreate(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add User'}</Button>
          </Stack>
        </form>
      </AppModal>
    </Box>
  );
}

export default function UsersPage() {
  return (
    <Suspense fallback={null}>
      <UsersPageContent />
    </Suspense>
  );
}
