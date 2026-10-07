'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { extractPagedItems, extractData, getErrorMessage } from '../../../lib/apiHelpers';
import { useGym } from '../../../context/GymContext';
import { GymContextChip } from '../../../components/ui/GymContextChip';
import { NoGymNotice } from '../../../components/ui/NoGymNotice';
import { formatDate, formatMoney } from '../../../lib/format';
import { toast } from 'react-toastify';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import {
  Button, TextField, Box, Chip, Typography, Stack, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Payment, PaymentForm, InitializePaymentResponse } from '../../../types/payment';
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
  const { gymId, isLoadingGyms } = useGym();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showInitModal, setShowInitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentForm>({ memberId: '', email: '', amount: '' });
  const [checkout, setCheckout] = useState<InitializePaymentResponse | null>(null);

  const fetchPayments = async () => {
    if (!gymId) { setPayments([]); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await api.get(`/payments/gym/${gymId}`, { params: { page: 1, pageSize: 100 } });
      const items = extractPagedItems(res);
      setPayments(items);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load payments.'));
      setPayments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!gymId) { setMembers([]); return; }
    try {
      const res = await api.get(`/members/all/${gymId}`, { params: { page: 1, pageSize: 100 } });
      const items = extractPagedItems(res);
      setMembers(items);
    } catch { setMembers([]); }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchPayments(); fetchMembers(); }, [gymId]);

  const handleInitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    if (!form.memberId) { toast.error('Please select a valid member.'); return; }
    setIsSubmitting(true);
    try {
      const member = members.find((m) => m.id === form.memberId);
      const res = await api.post(`/payments/initialize/${gymId}`, {
        memberId: form.memberId,
        email: form.email || member?.email || '',
        amount: parseFloat(form.amount),
      });
      toast.success('Payment started. Share the checkout link with the member.');
      setCheckout(extractData<InitializePaymentResponse>(res));
      setShowInitModal(false);
      setForm({ memberId: '', email: '', amount: '' });
      fetchPayments();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to initialize payment.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (reference: string) => {
    try {
      await api.post(`/payments/verify/${reference}`);
      toast.success('Payment verified successfully!');
      fetchPayments();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to verify payment.'));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/payments/${id}`);
      toast.success('Payment deleted successfully.');
      fetchPayments();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete payment.'));
    } finally {
      setDeleteId(null);
    }
  };

  const memberName = (id: string) => {
    const m = members.find((x) => x.id === id);
    return m ? `${m.firstName} ${m.lastName}` : '—';
  };

  const filtered = payments.filter(
    (p) =>
      p.transactionReference?.toLowerCase().includes(search.toLowerCase()) ||
      p.status?.toLowerCase().includes(search.toLowerCase()) ||
      memberName(p.memberId).toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Payment>[] = [
    {
      key: 'memberId',
      label: 'Member',
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{memberName(row.memberId)}</Typography>,
    },
    {
      key: 'transactionReference',
      label: 'Reference',
      render: (row) => (
        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.78rem', textTransform: 'none' }}>
          {row.transactionReference}
        </Typography>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (row) => (
        <Typography sx={{ fontWeight: 700 }} color="text.primary" variant="body2">
          {formatMoney(row.amount)}
        </Typography>
      ),
    },
    {
      key: 'paymentDate',
      label: 'Date',
      render: (row) => formatDate(row.paymentDate),
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
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Payments</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Membership payments collected through Paystack
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <GymContextChip />
          {gymId && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowInitModal(true)}>
              Request Payment
            </Button>
          )}
        </Stack>
      </Box>

      {!gymId && !isLoadingGyms && <NoGymNotice what="payments" />}

      {checkout?.authorizationUrl && (
        <Alert
          severity="success"
          sx={{ borderRadius: 2 }}
          onClose={() => setCheckout(null)}
          action={
            <Stack direction="row" sx={{ gap: 1 }}>
              <Button size="small" color="inherit" onClick={() => { navigator.clipboard?.writeText(checkout.authorizationUrl); toast.info('Checkout link copied.'); }}>Copy link</Button>
              <Button size="small" color="inherit" href={checkout.authorizationUrl} target="_blank" rel="noopener noreferrer">Open checkout</Button>
            </Stack>
          }
        >
          Payment <strong>{checkout.reference}</strong> is waiting for the member to pay. Once they have, select <strong>Verify</strong> on it below.
        </Alert>
      )}

      <TextField
        placeholder="Search by member, reference or status..."
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
        title="Request Payment"
        subtitle="Creates a Paystack checkout link for the member to pay."
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
              onChange={(e) => {
                const m = members.find((x) => x.id === e.target.value);
                setForm(p => ({ ...p, memberId: e.target.value, email: m?.email ?? '' }));
              }}
              helperText={members.length === 0 ? 'Add members to this gym first.' : undefined}
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
                htmlInput: { step: '0.01', min: '0.01' },
              }}
            />
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={() => setShowInitModal(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating link...' : 'Create Checkout Link'}
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
