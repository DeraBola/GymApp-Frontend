'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { AppTable, AppModal, Column } from '@repo/ui';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../../lib/api';
import { extractData, getErrorMessage } from '../../../lib/apiHelpers';
import { Permissions } from '../../../lib/auth';
import { useAuth } from '../../../context/AuthContext';
import { useGym } from '../../../context/GymContext';
import { GymContextChip } from '../../../components/ui/GymContextChip';
import { NoGymNotice } from '../../../components/ui/NoGymNotice';
import { Branch, BranchForm, GymDetail } from '../../../types/gym';

const emptyForm: BranchForm = { name: '', address: '', phoneNumber: '' };

/** Locations of the gym currently being managed. */
export default function BranchesPage() {
  const { can } = useAuth();
  const { gymId, activeGym, isLoadingGyms } = useGym();
  // Matches the API: managing your own gym (details and branches) needs ManageUsers.
  const canManage = can(Permissions.ManageUsers);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBranches = useCallback(async () => {
    if (!gymId) { setBranches([]); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await api.get(`/gym/${gymId}`);
      setBranches(extractData<GymDetail>(res)?.branches ?? []);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load branches.'));
      setBranches([]);
    } finally {
      setIsLoading(false);
    }
  }, [gymId]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    setIsSubmitting(true);
    try {
      await api.post(`/branch/${gymId}`, form);
      toast.success(`${form.name} branch added.`);
      setShowForm(false);
      setForm(emptyForm);
      fetchBranches();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to add branch.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Branch>[] = [
    { key: 'name', label: 'Branch', render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.name}</Typography> },
    { key: 'address', label: 'Address' },
    { key: 'phoneNumber', label: 'Phone' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Branches</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Every location of {activeGym ? <span className="capitalize">{activeGym.name}</span> : 'this gym'}.{' '}
            {gymId && (
              <Link href={`/dashboard/gyms/${gymId}`} className="text-pink-600 hover:text-pink-700 no-underline">
                View gym details →
              </Link>
            )}
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <GymContextChip />
          {canManage && gymId && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setForm(emptyForm); setShowForm(true); }}>
              Add Branch
            </Button>
          )}
        </Stack>
      </Box>

      {!gymId && !isLoadingGyms && <NoGymNotice what="branches" />}

      <AppTable
        columns={columns}
        rows={branches}
        isLoading={isLoading}
        emptyIcon="📍"
        emptyTitle="No branches yet."
        emptySubtitle={canManage && gymId ? "Use 'Add Branch' to add this gym's first location." : undefined}
      />

      <AppModal open={showForm} onClose={() => setShowForm(false)} title="Add Branch" subtitle={activeGym ? `A new location for ${activeGym.name}.` : undefined} maxWidth="sm">
        <form onSubmit={handleCreate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Branch Name" required fullWidth value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Lekki Phase 1" />
            <TextField label="Address" required fullWidth value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
            <TextField label="Phone Number" type="tel" required fullWidth value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowForm(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Branch'}</Button>
          </Stack>
        </form>
      </AppModal>
    </Box>
  );
}
