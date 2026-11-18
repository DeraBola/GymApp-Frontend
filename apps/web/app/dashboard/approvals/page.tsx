'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { AppTable, AppModal, Column } from '@repo/ui';
import {
  Alert, Box, Button, Chip, Skeleton, Stack, Tab, Tabs, TablePagination, TextField, Typography,
} from '@mui/material';
import api from '../../../lib/api';
import { extractData, extractPagedResult, getErrorMessage } from '../../../lib/apiHelpers';
import { Permissions } from '../../../lib/auth';
import { formatDate, formatMoney, loadEquipmentOptions } from '../../../lib/format';
import { useAuth } from '../../../context/AuthContext';
import { useGym } from '../../../context/GymContext';
import { GymContextChip } from '../../../components/ui/GymContextChip';
import { NoGymNotice } from '../../../components/ui/NoGymNotice';

interface ApprovalRequest {
  id: string;
  gymId: string;
  entityType: 'Equipment' | 'EquipmentRepair' | string;
  operation: 'Create' | 'Update' | 'Delete' | string;
  targetId?: string | null;
  summary: string;
  payload: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Failed' | string;
  requestedByUserId: string;
  requestedByEmail?: string | null;
  requestedByName?: string | null;
  requestedAt: string;
  reviewedByEmail?: string | null;
  reviewedAt?: string | null;
  reviewNote?: string | null;
}

type Payload = {
  Name?: string | null;
  Description?: string | null;
  PurchaseDate?: string | null;
  EquipmentId?: string | null;
  RepairCost?: number | null;
  RepairDate?: string | null;
  Status?: string | null;
};

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string; label: string }> = {
  Pending:  { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'Pending' },
  Approved: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Approved' },
  Rejected: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca', label: 'Rejected' },
  Failed:   { bg: '#fff7ed', color: '#c2410c', border: '#fed7aa', label: 'Couldn’t apply' },
};

const OPERATION_LABEL: Record<string, string> = { Create: 'Add', Update: 'Edit', Delete: 'Delete' };
const TYPE_LABEL: Record<string, string> = { Equipment: 'Equipment', EquipmentRepair: 'Repair' };

type ApprovalTab = 'Pending' | 'Approved' | 'Rejected' | '';

const ago = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return `${Math.round(mins / (60 * 24))} d ago`;
};

function StatusChip({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: '#f8fafc', color: '#475569', border: '#e2e8f0', label: status };
  return <Chip label={s.label} size="small" sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}` }} />;
}

export default function ApprovalsPage() {
  const { user, can } = useAuth();
  const { gymId, isLoadingGyms } = useGym();
  const isApprover = can(Permissions.ManageUsers);

  const [tab, setTab] = useState<ApprovalTab>('Pending');
  const [rows, setRows] = useState<ApprovalRequest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const [selected, setSelected] = useState<ApprovalRequest | null>(null);
  const [current, setCurrent] = useState<Payload | null>(null);
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(false);
  const [equipmentNames, setEquipmentNames] = useState<Record<string, string>>({});
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [isActing, setIsActing] = useState(false);

  useEffect(() => { setPage(0); }, [tab, gymId]);

  const fetchRows = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: page + 1, pageSize };
      if (tab) params.status = tab;
      if (gymId) params.gymId = gymId;
      const [res, pending] = await Promise.all([
        api.get('/approvals', { params }),
        api.get('/approvals', { params: { status: 'Pending', pageSize: 1, ...(gymId ? { gymId } : {}) } }),
      ]);
      const result = extractPagedResult<ApprovalRequest>(res);
      setRows(result?.items ?? []);
      setTotalCount(result?.totalCount ?? 0);
      setPendingCount(extractPagedResult(pending)?.totalCount ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load approval requests.'));
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, tab, gymId]);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  // Equipment names, for showing which machine a repair is for.
  useEffect(() => {
    if (!gymId) return;
    loadEquipmentOptions(gymId)
      .then((opts) => setEquipmentNames(Object.fromEntries(opts.map((o) => [o.value, o.label]))))
      .catch(() => setEquipmentNames({}));
  }, [gymId]);

  const proposed = useMemo<Payload>(() => {
    try { return selected ? (JSON.parse(selected.payload) as Payload) : {}; } catch { return {}; }
  }, [selected]);

  // For edits and deletes, show what the record looks like now next to what was asked for.
  const openDetails = async (row: ApprovalRequest) => {
    setSelected(row);
    setCurrent(null);
    setRejecting(false);
    setReason('');
    if (!row.targetId || row.operation === 'Create' || row.status !== 'Pending') return;
    setIsLoadingCurrent(true);
    try {
      const url = row.entityType === 'Equipment' ? `/equipments/${row.targetId}` : `/repairs/${row.targetId}`;
      const data = extractData<Record<string, unknown>>(await api.get(url));
      setCurrent({
        Name: data?.name as string,
        Description: data?.description as string,
        PurchaseDate: data?.purchaseDate as string,
        EquipmentId: data?.equipmentId as string,
        RepairCost: data?.repairCost as number,
        RepairDate: data?.repairDate as string,
        Status: data?.status as string,
      });
    } catch {
      setCurrent(null);
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const fields = (type: string): { key: keyof Payload; label: string; show: (p: Payload) => string }[] =>
    type === 'Equipment'
      ? [
          { key: 'Name', label: 'Name', show: (p) => p.Name || '—' },
          { key: 'Description', label: 'Description', show: (p) => p.Description || '—' },
          { key: 'PurchaseDate', label: 'Purchase date', show: (p) => formatDate(p.PurchaseDate) },
        ]
      : [
          { key: 'EquipmentId', label: 'Equipment', show: (p) => (p.EquipmentId ? equipmentNames[p.EquipmentId] ?? 'Unknown' : '—') },
          { key: 'Description', label: 'Work', show: (p) => p.Description || '—' },
          { key: 'RepairCost', label: 'Cost', show: (p) => formatMoney(p.RepairCost) },
          { key: 'RepairDate', label: 'Repair date', show: (p) => formatDate(p.RepairDate) },
          { key: 'Status', label: 'Status', show: (p) => p.Status || '—' },
        ];

  const isOwn = selected?.requestedByUserId === user?.id;

  const approve = async () => {
    if (!selected) return;
    setIsActing(true);
    try {
      const res = await api.post(`/approvals/${selected.id}/approve`);
      const updated = extractData<ApprovalRequest>(res);
      if (updated?.status === 'Approved') toast.success('Approved. The change has been applied.');
      else toast.warning(updated?.reviewNote ? `Approved, but it couldn’t be applied: ${updated.reviewNote}` : 'Approved, but it couldn’t be applied.');
      setSelected(null);
      fetchRows();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to approve.'));
    } finally {
      setIsActing(false);
    }
  };

  const reject = async () => {
    if (!selected || !reason.trim()) return;
    setIsActing(true);
    try {
      await api.post(`/approvals/${selected.id}/reject`, { reason: reason.trim() });
      toast.success('Request rejected. The requester will see your reason.');
      setSelected(null);
      fetchRows();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to reject.'));
    } finally {
      setIsActing(false);
    }
  };

  const columns: Column<ApprovalRequest>[] = [
    {
      key: 'requestedAt',
      label: 'Requested',
      render: (row) => <span className="whitespace-nowrap normal-case" title={new Date(row.requestedAt).toLocaleString()}>{ago(row.requestedAt)}</span>,
    },
    ...(isApprover
      ? [{
          key: 'requestedBy',
          label: 'By',
          render: (row: ApprovalRequest) => (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.requestedByName || '—'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none' }}>{row.requestedByEmail}</Typography>
            </Box>
          ),
        }]
      : []),
    {
      key: 'summary',
      label: 'Request',
      render: (row) => (
        <Box>
          <Stack direction="row" sx={{ gap: 0.75, mb: 0.5 }}>
            <Chip label={TYPE_LABEL[row.entityType] ?? row.entityType} size="small" sx={{ bgcolor: '#fdf4ff', color: '#9333ea', border: '1px solid #f3e8ff' }} />
            <Chip label={OPERATION_LABEL[row.operation] ?? row.operation} size="small" variant="outlined" sx={row.operation === 'Delete' ? { color: '#dc2626', borderColor: '#fecaca' } : { color: '#475569', borderColor: '#e2e8f0' }} />
          </Stack>
          <Typography variant="body2" color="text.primary" sx={{ textTransform: 'none' }}>{row.summary}</Typography>
        </Box>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Box>
          <StatusChip status={row.status} />
          {row.reviewNote && row.status !== 'Pending' && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textTransform: 'none', maxWidth: 240 }}>
              “{row.reviewNote}”
            </Typography>
          )}
        </Box>
      ),
    },
    {
      key: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Button size="small" variant={isApprover && row.status === 'Pending' ? 'contained' : 'outlined'} onClick={() => openDetails(row)}
          sx={isApprover && row.status === 'Pending' ? { fontSize: '0.75rem', px: 1.5 } : { fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' }}>
          {isApprover && row.status === 'Pending' ? 'Review' : 'View'}
        </Button>
      ),
    },
  ];

  const showCurrent = selected && selected.operation !== 'Create';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">{isApprover ? 'Approvals' : 'My Requests'}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isApprover
              ? 'Equipment and repair changes made by staff wait here until an admin approves them.'
              : 'Changes you asked for, and whether an admin has approved them yet.'}
          </Typography>
        </Box>
        <GymContextChip />
      </Box>

      {!gymId && !isLoadingGyms && <NoGymNotice what="approval requests" />}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: '1px solid #e2e8f0', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
        <Tab value="Pending" label={pendingCount > 0 ? `Pending (${pendingCount})` : 'Pending'} />
        <Tab value="Approved" label="Approved" />
        <Tab value="Rejected" label="Rejected" />
        <Tab value="" label="All" />
      </Tabs>

      <Box>
        <AppTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          emptyIcon={tab === 'Pending' ? '✅' : '🗂️'}
          emptyTitle={tab === 'Pending' ? (isApprover ? 'Nothing waiting for approval.' : 'You have no requests waiting.') : 'No requests here yet.'}
          emptySubtitle={tab === 'Pending' && !isApprover ? 'Add or change equipment or repairs and it will show up here.' : undefined}
        />
        {totalCount > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        )}
      </Box>

      <AppModal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.summary ?? ''}
        subtitle={selected ? `Requested by ${selected.requestedByName || selected.requestedByEmail || 'staff'} · ${new Date(selected.requestedAt).toLocaleString()}` : undefined}
        maxWidth="sm"
      >
        {selected && (
          <Stack spacing={2} sx={{ mt: 1, mb: 1 }}>
            <Box><StatusChip status={selected.status} /></Box>

            {selected.operation === 'Delete' ? (
              <Alert severity="warning" sx={{ borderRadius: 2 }}>
                Approving permanently deletes this {TYPE_LABEL[selected.entityType]?.toLowerCase() ?? 'record'}.
              </Alert>
            ) : (
              <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', '& td, & th': { borderBottom: '1px solid #f1f5f9', p: 1.25, textAlign: 'left', verticalAlign: 'top', textTransform: 'none' }, '& th': { color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
                <thead>
                  <tr>
                    <th>Field</th>
                    {showCurrent && <th>Now</th>}
                    <th>{selected.operation === 'Create' ? 'Value' : 'Proposed'}</th>
                  </tr>
                </thead>
                <tbody>
                  {fields(selected.entityType).map((f) => {
                    const after = f.show(proposed);
                    const before = current ? f.show(current) : null;
                    const changed = showCurrent && before !== null && before !== after;
                    return (
                      <tr key={f.key}>
                        <td style={{ fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{f.label}</td>
                        {showCurrent && (
                          <td style={{ color: '#64748b' }}>
                            {isLoadingCurrent ? <Skeleton width={80} /> : before ?? '—'}
                          </td>
                        )}
                        <td style={changed ? { color: '#16a34a', fontWeight: 600 } : { color: '#0f172a' }}>{after}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Box>
            )}

            {selected.status !== 'Pending' && (
              <Typography variant="body2" color="text.secondary">
                {selected.status === 'Approved' ? 'Approved' : selected.status === 'Rejected' ? 'Rejected' : 'Reviewed'}
                {selected.reviewedByEmail ? ` by ${selected.reviewedByEmail}` : ''}
                {selected.reviewedAt ? ` · ${new Date(selected.reviewedAt).toLocaleString()}` : ''}
                {selected.reviewNote ? <><br />Reason: “{selected.reviewNote}”</> : null}
              </Typography>
            )}

            {isApprover && selected.status === 'Pending' && (
              isOwn ? (
                <Alert severity="info" sx={{ borderRadius: 2 }}>You made this request, so another admin needs to review it.</Alert>
              ) : rejecting ? (
                <>
                  <TextField
                    label="Reason for rejecting"
                    required
                    autoFocus
                    multiline
                    rows={3}
                    fullWidth
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    helperText="The requester will see this."
                    slotProps={{ htmlInput: { maxLength: 1000, style: { textTransform: 'none' } } }}
                  />
                  <Stack direction="row" spacing={1.5}>
                    <Button fullWidth variant="outlined" onClick={() => setRejecting(false)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Back</Button>
                    <Button fullWidth variant="contained" color="error" disabled={isActing || !reason.trim()} onClick={reject}>
                      {isActing ? 'Rejecting...' : 'Reject Request'}
                    </Button>
                  </Stack>
                </>
              ) : (
                <Stack direction="row" spacing={1.5}>
                  <Button fullWidth variant="outlined" color="error" onClick={() => setRejecting(true)} disabled={isActing}>Reject</Button>
                  <Button fullWidth variant="contained" onClick={approve} disabled={isActing}>
                    {isActing ? 'Applying...' : selected.operation === 'Delete' ? 'Approve & Delete' : 'Approve & Apply'}
                  </Button>
                </Stack>
              )
            )}
          </Stack>
        )}
      </AppModal>
    </Box>
  );
}
