'use client';

import { Box, Chip, Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { Permissions } from '../../../lib/auth';
import { formatDate, toDateInput } from '../../../lib/format';
import { Member } from '../../../types/member';

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  active:    { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  inactive:  { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0' },
  suspended: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const config: GymResourceConfig<Member> = {
  title: 'Members',
  subtitle: 'People who hold a membership at this gym',
  singular: 'Member',
  emptyIcon: '👥',
  listUrl: (gymId) => `/members/all/${gymId}`,
  createUrl: () => '/members/register',
  updateUrl: (row) => `/members/${row.id}`,
  deleteUrl: (row) => `/members/${row.id}`,
  permission: Permissions.ManageUsers,
  fields: [
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
    {
      name: 'gender',
      label: 'Gender',
      type: 'select',
      required: true,
      options: [{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }],
    },
    { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
    { name: 'address', label: 'Home Address', required: true },
    {
      name: 'status',
      label: 'Membership Status',
      type: 'select',
      required: true,
      editOnly: true,
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'Suspended', label: 'Suspended' },
      ],
    },
  ],
  columns: () => [
    {
      key: 'name',
      label: 'Member',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
            {row.firstName?.[0]?.toUpperCase()}{row.lastName?.[0]?.toUpperCase()}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.firstName} {row.lastName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none' }}>{row.email}</Typography>
          </Box>
        </Box>
      ),
    },
    { key: 'phoneNumber', label: 'Phone' },
    { key: 'gender', label: 'Gender' },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const s = statusColors[row.status?.toLowerCase()] ?? statusColors.inactive!;
        return <Chip label={row.status || 'Unknown'} size="small" sx={{ bgcolor: s.bg, color: s.color, border: `1px solid ${s.border}`, fontWeight: 600 }} />;
      },
    },
  ],
  toForm: (row) => ({
    firstName: row.firstName ?? '',
    lastName: row.lastName ?? '',
    email: row.email ?? '',
    phoneNumber: row.phoneNumber ?? '',
    gender: row.gender ?? '',
    dob: toDateInput(row.dob),
    address: row.address ?? '',
    status: row.status ?? 'Active',
  }),
  toPayload: (f, gymId) => ({
    firstName: f.firstName,
    lastName: f.lastName,
    email: f.email,
    phoneNumber: f.phoneNumber,
    gender: f.gender,
    dob: f.dob,
    address: f.address,
    // Register needs the gym; update needs status (isActive mirrors it).
    gymId,
    status: f.status || 'Active',
    isActive: (f.status || 'Active') === 'Active',
  }),
  searchText: (row) => `${row.firstName} ${row.lastName} ${row.email} ${row.phoneNumber}`,
};

export default function MembersPage() {
  return <GymResourcePage config={config} />;
}
