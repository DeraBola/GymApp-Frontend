'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { SuperAdminOnly } from '../../../components/layout/SuperAdminOnly';
import { toast } from 'react-toastify';
import api from '../../../lib/api';
import { extractPagedItems, getErrorMessage } from '../../../lib/apiHelpers';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import { Button, TextField, Box, Typography, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Permission } from '../../../types/permission';

function PermissionsPageContent() {
  const { isAdmin } = useAuth();
  const isSuperAdmin = isAdmin;

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Permission | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/permissions', { params: { page: 1, pageSize: 100 } });
      const items = extractPagedItems<Permission>(res);
      setPermissions(items);
    } catch {
      toast.error('Failed to load permissions.');
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editing) {
        await api.put(`/permissions/${editing.id}`, { name: form.name.trim(), description: form.description.trim() || null });
        toast.success('Permission updated.');
      } else {
        await api.post('/permission', {
          permissions: [{ name: form.name.trim(), description: form.description.trim() || null }],
        });
        toast.success('Permission created. Add it to a role to grant it.');
      }
      setEditing(null);
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchPermissions();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to save permission.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/permissions/${id}`);
      toast.success('Permission deleted successfully.');
      fetchPermissions();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete permission.'));
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<Permission>[] = [
    { key: 'name', label: 'Name', render: (row) => <Typography sx={{ fontWeight: 600 }} variant="body2" color="text.primary">{row.name}</Typography> },
    { key: 'description', label: 'Description', render: (row) => row.description || <span className="text-slate-400">—</span> },
    ...(isSuperAdmin
      ? [{
          key: 'actions',
          label: 'Actions',
          align: 'right' as const,
          render: (row: Permission) => (
            <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' }} onClick={() => { setEditing(row); setForm({ name: row.name, description: row.description ?? '' }); setShowModal(true); }}>
                Edit
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
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Permissions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Individual actions a role can be allowed to do. Names must match what the backend checks.</Typography>
        </Box>
        {isSuperAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm({ name: '', description: '' }); setShowModal(true); }}>
            Add Permission
          </Button>
        )}
      </Box>



      <AppTable
        columns={columns}
        rows={permissions}
        isLoading={isLoading}
        emptyIcon="🔑"
        emptyTitle="No permissions yet."
        emptySubtitle="The backend checks ManageGyms, ManageStaffs, ManageUsers, ManageRoles and ViewDashboard."
      />

      {/* Create Permission Modal */}
      <AppModal open={showModal} onClose={() => { setShowModal(false); setEditing(null); setForm({ name: '', description: '' }); }} title={editing ? 'Edit Permission' : 'Create Permission'} subtitle={editing ? 'Renaming a permission the backend checks will break access to that feature.' : 'Add a new permission to the system.'} maxWidth="xs">
        <form onSubmit={handleCreate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Permission Name" required fullWidth value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. ManageGyms" />
            <TextField label="Description (Optional)" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What does this permission allow?" />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editing ? 'Save Changes' : 'Create Permission'}</Button>
          </Stack>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId!)}
        title="Delete Permission?"
        message="Roles that include it will lose this access. This can't be undone."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}

export default function PermissionsPage() {
  return (
    <SuperAdminOnly>
      <PermissionsPageContent />
    </SuperAdminOnly>
  );
}
