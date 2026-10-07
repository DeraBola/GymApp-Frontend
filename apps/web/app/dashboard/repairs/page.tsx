'use client';

import { Chip, Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { formatDate, formatMoney, loadEquipmentOptions, toDateInput, toIso, num } from '../../../lib/format';
import { EquipmentRepair } from '../../../types/resources';

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending:    { bg: '#fffbeb', color: '#d97706', border: '#fde68a' },
  inprogress: { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  completed:  { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
};

const config: GymResourceConfig<EquipmentRepair> = {
  title: 'Repairs',
  subtitle: 'Maintenance and repair history for gym equipment',
  singular: 'Repair',
  emptyIcon: '🔧',
  listUrl: (gymId) => `/repairs/gym/${gymId}`,
  createUrl: (gymId) => `/repairs/${gymId}`,
  updateUrl: (row, gymId) => `/repairs/${gymId}/${row.id}`,
  deleteUrl: (row) => `/repairs/${row.id}`,
  fields: [
    { name: 'equipmentId', label: 'Equipment', type: 'select', required: true, loadOptions: loadEquipmentOptions },
    { name: 'description', label: 'What was wrong / done', type: 'textarea', required: true },
    { name: 'repairCost', label: 'Repair Cost', type: 'number', required: true, step: '0.01', min: '0' },
    { name: 'repairDate', label: 'Repair Date', type: 'date', required: true },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      options: [
        { value: 'Pending', label: 'Pending' },
        { value: 'InProgress', label: 'In Progress' },
        { value: 'Completed', label: 'Completed' },
      ],
    },
  ],
  columns: (lookups) => [
    {
      key: 'equipmentId',
      label: 'Equipment',
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{lookups.equipmentId?.[row.equipmentId] ?? 'Unknown'}</Typography>,
    },
    { key: 'description', label: 'Description' },
    { key: 'repairCost', label: 'Cost', render: (row) => formatMoney(row.repairCost) },
    { key: 'repairDate', label: 'Date', render: (row) => formatDate(row.repairDate) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = statusColors[row.status?.replace(/\s/g, '').toLowerCase()] ?? { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' };
        return <Chip label={row.status || 'Unknown'} size="small" sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}` }} />;
      },
    },
  ],
  toForm: (row) => ({
    equipmentId: row.equipmentId ?? '',
    description: row.description ?? '',
    repairCost: String(row.repairCost ?? ''),
    repairDate: toDateInput(row.repairDate),
    status: row.status ?? '',
  }),
  toPayload: (f) => ({
    equipmentId: f.equipmentId,
    description: f.description,
    repairCost: num(f.repairCost),
    repairDate: toIso(f.repairDate),
    status: f.status,
  }),
  searchText: (row, lookups) => `${lookups.equipmentId?.[row.equipmentId] ?? ''} ${row.description} ${row.status}`,
};

export default function RepairsPage() {
  return <GymResourcePage config={config} />;
}
