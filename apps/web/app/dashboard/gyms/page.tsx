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
          <h1 className="text-2xl font-bold text-slate-900">Gyms</h1>
          <p className="text-slate-500 text-sm mt-1">Manage all gym locations</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-pink-500/20"
          >
            <span>+</span> Add Gym
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded" />
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
                  <tr key={gym.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/gyms/${gym.id}`} className="text-pink-600 hover:text-pink-500 font-medium text-sm transition-colors">
                        {gym.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{gym.address || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{gym.email || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{gym.phoneNumber || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/gyms/${gym.id}`}
                          className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-all"
                        >
                          View
                        </Link>
                        {isSuperAdmin && (
                          <button
                            onClick={() => setDeleteId(gym.id)}
                            className="text-xs text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create New Gym</h2>
            <p className="text-slate-500 text-sm mb-5">Fill in the details to add a new gym location.</p>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              {(['name', 'address', 'email', 'phoneNumber'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5 capitalize">
                    {field === 'phoneNumber' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                    required={field !== 'address'}
                    placeholder={field === 'email' ? 'gym@example.com' : field === 'phoneNumber' ? '+2348012345678' : ''}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Creating...' : 'Create Gym'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Gym?</h2>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. All associated data will be removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
