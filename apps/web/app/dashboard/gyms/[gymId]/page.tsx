'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../lib/api';
import { toast } from 'react-toastify';
import { AppTable, AppModal, Column } from '@repo/ui';
import {
  Button, TextField, Box, Typography, Stack, Chip, Checkbox, FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { Gym, Branch, EditGymForm, BranchForm } from '../../../../types/gym';

export default function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [gym, setGym] = useState<Gym | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editForm, setEditForm] = useState<EditGymForm>({ name: '', address: '', email: '', phoneNumber: '', country: '', isActive: true });
  const [branchForm, setBranchForm] = useState<BranchForm>({ name: '', address: '', phoneNumber: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGym = async () => {
    try {
      const res = await api.get(`/gym/${gymId}`);
      const data = res.data?.data ?? res.data?.value ?? res.data;
      setGym(data);
      setEditForm({
        name: data.name ?? '',
        address: data.address ?? '',
        email: data.email ?? '',
        phoneNumber: data.phoneNumber ?? '',
        country: data.country ?? '',
        isActive: data.isActive ?? true,
      });
    } catch {
      setGym(null);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await fetchGym();
      setIsLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/gym/${gymId}`, editForm);
      toast.success('Gym updated successfully!');
      await fetchGym();
      setShowEditModal(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to update gym.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/branch/${gymId}`, branchForm);
      toast.success('Branch added successfully!');
      setShowBranchModal(false);
      setBranchForm({ name: '', address: '', phoneNumber: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to create branch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const branchColumns: Column<Branch>[] = [
    { key: 'name', label: 'Branch Name', render: (row) => <Typography sx={{ fontWeight: 600 }} variant="body2" color="text.primary">{row.name}</Typography> },
    { key: 'address', label: 'Address' },
    { key: 'phoneNumber', label: 'Phone' },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-32 rounded-2xl bg-slate-100" />
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-2">😕</p>
        <p className="font-semibold text-slate-700">Gym not found</p>
        <Link href="/dashboard/gyms" className="text-pink-500 text-sm mt-2 inline-block hover:text-pink-700 transition-colors">
          ← Back to Gyms
        </Link>
      </div>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.875rem', color: '#64748b' }}>
        <Link href="/dashboard/gyms" className="text-slate-500 hover:text-pink-500 transition-colors no-underline text-sm">Gyms</Link>
        <span>›</span>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>{gym.name}</Typography>
      </Box>

      {/* Gym Info Card */}
      <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 3, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ width: 56, height: 56, bgcolor: '#fdf4ff', border: '1px solid #f3e8ff', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
              🏢
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }} color="text.primary">{gym.name}</Typography>
              <Typography variant="body2" color="text.secondary">{gym.address || 'No address set'}</Typography>
              <Chip
                label={gym.isActive ? 'Active' : 'Inactive'}
                size="small"
                sx={{ mt: 0.5, bgcolor: gym.isActive ? '#f0fdf4' : '#fef2f2', color: gym.isActive ? '#16a34a' : '#dc2626', border: `1px solid ${gym.isActive ? '#bbf7d0' : '#fecaca'}`, fontWeight: 600 }}
              />
            </Box>
          </Box>
          {isSuperAdmin && (
            <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setShowEditModal(true)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary', fontSize: '0.8rem' }}>
              Edit
            </Button>
          )}
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' }, gap: 2, mt: 2, pt: 2, borderTop: '1px solid #f1f5f9' }}>
          {[
            { label: 'Email', value: gym.email },
            { label: 'Phone', value: gym.phoneNumber },
            { label: 'Country', value: gym.country },
          ].map(({ label, value }) => (
            <Box key={label}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>{label}</Typography>
              <Typography variant="body2" color="text.primary">{value || '—'}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Branches */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} color="text.primary">Branches</Typography>
          {isSuperAdmin && (
            <Button variant="contained" startIcon={<AddIcon />} size="small" onClick={() => setShowBranchModal(true)}>
              Add Branch
            </Button>
          )}
        </Box>
        <AppTable
          columns={branchColumns}
          rows={branches}
          emptyIcon="🏗️"
          emptyTitle="No branches yet."
          emptySubtitle={isSuperAdmin ? 'Add one using the button above.' : ''}
        />
      </Box>

      {/* Edit Gym Modal */}
      <AppModal open={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Gym" maxWidth="sm">
        <form onSubmit={handleUpdate}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Name" required fullWidth value={editForm.name} onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))} />
            <TextField label="Address" fullWidth value={editForm.address} onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))} />
            <TextField label="Email" type="email" fullWidth value={editForm.email} onChange={(e) => setEditForm(p => ({ ...p, email: e.target.value }))} />
            <TextField label="Phone Number" fullWidth value={editForm.phoneNumber} onChange={(e) => setEditForm(p => ({ ...p, phoneNumber: e.target.value }))} />
            <TextField label="Country" required fullWidth value={editForm.country} onChange={(e) => setEditForm(p => ({ ...p, country: e.target.value }))} />
            <FormControlLabel
              control={<Checkbox checked={editForm.isActive} onChange={(e) => setEditForm(p => ({ ...p, isActive: e.target.checked }))} sx={{ color: '#ec4899', '&.Mui-checked': { color: '#ec4899' } }} />}
              label="Active"
            />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowEditModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
          </Stack>
        </form>
      </AppModal>

      {/* Add Branch Modal */}
      <AppModal open={showBranchModal} onClose={() => setShowBranchModal(false)} title="Add Branch" maxWidth="sm">
        <form onSubmit={handleCreateBranch}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField label="Branch Name" required fullWidth value={branchForm.name} onChange={(e) => setBranchForm(p => ({ ...p, name: e.target.value }))} />
            <TextField label="Address" fullWidth value={branchForm.address} onChange={(e) => setBranchForm(p => ({ ...p, address: e.target.value }))} />
            <TextField label="Phone Number" fullWidth value={branchForm.phoneNumber} onChange={(e) => setBranchForm(p => ({ ...p, phoneNumber: e.target.value }))} />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowBranchModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Adding...' : 'Add Branch'}</Button>
          </Stack>
        </form>
      </AppModal>
    </Box>
  );
}
