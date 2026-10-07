'use client';

import { Typography } from '@mui/material';
import { GymResourcePage, GymResourceConfig } from '../../../components/crud/GymResourcePage';
import { formatDateTime, loadStaffOptions, toDateTimeInput, toIso, int } from '../../../lib/format';
import { GymClass } from '../../../types/resources';

const config: GymResourceConfig<GymClass> = {
  title: 'Classes',
  subtitle: 'Scheduled group classes and their instructors',
  singular: 'Class',
  emptyIcon: '🧘',
  listUrl: (gymId) => `/classes/gym/${gymId}`,
  createUrl: (gymId) => `/classes/${gymId}`,
  updateUrl: (row, gymId) => `/classes/${row.id}/${gymId}`,
  deleteUrl: (row) => `/classes/${row.id}`,
  fields: [
    { name: 'name', label: 'Class Name', required: true, placeholder: 'e.g. Morning Yoga' },
    { name: 'description', label: 'Description', type: 'textarea' },
    { name: 'scheduleTime', label: 'Schedule Time', type: 'datetime', required: true },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true, step: '1', min: '1' },
    { name: 'instructorId', label: 'Instructor', type: 'select', loadOptions: loadStaffOptions },
  ],
  columns: (lookups) => [
    { key: 'name', label: 'Class', render: (row) => <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{row.name}</Typography> },
    { key: 'scheduleTime', label: 'Schedule', render: (row) => formatDateTime(row.scheduleTime) },
    { key: 'capacity', label: 'Capacity' },
    { key: 'instructorId', label: 'Instructor', render: (row) => (row.instructorId ? lookups.instructorId?.[row.instructorId] ?? '—' : '—') },
  ],
  toForm: (row) => ({
    name: row.name ?? '',
    description: row.description ?? '',
    scheduleTime: toDateTimeInput(row.scheduleTime),
    capacity: String(row.capacity ?? ''),
    instructorId: row.instructorId ?? '',
  }),
  toPayload: (f) => ({
    name: f.name,
    description: f.description,
    scheduleTime: toIso(f.scheduleTime),
    capacity: int(f.capacity),
    instructorId: f.instructorId || null,
  }),
  searchText: (row, lookups) => `${row.name} ${row.description} ${lookups.instructorId?.[row.instructorId ?? ''] ?? ''}`,
};

export default function ClassesPage() {
  return <GymResourcePage config={config} />;
}
