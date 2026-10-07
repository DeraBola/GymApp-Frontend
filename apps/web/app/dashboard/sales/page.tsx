'use client';

import { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';
import { toast } from 'react-toastify';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { useGym } from '../../../context/GymContext';
import api from '../../../lib/api';
import { extractData, getErrorMessage } from '../../../lib/apiHelpers';
import {
  formatDate, formatMoney, int, loadInventoryOptions, loadMemberOptions, num, toDateInput, toIso,
} from '../../../lib/format';
import { Sale, SalesReport } from '../../../types/resources';

const config: GymResourceConfig<Sale> = {
  title: 'Sales',
  subtitle: 'Inventory items sold at the gym',
  singular: 'Sale',
  emptyIcon: '💎',
  listUrl: (gymId) => `/sales/gym/${gymId}`,
  createUrl: (gymId) => `/sales/${gymId}`,
  updateUrl: (row, gymId) => `/sales/${gymId}/${row.id}`,
  deleteUrl: (row) => `/sales/${row.id}`,
  fields: [
    { name: 'inventoryItemId', label: 'Item', type: 'select', required: true, loadOptions: loadInventoryOptions },
    { name: 'quantity', label: 'Quantity', type: 'number', required: true, step: '1', min: '1' },
    { name: 'totalPrice', label: 'Total Price', type: 'number', required: true, step: '0.01', min: '0' },
    { name: 'saleDate', label: 'Sale Date', type: 'date', required: true },
    { name: 'memberId', label: 'Member (optional)', type: 'select', loadOptions: loadMemberOptions },
  ],
  columns: (lookups) => [
    {
      key: 'inventoryItemId',
      label: 'Item',
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{lookups.inventoryItemId?.[row.inventoryItemId] ?? 'Unknown item'}</Typography>,
    },
    { key: 'quantity', label: 'Qty' },
    { key: 'totalPrice', label: 'Total', render: (row) => formatMoney(row.totalPrice) },
    { key: 'saleDate', label: 'Date', render: (row) => formatDate(row.saleDate) },
    { key: 'memberId', label: 'Member', render: (row) => (row.memberId ? lookups.memberId?.[row.memberId] ?? '—' : 'Walk-in') },
  ],
  toForm: (row) => ({
    inventoryItemId: row.inventoryItemId ?? '',
    quantity: String(row.quantity ?? ''),
    totalPrice: String(row.totalPrice ?? ''),
    saleDate: toDateInput(row.saleDate),
    memberId: row.memberId ?? '',
  }),
  toPayload: (f) => ({
    inventoryItemId: f.inventoryItemId,
    quantity: int(f.quantity),
    totalPrice: num(f.totalPrice),
    saleDate: toIso(f.saleDate),
    memberId: f.memberId || null,
  }),
  searchText: (row, lookups) => `${lookups.inventoryItemId?.[row.inventoryItemId] ?? ''} ${lookups.memberId?.[row.memberId ?? ''] ?? ''}`,
  // Front desk picks an item and quantity; the total fills itself in (still editable for discounts).
  onFormChange: (form, changed, options) => {
    if (changed !== 'inventoryItemId' && changed !== 'quantity') return form;
    const item = options.inventoryItemId?.find((o) => o.value === form.inventoryItemId);
    const price = Number(item?.meta?.price);
    const qty = int(form.quantity);
    if (!item || Number.isNaN(price) || Number.isNaN(qty)) return form;
    return { ...form, totalPrice: (price * qty).toFixed(2) };
  },
  helperText: (form, options) => {
    const item = options.inventoryItemId?.find((o) => o.value === form.inventoryItemId);
    const stock = Number(item?.meta?.quantity);
    const qty = int(form.quantity);
    return {
      totalPrice: 'Calculated from unit price × quantity — adjust for discounts.',
      quantity: item && !Number.isNaN(stock) && qty > stock ? `Only ${stock} in stock.` : undefined,
      memberId: 'Leave empty for a walk-in customer.',
    };
  },
};

const firstOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
};
const today = () => new Date().toISOString().slice(0, 10);

function SalesReportCard() {
  const { gymId } = useGym();
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(today);
  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    if (!gymId) return;
    if (startDate > endDate) { toast.error('The start date must be before the end date.'); return; }
    setIsLoading(true);
    try {
      // End date is inclusive: report up to the end of that day.
      const end = new Date(endDate);
      end.setDate(end.getDate() + 1);
      const res = await api.get(`/sales-report/${gymId}`, {
        params: { startDate: new Date(startDate).toISOString(), endDate: end.toISOString() },
      });
      setReport(extractData<SalesReport>(res));
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load sales report.'));
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchReport(); }, [gymId]);

  if (!gymId) return null;

  const stats = [
    { label: 'Sales Revenue', value: formatMoney(report?.totalSales) },
    { label: 'Items Sold', value: report?.totalItemsSold ?? '—' },
    { label: 'Payments Collected', value: formatMoney(report?.totalPaymentsCollected) },
    { label: 'Number of Payments', value: report?.numberOfPayments ?? '—' },
  ];

  return (
    <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 3, p: 3, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="text.primary">Sales Report</Typography>
        <Stack direction="row" sx={{ gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField size="small" type="date" label="From" value={startDate} onChange={(e) => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField size="small" type="date" label="To" value={endDate} onChange={(e) => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
          <Button variant="outlined" onClick={fetchReport} disabled={isLoading} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>
            {isLoading ? 'Loading...' : 'Run Report'}
          </Button>
        </Stack>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
        {stats.map((s) => (
          <Box key={s.label} sx={{ p: 2, borderRadius: 2, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }} color="text.primary">{isLoading ? '…' : s.value}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function SalesPage() {
  return (
    <Box>
      <SalesReportCard />
      <GymResourcePage config={config} />
    </Box>
  );
}
