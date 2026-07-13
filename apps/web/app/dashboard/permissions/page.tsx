'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../lib/api';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import { Button, TextField, Box, Typography, Stack, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Permission } from '../../../types/permission';

export default function PermissionsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/permission', {
        permissions: [{ name: form.name, description: form.description || null }],
      });
      toast.success('Permission created successfully!');
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to create permission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (_id: string) => {
    toast.error('Permission deletion is not supported by the current API.');
    setDeleteId(null);
  };

  const columns: Column<Permission>[] = [
    { key: 'name', label: 'Name', render: (row) => <Typography sx={{ fontWeight: 600 }} variant="body2" color="text.primary">{row.name}</Typography> },
    { key: 'description', label: 'Description' },
    ...(isSuperAdmin
      ? [{
          key: 'actions',
          label: 'Actions',
          align: 'right' as const,
          render: (row: Permission) => (
            <Button size="small" color="error" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5 }} onClick={() => setDeleteId(row.id)}>
              Delete
            </Button>
          ),
        }]
      : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Permissions</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage system permissions and access levels</Typography>
        </Box>
        {isSuperAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowModal(true)}>
            Add Permission
          </Button>
        )}
      </Box>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        A GET endpoint for listing permissions is not yet available. Permissions you create will appear here once the API is updated.
      </Alert>

      <AppTable
        columns={columns}
        rows={permissions}
        isLoading={isLoading}
        emptyIcon="🔑"
        emptyTitle="Permissions are managed on the backend."
        emptySubtitle="Use 'Add Permission' to create one via the API."
      />

      {/* Create Permission Modal */}
      <AppModal open={showModal} onClose={() => { setShowModal(false); setForm({ name: '', description: '' }); }} title="Create Permission" subtitle="Add a new permission to the system." maxWidth="xs">
        <form onSubmit={handleCreate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Permission Name" required fullWidth value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. ManageGyms" />
            <TextField label="Description (Optional)" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="What does this permission allow?" />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Permission'}</Button>
          </Stack>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId!)}
        title="Delete Permission?"
        message="This action cannot be undone. Make sure no roles depend on this."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
