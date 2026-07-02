'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

interface Gym {
  id: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
}

interface CreateGymForm {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
}

export default function GymsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateGymForm>({ name: '', address: '', email: '', phoneNumber: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGyms = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/gyms');
      setGyms(res.data?.value ?? res.data ?? []);
    } catch {
      setGyms([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGyms(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/gyms', form);
      setShowModal(false);
      setForm({ name: '', address: '', email: '', phoneNumber: '' });
      fetchGyms();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string } } };
      setFormError(axiosErr.response?.data?.detail || 'Failed to create gym.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/gyms/${id}`);
      fetchGyms();
    } catch {
      alert('Failed to delete gym.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gyms</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all gym locations</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-emerald-500/20"
          >
            <span>+</span> Add Gym
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Name</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Address</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Email</th>
                <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Phone</th>
                <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : gyms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-slate-500 py-16">
                    <div className="text-4xl mb-3">🏢</div>
                    <p className="text-sm">No gyms found. {isSuperAdmin ? 'Create one to get started.' : ''}</p>
                  </td>
                </tr>
              ) : (
                gyms.map((gym, idx) => (
                  <tr key={gym.id} className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${idx === gyms.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/gyms/${gym.id}`} className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition-colors">
                        {gym.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{gym.address || '—'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{gym.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{gym.phoneNumber || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/gyms/${gym.id}`}
                          className="text-xs text-slate-400 hover:text-white bg-slate-700/50 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View
                        </Link>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setDeleteId(gym.id)}
                            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Gym Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">Create New Gym</h2>
            <p className="text-slate-400 text-sm mb-5">Fill in the details to add a new gym location.</p>

            {formError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              {(['name', 'address', 'email', 'phoneNumber'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-slate-300 text-sm font-medium mb-1.5 capitalize">
                    {field === 'phoneNumber' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    required={field !== 'address'}
                    placeholder={field === 'email' ? 'gym@example.com' : field === 'phoneNumber' ? '+2348012345678' : ''}
                    className="w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Creating...' : 'Create Gym'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-white mb-2">Delete Gym?</h2>
            <p className="text-slate-400 text-sm mb-6">This action cannot be undone. All associated data will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 text-slate-300 bg-slate-700/50 hover:bg-slate-700 py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-red-500 hover:bg-red-400 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
