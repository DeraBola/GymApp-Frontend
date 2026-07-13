'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../lib/api';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import { Button, TextField, Box, Typography, Stack, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Role } from '../../../types/role';

export default function RolesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [assignRoleId, setAssignRoleId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/role', { roleName: form.name, description: form.description || undefined });
      toast.success('Role created successfully!');
      setShowCreateModal(false);
      setForm({ name: '', description: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to create role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (_id: string) => {
    toast.error('Role deletion is not supported by the current API.');
    setDeleteId(null);
  };

  const handleAssignPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoleId) return;
    setIsAssigning(true);
    try {
      await api.post('/permission-role', { roleId: assignRoleId, permissionIds: selectedPermissions.filter(Boolean) });
      toast.success('Permissions assigned successfully!');
      setAssignRoleId(null);
      setSelectedPermissions([]);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign permissions.');
    } finally {
      setIsAssigning(false);
    }
  };

  const columns: Column<Role>[] = [
    { key: 'name', label: 'Name', render: (row) => <Typography sx={{ fontWeight: 600 }} variant="body2" color="text.primary">{row.name}</Typography> },
    { key: 'description', label: 'Description' },
    ...(isSuperAdmin
      ? [{
          key: 'actions',
          label: 'Actions',
          align: 'right' as const,
          render: (row: Role) => (
            <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' }} onClick={() => { setAssignRoleId(row.id); setSelectedPermissions([]); }}>
                Assign Permissions
              </Button>
              <Button size="small" color="error" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5 }} onClick={() => setDeleteId(row.id)}>
                Delete
              </Button>
            </Stack>
          ),
        }]
      : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Roles</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage user roles and assigned permissions</Typography>
        </Box>
        {isSuperAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowCreateModal(true)}>
            Add Role
          </Button>
        )}
      </Box>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        A GET endpoint for listing roles is not yet available. Roles you create will appear here once the API is updated.
      </Alert>

      <AppTable
        columns={columns}
        rows={roles}
        isLoading={isLoading}
        emptyIcon="🛡️"
        emptyTitle="Roles are managed on the backend."
        emptySubtitle="Use 'Add Role' to create a new role via the API."
      />

      {/* Create Role Modal */}
      <AppModal open={showCreateModal} onClose={() => { setShowCreateModal(false); setForm({ name: '', description: '' }); }} title="Create Role" subtitle="Add a new role to the system." maxWidth="xs">
        <form onSubmit={handleCreate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Role Name" required fullWidth value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Manager" />
            <TextField label="Description (Optional)" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What is this role for?" />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowCreateModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Role'}</Button>
          </Stack>
        </form>
      </AppModal>

      {/* Assign Permissions Modal */}
      <AppModal open={!!assignRoleId} onClose={() => setAssignRoleId(null)} title="Assign Permissions" subtitle="Enter known Permission IDs (GUIDs), one per line." maxWidth="sm">
        <form onSubmit={handleAssignPermissions}>
          <Alert severity="warning" sx={{ borderRadius: 2, mb: 2, mt: 1 }}>
            A listing endpoint for permissions is not yet available. Enter known Permission IDs manually.
          </Alert>
          <Stack spacing={2} sx={{ mb: 1 }}>
            <TextField
              label="Permission IDs"
              multiline
              rows={5}
              fullWidth
              placeholder="Enter one Permission ID (GUID) per line"
              value={selectedPermissions.join('\n')}
              onChange={(e) => setSelectedPermissions(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
              sx={{ '& .MuiInputBase-input': { fontFamily: 'monospace', fontSize: '0.8rem' } }}
            />
            <Typography variant="caption" color="text.secondary">
              {selectedPermissions.filter(Boolean).length} permission(s) entered
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setAssignRoleId(null)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isAssigning || selectedPermissions.filter(Boolean).length === 0}>{isAssigning ? 'Saving...' : 'Save Assignments'}</Button>
          </Stack>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId!)}
        title="Delete Role?"
        message="This action cannot be undone. Users with this role may lose access."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
