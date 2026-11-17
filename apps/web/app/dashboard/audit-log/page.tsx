'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { AppTable, AppModal, Column } from '@repo/ui';
import {
  Box, Button, Chip, MenuItem, Stack, TablePagination, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import api from '../../../lib/api';
import { extractPagedResult, getErrorMessage } from '../../../lib/apiHelpers';
import { Permissions } from '../../../lib/auth';
import { useAuth } from '../../../context/AuthContext';
import { useGym } from '../../../context/GymContext';
import { GymContextChip } from '../../../components/ui/GymContextChip';
import { RequireAccess } from '../../../components/layout/RequireAccess';

interface AuditLog {
  id: string;
  occurredAt: string;
  gymId?: string | null;
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  changes?: string | null;
  ipAddress?: string | null;
}

type FieldChange = { from?: unknown; to?: unknown };

const ACTIONS: Record<string, { label: string; bg: string; color: string; border: string }> = {
  Created:      { label: 'Created',        bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Updated:      { label: 'Updated',        bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  Deleted:      { label: 'Deleted',        bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
  Viewed:       { label: 'Viewed',         bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  Denied:       { label: 'Denied',         bg: '#fff1f2', color: '#be123c', border: '#fecdd3' },
  Failed:       { label: 'Failed',         bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  SignedIn:     { label: 'Signed in',      bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  SignedOut:    { label: 'Signed out',     bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' },
  SignInFailed: { label: 'Sign-in failed', bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
};

const RECORD_TYPES: { value: string; label: string }[] = [
  { value: 'Member', label: 'Members' },
  { value: 'Staff', label: 'Staff' },
  { value: 'Payment', label: 'Payments' },
  { value: 'Sale', label: 'Sales' },
  { value: 'InventoryItem', label: 'Inventory' },
  { value: 'MembershipPlan', label: 'Membership plans' },
  { value: 'GymClass', label: 'Classes' },
  { value: 'Equipment', label: 'Equipment' },
  { value: 'EquipmentRepair', label: 'Repairs' },
  { value: 'Branch', label: 'Branches' },
  { value: 'Gym', label: 'Gyms' },
  { value: 'User', label: 'Users & sign-ins' },
  { value: 'UserRole', label: 'Role assignments' },
  { value: 'Role', label: 'Roles' },
  { value: 'Permission', label: 'Permissions' },
  { value: 'RolePermission', label: 'Role permissions' },
  { value: 'SalesReport', label: 'Sales report' },
  { value: 'AuditLog', label: 'Audit log' },
];

// Bookkeeping columns that add noise to the change list.
const HIDDEN_FIELDS = new Set(['Id', 'GymId', 'MemberId', 'StaffId', 'CreatedAt']);

const formatWhen = (iso: string) => {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)} h ago`;
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
};

const show = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

/** YYYY-MM-DD in the browser's local calendar. */
const localDay = (iso: string) => {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

function AuditLogContent() {
  const { isAdmin } = useAuth();
  const { gymId, gyms } = useGym();

  const [rows, setRows] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  // Super Admins can look at the selected gym or across every gym.
  const [scope, setScope] = useState<'gym' | 'all'>('gym');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selected, setSelected] = useState<AuditLog | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(0); }, [debouncedSearch, action, entityType, from, to, scope, gymId]);

  const allGyms = isAdmin && (scope === 'all' || !gymId);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = { page: page + 1, pageSize };
      if (isAdmin && !allGyms && gymId) params.gymId = gymId;
      if (debouncedSearch) params.search = debouncedSearch;
      if (action) params.action = action;
      if (entityType) params.entityType = entityType;
      // Date inputs are local calendar days; "to" includes the whole day.
      if (from) params.from = new Date(`${from}T00:00:00`).toISOString();
      if (to) {
        const end = new Date(`${to}T00:00:00`);
        end.setDate(end.getDate() + 1);
        params.to = end.toISOString();
      }
      const res = await api.get('/audit-logs', { params });
      const result = extractPagedResult<AuditLog>(res);
      setRows(result?.items ?? []);
      setTotalCount(result?.totalCount ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load the audit log.'));
      setRows([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, isAdmin, allGyms, gymId, debouncedSearch, action, entityType, from, to]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const gymName = useCallback(
    (id?: string | null) => (id ? gyms.find((g) => g.id === id)?.name ?? 'Unknown gym' : 'Platform'),
    [gyms],
  );

  const hasFilters = !!(search || action || entityType || from || to);
  const clearFilters = () => { setSearch(''); setAction(''); setEntityType(''); setFrom(''); setTo(''); };

  const changes = useMemo(() => {
    if (!selected?.changes) return [];
    try {
      const parsed = JSON.parse(selected.changes) as Record<string, FieldChange>;
      return Object.entries(parsed).filter(([field]) => !HIDDEN_FIELDS.has(field));
    } catch {
      return [];
    }
  }, [selected]);

  const columns: Column<AuditLog>[] = [
    {
      key: 'occurredAt',
      label: 'When',
      render: (row) => (
        <span title={new Date(row.occurredAt).toLocaleString()} className="whitespace-nowrap normal-case">
          {formatWhen(row.occurredAt)}
        </span>
      ),
    },
    {
      key: 'userEmail',
      label: 'Who',
      render: (row) => <span className="normal-case text-slate-700">{row.userEmail || 'System'}</span>,
    },
    {
      key: 'action',
      label: 'Action',
      render: (row) => {
        const a = ACTIONS[row.action] ?? { label: row.action, bg: '#f8fafc', color: '#475569', border: '#e2e8f0' };
        return <Chip label={a.label} size="small" sx={{ bgcolor: a.bg, color: a.color, border: `1px solid ${a.border}` }} />;
      },
    },
    {
      key: 'summary',
      label: 'What',
      render: (row) => <Typography variant="body2" color="text.primary" sx={{ textTransform: 'none' }}>{row.summary}</Typography>,
    },
    ...(allGyms
      ? [{
          key: 'gymId',
          label: 'Gym',
          render: (row: AuditLog) => <span className="capitalize">{gymName(row.gymId)}</span>,
        }]
      : []),
    {
      key: 'details',
      label: '',
      align: 'right',
      render: (row) =>
        row.changes ? (
          <Button size="small" variant="outlined" onClick={() => setSelected(row)} sx={{ fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' }}>
            Details
          </Button>
        ) : null,
    },
  ];

  // Group consecutive rows by day for easier scanning.
  const firstOfDay = useMemo(() => {
    const ids = new Set<string>();
    let lastDay = '';
    for (const r of rows) {
      const day = localDay(r.occurredAt).toDateString();
      if (day !== lastDay) { ids.add(r.id); lastDay = day; }
    }
    return ids;
  }, [rows]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">Audit Log</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Everything people do: what they viewed, created, changed or deleted, plus sign-ins and refused attempts. Entries can’t be edited or deleted.
          </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          {isAdmin && gymId && (
            <ToggleButtonGroup size="small" exclusive value={scope} onChange={(_, v) => v && setScope(v)} aria-label="Which gyms">
              <ToggleButton value="gym" sx={{ textTransform: 'none', px: 1.5 }}>This gym</ToggleButton>
              <ToggleButton value="all" sx={{ textTransform: 'none', px: 1.5 }}>All gyms</ToggleButton>
            </ToggleButtonGroup>
          )}
          {!allGyms && <GymContextChip />}
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '2fr 1fr 1fr 1fr 1fr' } }}>
        <TextField
          placeholder="Search by description or email..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
          slotProps={{ htmlInput: { style: { textTransform: 'none' } } }}
        />
        <TextField select size="small" label="Action" value={action} onChange={(e) => setAction(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}>
          <MenuItem value="">All actions</MenuItem>
          {Object.entries(ACTIONS).map(([value, a]) => <MenuItem key={value} value={value}>{a.label}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Record" value={entityType} onChange={(e) => setEntityType(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}>
          <MenuItem value="">All records</MenuItem>
          {RECORD_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
        </TextField>
        <TextField size="small" type="date" label="From" value={from} onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }} />
        <TextField size="small" type="date" label="To" value={to} onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }} />
      </Box>

      {hasFilters && (
        <Box>
          <Button size="small" onClick={clearFilters} sx={{ color: 'text.secondary' }}>Clear filters</Button>
        </Box>
      )}

      <Box>
        <AppTable
          columns={columns.map((c) =>
            c.key === 'occurredAt'
              ? {
                  ...c,
                  render: (row: AuditLog) => (
                    <Box>
                      {firstOfDay.has(row.id) && (
                        <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#9333ea', textTransform: 'none' }}>
                          {localDay(row.occurredAt).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                        </Typography>
                      )}
                      {c.render?.(row)}
                    </Box>
                  ),
                }
              : c,
          )}
          rows={rows}
          isLoading={isLoading}
          emptyIcon="📜"
          emptyTitle={hasFilters ? 'Nothing matches these filters.' : 'No activity recorded yet.'}
          emptySubtitle={hasFilters ? undefined : 'Changes and sign-ins will appear here as people use the dashboard.'}
          skeletonRows={6}
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
        title={selected?.summary ?? 'Change details'}
        subtitle={selected ? `${selected.userEmail || 'System'} · ${new Date(selected.occurredAt).toLocaleString()}${selected.ipAddress ? ` · ${selected.ipAddress}` : ''}` : undefined}
        maxWidth="md"
      >
        {changes.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No field details for this entry.</Typography>
        ) : (
          <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', mb: 2, fontSize: '0.85rem', '& td, & th': { borderBottom: '1px solid #f1f5f9', p: 1.25, textAlign: 'left', verticalAlign: 'top', textTransform: 'none' }, '& th': { color: '#64748b', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em' } }}>
            <thead>
              <tr>
                <th>Field</th>
                {selected?.action !== 'Created' && <th>Before</th>}
                {selected?.action !== 'Deleted' && <th>After</th>}
              </tr>
            </thead>
            <tbody>
              {changes.map(([field, change]) => (
                <tr key={field}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{field.replace(/([a-z])([A-Z])/g, '$1 $2')}</td>
                  {selected?.action !== 'Created' && <td style={{ color: '#dc2626', wordBreak: 'break-word' }}>{show(change.from)}</td>}
                  {selected?.action !== 'Deleted' && <td style={{ color: '#16a34a', wordBreak: 'break-word' }}>{show(change.to)}</td>}
                </tr>
              ))}
            </tbody>
          </Box>
        )}
      </AppModal>
    </Box>
  );
}

export default function AuditLogPage() {
  return (
    <RequireAccess permission={Permissions.ManageUsers} message="Only gym admins can view the audit log.">
      <AuditLogContent />
    </RequireAccess>
  );
}
