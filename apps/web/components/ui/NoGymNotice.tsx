'use client';

import Link from 'next/link';
import { Alert, Button } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

/**
 * Shown on gym-scoped pages when there's no gym to work with. People who can
 * manage gyms get a direct route to create one; everyone else learns who can fix it.
 */
export function NoGymNotice({ what }: { what: string }) {
  const { isAdmin } = useAuth();

  // Only Super Admins can create gyms.
  if (isAdmin) {
    return (
      <Alert
        severity="info"
        sx={{ borderRadius: 2, alignItems: 'center' }}
        action={
          <Button component={Link} href="/dashboard/gyms" size="small" variant="contained">
            Go to Gyms
          </Button>
        }
      >
        {what[0]?.toUpperCase() + what.slice(1)} belong to a gym.{' '}
        <Link href="/dashboard/gyms" className="text-pink-600 hover:text-pink-700 font-medium">Create a gym</Link>
        {' '}first, then pick it from the gym selector here.
      </Alert>
    );
  }

  return (
    <Alert severity="warning" sx={{ borderRadius: 2 }}>
      Your account isn&apos;t linked to a gym yet, so there are no {what} to show. Ask a Super Admin to add you to a gym.
    </Alert>
  );
}
