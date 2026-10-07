'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import api from '../lib/api';
import { extractPagedItems } from '../lib/apiHelpers';
import { useAuth } from './AuthContext';
import { Gym } from '../types/gym';

const STORAGE_KEY = 'selectedGymId';

interface GymContextType {
  gyms: Gym[];
  /** Gym (tenant) that gym-scoped pages (members, staff, plans, ...) operate on */
  gymId: string | null;
  /** The active gym's record, when known */
  activeGym: Gym | null;
  setGymId: (id: string) => void;
  /** Only Super Admins can move between gyms; everyone else is locked to their own */
  canSwitchGym: boolean;
  isLoadingGyms: boolean;
  refreshGyms: () => Promise<void>;
}

const GymContext = createContext<GymContextType | undefined>(undefined);

/**
 * Tracks which gym (tenant) the dashboard is working in.
 * - Super Admins pick any gym; the choice is remembered between visits.
 * - Everyone else is pinned to the gym on their account. The API enforces
 *   this too, so the UI only mirrors it.
 */
export function GymProvider({ children }: { children: ReactNode }) {
  const { user, token, isAdmin } = useAuth();
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [gymId, setGymIdState] = useState<string | null>(null);
  const [isLoadingGyms, setIsLoadingGyms] = useState(true);
  const ownGymId = user?.gymId ?? null;

  const refreshGyms = useCallback(async () => {
    setIsLoadingGyms(true);
    try {
      // The API returns every gym to Super Admins and only their own gym to everyone else.
      const load = () => api.get('/gyms/All', { params: { page: 1, pageSize: 100 } });
      // One automatic retry smooths over brief database/network hiccups.
      const res = await load().catch(() => new Promise((r) => setTimeout(r, 1500)).then(load));
      const items = extractPagedItems<Gym>(res).map((g) => ({ ...g, id: g.id || g.gymId || '' }));
      setGyms(items);

      if (!isAdmin) {
        setGymIdState(ownGymId);
        return;
      }

      let stored: string | null = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* storage unavailable */ }
      setGymIdState((current) => {
        const candidates = [current, stored, ownGymId];
        const valid = candidates.find((id) => id && items.some((g) => g.id === id));
        return valid ?? items[0]?.id ?? null;
      });
    } catch {
      setGyms([]);
      setGymIdState(isAdmin ? null : ownGymId);
    } finally {
      setIsLoadingGyms(false);
    }
  }, [isAdmin, ownGymId]);

  useEffect(() => {
    if (token) refreshGyms();
  }, [token, refreshGyms]);

  const setGymId = (id: string) => {
    if (!isAdmin) return;
    setGymIdState(id);
    try { localStorage.setItem(STORAGE_KEY, id); } catch { /* storage unavailable */ }
  };

  const activeGym = gyms.find((g) => g.id === gymId) ?? null;

  return (
    <GymContext.Provider value={{ gyms, gymId, activeGym, setGymId, canSwitchGym: isAdmin, isLoadingGyms, refreshGyms }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
}
