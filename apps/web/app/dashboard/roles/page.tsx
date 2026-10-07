'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../lib/api';
import { extractPagedItems, getErrorMessage } from '../../../lib/apiHelpers';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import {
  Button, TextField, Box, Typography, Stack, Checkbox, FormControlLabel, Skeleton, Alert, Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Role } from '../../../types/role';
import { Permission } from '../../../types/permission';

const emptyForm = { name: '', description: '' };
const checkboxSx = { color: '#ec4899', '&.Mui-checked': { color: '#ec4899' } };
const subtleBtn = { fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' };

export default function RolesPage() {
  const { isAdmin } = useAuth();
  // Roles are shared by every gym, so only Super Admins change them.
  const canManage = isAdmin;

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create / edit
  const [formRole, setFormRole] = useState<Role | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete
  const [deleteRole, setDeleteRole] = useState<Role | null>(null);

  // Permissions
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [savedPermissions, setSavedPermissions] = useState<string[]>([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(false);
  const [isSavingPerms, setIsSavingPerms] = useState(false);

  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/roles', { params: { page: 1, pageSize: 100 } });
      setRoles(extractPagedItems(res));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load roles.'));
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchRoles(); }, []);

  const openCreate = () => { setFormRole(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (role: Role) => { setFormRole(role); setForm({ name: role.name, description: role.description ?? '' }); setShowForm(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = { roleName: form.name.trim(), description: form.description.trim() || null };
      if (formRole) {
        await api.put(`/roles/${formRole.id}`, body);
        toast.success('Role updated.');
      } else {
        await api.post('/role', body);
        toast.success('Role created. Now choose what it can do.');
      }
      setShowForm(false);
      fetchRoles();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save role.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRole) return;
    try {
      await api.delete(`/roles/${deleteRole.id}`);
      toast.success('Role deleted.');
      fetchRoles();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete role.'));
    } finally {
      setDeleteRole(null);
    }
  };

  const openPermissions = async (role: Role) => {
    setPermRole(role);
    setIsLoadingPerms(true);
    try {
      const [allRes, roleRes] = await Promise.all([
        api.get('/permissions', { params: { page: 1, pageSize: 100 } }),
        api.get(`/roles/${role.id}/permissions`, { params: { page: 1, pageSize: 100 } }),
      ]);
      setAllPermissions(extractPagedItems<Permission>(allRes));
      const current = extractPagedItems<Permission>(roleRes).map((p) => p.id);
      setSelectedPermissions(current);
      setSavedPermissions(current);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load permissions.'));
      setPermRole(null);
    } finally {
      setIsLoadingPerms(false);
    }
  };

  const permsDirty = useMemo(
    () => [...selectedPermissions].sort().join() !== [...savedPermissions].sort().join(),
    [selectedPermissions, savedPermissions]
  );

  const handleSavePermissions = async () => {
    if (!permRole) return;
    setIsSavingPerms(true);
    try {
      await api.put(`/roles/${permRole.id}/permissions`, { permissionIds: selectedPermissions });
      toast.success(`Permissions for ${permRole.name} saved. Users get them on their next sign-in.`);
      setPermRole(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save permissions.'));
    } finally {
      setIsSavingPerms(false);
    }
  };

  const allSelected = allPermissions.length > 0 && selectedPermissions.length === allPermissions.length;

  const columns: Column<Role>[] = [
    {
      key: 'name',
      label: 'Role',
      render: (row) => (
        <Link href={`/dashboard/users?roleId=${row.id}`} className="no-underline group inline-flex items-center gap-1">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-pink-600 transition-colors">{row.name}</span>
          <ChevronRightIcon sx={{ fontSize: 18, color: '#cbd5e1' }} className="group-hover:text-pink-500" />
        </Link>
      ),
    },
    { key: 'description', label: 'Description', render: (row) => row.description || <span className="text-slate-400">—</span> },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button component={Link} href={`/dashboard/users?roleId=${row.id}`} size="small" variant="outlined" sx={subtleBtn}>
            Users
          </Button>
          {canManage && (
            <>
              <Button size="small" variant="outlined" sx={subtleBtn} onClick={() => openPermissions(row)}>Permissions</Button>
              <Button size="small" variant="outlined" sx={subtleBtn} onClick={() => openEdit(row)}>Edit</Button>
              <Button size="small" color="error" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5 }} onClick={() => setDeleteRole(row)}>Delete</Button>
            </>
          )}
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Roles</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {canManage
              ? 'A role bundles permissions and is shared by every gym. Select a role to see the users who have it.'
              : 'Roles are set up by your Super Admin. Select a role to see who in your gym has it.'}
          </Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Role</Button>
        )}
      </Box>

      <AppTable
        columns={columns}
        rows={roles}
        isLoading={isLoading}
        emptyIcon="🛡️"
        emptyTitle="No roles yet."
        emptySubtitle={canManage ? "Create roles like 'Gym Manager' or 'Front Desk', then give them permissions." : undefined}
      />

      {/* Create / Edit Role */}
      <AppModal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={formRole ? `Edit ${formRole.name}` : 'Create Role'}
        subtitle={formRole ? undefined : 'Name it after a job, e.g. Gym Manager. You’ll pick its permissions next.'}
        maxWidth="xs"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Role Name" required fullWidth value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Gym Manager" />
            <TextField label="Description (optional)" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Who is this role for?" />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowForm(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : formRole ? 'Save Changes' : 'Create Role'}</Button>
          </Stack>
        </form>
      </AppModal>

      {/* Role Permissions */}
      <AppModal
        open={!!permRole}
        onClose={() => setPermRole(null)}
        title={`What can ${permRole?.name ?? 'this role'} do?`}
        subtitle="Tick the permissions this role should have."
        maxWidth="sm"
      >
        {isLoadingPerms ? (
          <Stack spacing={1} sx={{ py: 1 }}>
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="rounded" height={36} />)}
          </Stack>
        ) : allPermissions.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2, my: 1 }}>
            No permissions exist yet. <Link href="/dashboard/permissions" className="text-pink-600">Create some first</Link>.
          </Alert>
        ) : (
          <>
            <FormControlLabel
              label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Select all</Typography>}
              control={
                <Checkbox
                  size="small"
                  checked={allSelected}
                  indeterminate={selectedPermissions.length > 0 && !allSelected}
                  onChange={(e) => setSelectedPermissions(e.target.checked ? allPermissions.map((p) => p.id) : [])}
                  sx={checkboxSx}
                />
              }
            />
            <Divider sx={{ my: 1 }} />
            <Stack sx={{ maxHeight: 360, overflowY: 'auto' }}>
              {allPermissions.map((p) => (
                <FormControlLabel
                  key={p.id}
                  sx={{ alignItems: 'flex-start', py: 0.5, mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedPermissions.includes(p.id)}
                      onChange={(e) => setSelectedPermissions((ids) => (e.target.checked ? [...ids, p.id] : ids.filter((id) => id !== p.id)))}
                      sx={{ ...checkboxSx, pt: 0.25 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{p.name}</Typography>
                      {p.description && <Typography variant="caption" color="text.secondary">{p.description}</Typography>}
                    </Box>
                  }
                />
              ))}
            </Stack>
          </>
        )}
        <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
          <Button fullWidth variant="outlined" onClick={() => setPermRole(null)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
          <Button fullWidth variant="contained" onClick={handleSavePermissions} disabled={isSavingPerms || isLoadingPerms || !permsDirty}>
            {isSavingPerms ? 'Saving...' : `Save (${selectedPermissions.length} selected)`}
          </Button>
        </Stack>
      </AppModal>

      <ConfirmModal
        open={!!deleteRole}
        onClose={() => setDeleteRole(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteRole?.name ?? 'role'}?`}
        message="Users with this role will lose the permissions it grants. This can't be undone."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
