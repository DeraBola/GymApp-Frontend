'use client';

import { Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { formatDate, toDateInput, toIso } from '../../../lib/format';
import { Equipment } from '../../../types/resources';

const config: GymResourceConfig<Equipment> = {
  title: 'Equipment',
  subtitle: 'Machines and gear owned by the gym',
  singular: 'Equipment',
  emptyIcon: '🏋️',
  listUrl: (gymId) => `/equipments/gym/${gymId}`,
  createUrl: (gymId) => `/equipments/${gymId}`,
  updateUrl: (row, gymId) => `/equipments/${row.id}/${gymId}`,
  deleteUrl: (row) => `/equipments/${row.id}`,
  fields: [
    { name: 'name', label: 'Name', required: true, placeholder: 'e.g. Treadmill #3' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
  ],
  columns: () => [
    { key: 'name', label: 'Name', render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.name}</Typography> },
    { key: 'description', label: 'Description' },
    { key: 'purchaseDate', label: 'Purchased', render: (row) => formatDate(row.purchaseDate) },
  ],
  toForm: (row) => ({
    name: row.name ?? '',
    description: row.description ?? '',
    purchaseDate: toDateInput(row.purchaseDate),
  }),
  toPayload: (f) => ({
    name: f.name,
    description: f.description,
    purchaseDate: toIso(f.purchaseDate),
  }),
  searchText: (row) => `${row.name} ${row.description}`,
};

export default function EquipmentPage() {
  return <GymResourcePage config={config} />;
}
