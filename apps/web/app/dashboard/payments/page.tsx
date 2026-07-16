'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { extractPagedItems, extractData } from '../../../lib/apiHelpers';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import {
  Button, TextField, Box, Chip, Typography, Stack, Alert, InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Payment, PaymentForm } from '../../../types/payment';
import { Member } from '../../../types/member';

const statusChip = (status: string) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    success:   { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    completed: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
    failed:    { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
    pending:   { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  };
  const s = map[status?.toLowerCase()] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
  return <Chip label={status || 'Unknown'} size="small" sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 600 }} />;
};

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInitModal, setShowInitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentForm>({ memberId: '', email: '', amount: '' });

  const fetchPayments = async () => {
    if (!user?.gymId) { setPayments([]); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await api.get(`/payments/gym/${user.gymId}`);
      const items = extractPagedItems(res);
      setPayments(items);
    } catch {
      toast.error('Failed to load payments.');
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!user?.gymId) return;
    try {
      const res = await api.get(`/members/all/${user.gymId}`);
      const items = extractPagedItems(res);
      setMembers(items);
    } catch { setMembers([]); }
  };

  useEffect(() => { fetchPayments(); fetchMembers(); }, [user?.gymId]);

  const handleInitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.gymId) return;
    if (!form.memberId) { toast.error('Please select a valid member.'); return; }
    setIsSubmitting(true);
    try {
      await api.post(`/payments/initialize/${user.gymId}`, {
        memberId: form.memberId,
        email: form.email,
        amount: parseFloat(form.amount),
      });
      toast.success('Payment initialized successfully!');
      setShowInitModal(false);
      setForm({ memberId: '', email: '', amount: '' });
      fetchPayments();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.response?.data?.detail || 'Failed to initialize payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (reference: string) => {
    try {
      await api.post(`/payments/verify/${reference}`);
      toast.success('Payment verified successfully!');
      fetchPayments();
    } catch {
      toast.error('Failed to verify payment.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted successfully.');
      fetchPayments();
    } catch {
      toast.error('Failed to delete payment.');
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.transactionReference?.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Payment>[] = [
    {
      key: 'transactionReference',
      label: 'Reference',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>
          {row.transactionReference}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <Typography sx={{ fontWeight: 700 }} color="text.primary" variant="body2">
          ${row.amount?.toFixed(2)}
        </Typography>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (row) => new Date(row.paymentDate).toLocaleDateString(),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => statusChip(row.status),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (row) => (
        <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
          {row.status?.toLowerCase() === 'pending' && (
            <Button
              onClick={() => handleVerify(row.transactionReference)}
              size="small"
              variant="outlined"
              color="success"
              sx={{ fontSize: '0.75rem', px: 1.5 }}
            >
              Verify
            </Button>
          )}
          <Button
            onClick={() => setDeleteId(row.id)}
            size="small"
            color="error"
            variant="outlined"
            sx={{ fontSize: '0.75rem', px: 1.5 }}
          >
            Delete
          </Button>
        </Stack>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Payments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user?.gymId ? `${filtered.length} payment(s)` : 'Select a gym to view its payments'}
          </Typography>
        </Box>
        {user?.gymId && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowInitModal(true)}>
            Initialize Payment
          </Button>
        )}
      </Box>

      {!user?.gymId && (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Payment listing requires a gym to be selected.
        </Alert>
      )}

      <TextField
        placeholder="Search by reference or status..."
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
        emptyIcon="💳"
        emptyTitle={search ? 'No payments match your search.' : 'No payments found.'}
      />

      {/* Initialize Payment Modal */}
      <AppModal
        open={showInitModal}
        onClose={() => { setShowInitModal(false); setForm({ memberId: '', email: '', amount: '' }); }}
        title="Initialize Payment"
        subtitle="Create a new payment for a member."
        maxWidth="xs"
      >
        <form onSubmit={handleInitPayment}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            <TextField
              select
              label="Member"
              required
              fullWidth
              value={form.memberId}
              onChange={(e) => setForm(p => ({ ...p, memberId: e.target.value }))}
              slotProps={{ select: { native: true } }}
            >
              <option value="" disabled />
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.firstName} {m.lastName} ({m.email})
                </option>
              ))}
            </TextField>
            <TextField
              label="Amount"
              type="number"
              required
              fullWidth
              value={form.amount}
              onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
              slotProps={{
                input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                htmlInput: { step: '0.01', min: '0.01' },
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowInitModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Initializing...' : 'Initialize'}
            </Button>
          </Stack>
        </form>
      </AppModal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => handleDelete(deleteId!)}
        title="Delete Payment?"
        message="This action cannot be undone and will remove the payment record."
        confirmLabel="Delete"
        confirmColor="error"
      />
    </Box>
  );
}
