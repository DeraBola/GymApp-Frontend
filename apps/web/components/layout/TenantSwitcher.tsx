'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MenuItem, TextField } from '@mui/material';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@repo/ui';
import { useGym } from '../../context/GymContext';

/**
 * Top-of-sidebar workspace block.
 * - Super Admin: a switcher between gyms (the only place the tenant changes).
 * - Everyone else: their gym's name, fixed.
 */
export function TenantSwitcher() {
  const { gyms, gymId, activeGym, setGymId, canSwitchGym, isLoadingGyms, refreshGyms } = useGym();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const label = (
    <p className="text-[0.65rem] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
      {canSwitchGym ? 'Managing gym' : 'Your gym'}
    </p>
  );

  if (isLoadingGyms) {
    return (
      <div className="px-3 pt-4">
        {label}
        <div className="h-10 rounded-xl bg-slate-100 animate-pulse" />
      </div>
    );
  }

  if (!canSwitchGym) {
    return (
      <div className="px-3 pt-4">
        {label}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <span aria-hidden>🏛️</span>
          <span className="text-sm font-semibold text-slate-800 truncate capitalize">
            {activeGym?.name ?? (gymId ? 'Gym details unavailable' : 'No gym assigned')}
          </span>
        </div>
        {gymId && !activeGym && (
          <button type="button" onClick={() => refreshGyms()} className="mt-1 px-1 text-xs text-pink-600 hover:text-pink-700">
            Couldn&apos;t load your gym. Retry
          </button>
        )}
      </div>
    );
  }

  if (gyms.length === 0) {
    return (
      <div className="px-3 pt-4">
        {label}
        <Link href="/dashboard/gyms" className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-pink-300 text-pink-600 text-sm font-medium no-underline hover:bg-pink-50">
          + Create your first gym
        </Link>
      </div>
    );
  }

  const pendingGym = gyms.find((g) => g.id === pendingId);

  return (
    <div className="px-3 pt-4">
      {label}
      <TextField
        select
        size="small"
        fullWidth
        value={gyms.some((g) => g.id === gymId) ? gymId : ''}
        onChange={(e) => setPendingId(e.target.value)}
        slotProps={{ htmlInput: { 'aria-label': 'Switch gym' } }}
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' }, '& .MuiSelect-select': { textTransform: 'capitalize', fontWeight: 600 } }}
      >
        {gyms.map((g) => (
          <MenuItem key={g.id} value={g.id} sx={{ textTransform: 'capitalize' }}>{g.name}</MenuItem>
        ))}
      </TextField>

      {/* Switching tenants changes what every page shows and where new records are saved, so confirm it. */}
      <ConfirmModal
        open={!!pendingId && pendingId !== gymId}
        onClose={() => setPendingId(null)}
        onConfirm={() => {
          if (pendingId) {
            setGymId(pendingId);
            toast.info(`Now managing ${pendingGym?.name ?? 'gym'}.`);
          }
          setPendingId(null);
        }}
        title={`Switch to ${pendingGym?.name ?? 'this gym'}?`}
        message="Every page will show this gym's data, and anything you add will be saved to it. Unsaved changes on this page will be lost."
        confirmLabel="Switch gym"
        confirmColor="primary"
      />
    </div>
  );
}
