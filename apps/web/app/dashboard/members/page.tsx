'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';
import { toast } from 'react-toastify';
import { AppTable, Column } from '@repo/ui';
import { Box, Chip, Typography, TextField, Alert } from '@mui/material';
import { Member } from '../../../types/member';

const statusChip = (status: string) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    active:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    expired: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    pending: { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  };
  const s = map[status?.toLowerCase()] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
  return <Chip label={status || 'Unknown'} size="small" sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 600 }} />;
};

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        if (!user?.gymId) { setMembers([]); setIsLoading(false); return; }
        const res = await api.get(`/members/all/${user.gymId}`);
        const data = res.data?.data ?? res.data?.value ?? res.data ?? [];
        setMembers(Array.isArray(data) ? data : []);
      } catch {
        toast.error('Failed to load members.');
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, [user?.gymId]);

  const filtered = members.filter(
    (m) =>
      m.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Member>[] = [
    {
      key: 'name',
      label: 'Member',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
            {row.firstName?.[0]?.toUpperCase()}{row.lastName?.[0]?.toUpperCase()}
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">
            {row.firstName} {row.lastName}
          </Typography>
        </Box>
      ),
    },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Phone' },
    {
      key: 'membershipStatus',
      label: 'Status',
      render: (row) => statusChip(row.membershipStatus),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Members</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user?.gymId ? `${filtered.length} member(s) in your gym` : 'Select a gym to view its members'}
          </Typography>
        </Box>
      </Box>

      {!user?.gymId && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Member listing requires a gym to be selected. This view is available to gym-level staff and members.
        </Alert>
      )}

      <TextField
        placeholder="Search by name or email..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
      />

      <AppTable
        columns={columns}
        rows={filtered}
        isLoading={isLoading}
        emptyIcon="👥"
        emptyTitle={search ? 'No members match your search.' : 'No members found.'}
      />
    </Box>
  );
}
