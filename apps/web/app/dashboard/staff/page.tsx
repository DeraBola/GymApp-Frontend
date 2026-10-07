'use client';

import { Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { Permissions } from '../../../lib/auth';
import { Staff } from '../../../types/resources';

const config: GymResourceConfig<Staff> = {
  title: 'Staff',
  subtitle: 'Trainers, front desk and other employees of the gym',
  singular: 'Staff Member',
  emptyIcon: '🧑‍💼',
  listUrl: (gymId) => `/staffs/gym/${gymId}`,
  createUrl: (gymId) => `/staffs/${gymId}`,
  updateUrl: (row, gymId) => `/staffs/${gymId}/${row.staffId}`,
  deleteUrl: (row) => `/staffs/${row.staffId}`,
  getId: (row) => row.staffId,
  permission: Permissions.ManageStaffs,
  fields: [
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'phoneNumber', label: 'Phone Number', type: 'tel', required: true },
    { name: 'position', label: 'Position', required: true, placeholder: 'e.g. Trainer' },
  ],
  columns: () => [
    {
      key: 'name',
      label: 'Name',
      render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.firstName} {row.lastName}</Typography>,
    },
    { key: 'position', label: 'Position' },
    { key: 'email', label: 'Email', render: (row) => <span className="normal-case">{row.email}</span> },
    { key: 'phoneNumber', label: 'Phone' },
  ],
  toForm: (row) => ({
    firstName: row.firstName ?? '',
    lastName: row.lastName ?? '',
    email: row.email ?? '',
    phoneNumber: row.phoneNumber ?? '',
    position: row.position ?? '',
  }),
  toPayload: (f) => ({ ...f }),
  searchText: (row) => `${row.firstName} ${row.lastName} ${row.email} ${row.position}`,
};

export default function StaffPage() {
  return <GymResourcePage config={config} />;
}
