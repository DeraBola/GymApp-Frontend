'use client';

import { Chip, Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { formatMoney, num, int } from '../../../lib/format';
import { InventoryItem } from '../../../types/resources';

const config: GymResourceConfig<InventoryItem> = {
  title: 'Inventory',
  subtitle: 'Products and supplies the gym stocks and sells',
  singular: 'Item',
  emptyIcon: '📦',
  listUrl: (gymId) => `/inventory/gym/${gymId}`,
  createUrl: (gymId) => `/inventory/${gymId}`,
  updateUrl: (row, gymId) => `/inventory/${row.id}/${gymId}`,
  deleteUrl: (row) => `/inventory/${row.id}`,
  fields: [
    { name: 'name', label: 'Item Name', required: true, placeholder: 'e.g. Protein Shake' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'itemType', label: 'Item Type', required: true, placeholder: 'e.g. Supplement, Drink, Apparel' },
    { name: 'quantity', label: 'Quantity in Stock', type: 'number', required: true, step: '1', min: '0' },
    { name: 'price', label: 'Unit Price', type: 'number', required: true, step: '0.01', min: '0' },
  ],
  columns: () => [
    { key: 'name', label: 'Item', render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.name}</Typography> },
    { key: 'itemType', label: 'Type' },
    {
      key: 'quantity',
      label: 'In Stock',
      render: (row) => (
        <Chip
          label={row.quantity}
          size="small"
          sx={row.quantity > 0
            ? { bgcolor: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }
            : { bgcolor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
        />
      ),
    },
    { key: 'price', label: 'Unit Price', render: (row) => formatMoney(row.price) },
  ],
  toForm: (row) => ({
    name: row.name ?? '',
    description: row.description ?? '',
    itemType: row.itemType ?? '',
    quantity: String(row.quantity ?? ''),
    price: String(row.price ?? ''),
  }),
  toPayload: (f) => ({
    name: f.name,
    description: f.description,
    itemType: f.itemType,
    quantity: int(f.quantity),
    price: num(f.price),
  }),
  searchText: (row) => `${row.name} ${row.description} ${row.itemType}`,
};

export default function InventoryPage() {
  return <GymResourcePage config={config} />;
}
