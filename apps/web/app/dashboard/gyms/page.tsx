'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { extractPagedResult, getErrorMessage } from '../../../lib/apiHelpers';
import { useGym } from '../../../context/GymContext';
import { toast } from 'react-toastify';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import { Button, TextField, Box, Chip, Typography, Stack, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Gym, CreateGymForm } from '../../../types/gym';

const emptyForm: CreateGymForm = { name: '', address: '', email: '', phoneNumber: '', country: '' };

export default function GymsPage() {
  const { isAdmin } = useAuth();
  const { refreshGyms } = useGym();
  // Creating and deleting gyms (tenants) is a Super Admin job.
  const isSuperAdmin = isAdmin;

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGymForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGyms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/gyms/All', { params: { page: page + 1, pageSize } });
      const result = extractPagedResult<Gym>(res);
      setGyms(result?.items ?? []);
      setTotalCount(result?.totalCount ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load gyms.'));
      setGyms([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchGyms(); }, [fetchGyms]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/gym/register', form);
      toast.success('Gym created. Open it to add branches, then add staff and members.');
      setShowCreateModal(false);
      setForm(emptyForm);
      fetchGyms();
      refreshGyms();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create gym.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/gym/${id}`);
      toast.success('Gym deleted.');
      fetchGyms();
      refreshGyms();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete gym.'));
    } finally {
      setDeleteId(null);
    }
  };

  const columns: Column<Gym>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (row) => (
        <Link href={`/dashboard/gyms/${row.id || row.gymId}`} className="text-pink-500 font-semibold no-underline hover:text-pink-700 transition-colors">
          {row.name}
        </Link>
      ),
    },
    { key: 'address', label: 'Address' },
    { key: 'country', label: 'Country' },
    { key: 'email', label: 'Email', render: (row) => <span className="normal-case">{row.email}</span> },
    { key: 'phoneNumber', label: 'Phone' },
    {
      key: 'isActive',
      label: 'Status',
      render: (row) => (
        <Chip
          label={row.isActive ? 'Active' : 'Inactive'}
          size="small"
          sx={{
            bgcolor: row.isActive ? '#f0fdf4' : '#fef2f2',
            color: row.isActive ? '#16a34a' : '#dc2626',
            border: `1px solid ${row.isActive ? '#bbf7d0' : '#fecaca'}`,
            fontWeight: 600,
          }}
        />
      ),
    },
    ...(isSuperAdmin
      ? [{
          key: 'actions',
          label: 'Actions',
          align: 'right' as const,
          render: (row: Gym) => (
            <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                href={`/dashboard/gyms/${row.id || row.gymId}`}
                size="small"
                variant="outlined"
                sx={{ borderColor: '#e2e8f0', color: 'text.secondary', fontSize: '0.75rem', px: 1.5 }}
              >
                View
              </Button>
              <Button
                onClick={() => setDeleteId(row.id || row.gymId || '')}
                size="small"
                color="error"
                variant="outlined"
                sx={{ fontSize: '0.75rem', px: 1.5 }}
              >
                Delete
              </Button>
            </Stack>
          ),
        }]
      : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Gyms</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Manage all gym locations</Typography>
        </Box>
        {isSuperAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateModal(true)}
          >
            Add Gym
          </Button>
        )}
      </Box>

      <Box>
        <AppTable
          columns={columns}
          rows={gyms}
          isLoading={isLoading}
          emptyIcon="🏢"
          emptyTitle="No gyms found"
          emptySubtitle={isSuperAdmin ? "Everything else (members, staff, plans) belongs to a gym, so start with 'Add Gym'." : ''}
        />
        {totalCount > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </Box>

      {/* Create Gym Modal */}
      <AppModal
        open={showCreateModal}
        onClose={() => { setShowCreateModal(false); setForm(emptyForm); }}
        title="Create New Gym"
        subtitle="Fill in the details to add a new gym location."
        maxWidth="sm"
      >
        <form onSubmit={handleCreate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Name" required fullWidth value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} />
            <TextField label="Address" fullWidth value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} />
            <TextField label="Email" type="email" required fullWidth value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
            <TextField label="Phone Number" required fullWidth value={form.phoneNumber} onChange={(e) => setForm(p => ({ ...p, phoneNumber: e.target.value }))} />
            <TextField label="Country" required fullWidth value={form.country} onChange={(e) => setForm(p => ({ ...p, country: e.target.value }))} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => { setShowCreateModal(false); setForm(emptyForm); }} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Gym'}
            </Button>
          </Stack>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId!)}
        title="Delete Gym?"
        message="This removes the gym and everything linked to it: branches, members, staff, plans and records. It can't be undone."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
