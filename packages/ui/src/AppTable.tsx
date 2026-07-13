'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
  Typography,
} from '@mui/material';
import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => ReactNode;
}

interface AppTableProps<T extends { id: string }> {
  columns: Column<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyIcon?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
  skeletonRows?: number;
}

export function AppTable<T extends { id: string }>({
  columns,
  rows,
  isLoading = false,
  emptyIcon = '📋',
  emptyTitle = 'No data found',
  emptySubtitle,
  skeletonRows = 4,
}: AppTableProps<T>) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col.key} align={col.align ?? 'left'}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    <Skeleton variant="text" width="80%" height={20} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>{emptyIcon}</Typography>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }} color="text.primary">
                    {emptyTitle}
                  </Typography>
                  {emptySubtitle && (
                    <Typography sx={{ fontSize: '0.8rem', mt: 0.5 }} color="text.secondary">
                      {emptySubtitle}
                    </Typography>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((col) => (
                  <TableCell key={col.key} align={col.align ?? 'left'}>
                    {col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key] ?? '—')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
