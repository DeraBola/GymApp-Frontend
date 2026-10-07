'use client';

import { Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { formatMoney, num, int } from '../../../lib/format';
import { MembershipPlan } from '../../../types/resources';

const config: GymResourceConfig<MembershipPlan> = {
  title: 'Membership Plans',
  subtitle: 'Subscription plans members can sign up for',
  singular: 'Plan',
  emptyIcon: '📋',
  listUrl: (gymId) => `/plans/gym/${gymId}`,
  createUrl: (gymId) => `/plans/${gymId}`,
  updateUrl: (row, gymId) => `/plans/${row.id}/${gymId}`,
  deleteUrl: (row) => `/plans/${row.id}`,
  fields: [
    { name: 'name', label: 'Plan Name', required: true, placeholder: 'e.g. Monthly Gold' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'price', label: 'Price', type: 'number', required: true, step: '0.01', min: '0' },
    { name: 'durationInMonths', label: 'Duration (months)', type: 'number', required: true, step: '1', min: '1' },
  ],
  columns: () => [
    { key: 'name', label: 'Plan', render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.name}</Typography> },
    { key: 'description', label: 'Description' },
    { key: 'price', label: 'Price', render: (row) => formatMoney(row.price) },
    { key: 'durationInMonths', label: 'Duration', render: (row) => `${row.durationInMonths} month${row.durationInMonths === 1 ? '' : 's'}` },
  ],
  toForm: (row) => ({
    name: row.name ?? '',
    description: row.description ?? '',
    price: String(row.price ?? ''),
    durationInMonths: String(row.durationInMonths ?? ''),
  }),
  toPayload: (f) => ({
    name: f.name,
    description: f.description,
    price: num(f.price),
    durationInMonths: int(f.durationInMonths),
  }),
  searchText: (row) => `${row.name} ${row.description}`,
};

export default function PlansPage() {
  return <GymResourcePage config={config} />;
}
