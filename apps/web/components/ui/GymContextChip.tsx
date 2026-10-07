'use client';

import { Chip } from '@mui/material';
import { useGym } from '../../context/GymContext';

/**
 * Read-only reminder of which gym a page is showing. Switching gyms happens
 * in one place only (the sidebar), so edits never land in the wrong tenant.
 */
export function GymContextChip() {
  const { activeGym, isLoadingGyms } = useGym();
  if (isLoadingGyms || !activeGym) return null;

  return (
    <Chip
      icon={<span aria-hidden>🏛️</span>}
      label={activeGym.name}
      size="small"
      sx={{ bgcolor: '#fdf4ff', color: '#9333ea', border: '1px solid #f3e8ff', textTransform: 'capitalize', fontWeight: 600, '& .MuiChip-icon': { ml: 1 } }}
    />
  );
}
