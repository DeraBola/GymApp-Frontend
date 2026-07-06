'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../lib/api';

interface Gym {
  id: string;
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phoneNumber: string;
}

interface EditForm {
  name: string;
  address: string;
  email: string;
  phoneNumber: string;
}

export default function GymDetailPage() {
  const { gymId } = useParams<{ gymId: string }>();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [gym, setGym] = useState<Gym | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ name: '', address: '', email: '', phoneNumber: '' });
  const [branchForm, setBranchForm] = useState({ name: '', address: '', phoneNumber: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchGym = async () => {
    try {
      const res = await api.get(`/gyms/${gymId}`);
      const data = res.data?.value ?? res.data;
      setGym(data);
      setEditForm({ name: data.name, address: data.address || '', email: data.email || '', phoneNumber: data.phoneNumber || '' });
    } catch {
      setGym(null);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get(`/branches/gym/${gymId}`);
      setBranches(res.data?.value ?? res.data ?? []);
    } catch {
      setBranches([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.allSettled([fetchGym(), fetchBranches()]);
      setIsLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gymId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put(`/gyms/${gymId}`, editForm);
      await fetchGym();
      setShowEditModal(false);
    } catch {
      alert('Failed to update gym.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post(`/branches/${gymId}`, branchForm);
      await fetchBranches();
      setShowBranchModal(false);
      setBranchForm({ name: '', address: '', phoneNumber: '' });
    } catch {
      alert('Failed to create branch.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        <div className="h-32 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="text-center py-24">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-slate-900 font-semibold">Gym not found</p>
        <Link href="/dashboard/gyms" className="text-pink-600 hover:text-pink-500 text-sm mt-2 inline-block">← Back to Gyms</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Link href="/dashboard/gyms" className="hover:text-slate-900 transition-colors">Gyms</Link>
        <span>›</span>
        <span className="text-slate-900">{gym.name}</span>
      </div>

      {/* Gym Info Card */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-pink-50 border border-pink-100 rounded-2xl flex items-center justify-center text-2xl text-pink-600">
              🏢
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{gym.name}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{gym.address || 'No address set'}</p>
            </div>
          </div>
          {isSuperAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className="text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
            >
              Edit Gym
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Email</p>
            <p className="text-slate-700 text-sm">{gym.email || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Phone</p>
            <p className="text-slate-700 text-sm">{gym.phoneNumber || '—'}</p>
          </div>
        </div>
      </div>

      {/* Branches Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Branches</h2>
          {isSuperAdmin && (
            <button
              onClick={() => setShowBranchModal(true)}
              className="flex items-center gap-2 text-sm bg-pink-600 hover:bg-pink-500 text-white font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-pink-500/20"
            >
              + Add Branch
            </button>
          )}
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr className="border-b border-slate-200">
                <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Branch Name</th>
                <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Address</th>
                <th className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-4">Phone</th>
              </tr>
            </thead>
            <tbody>
              {branches.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-slate-500 py-12 text-sm">
                    <div className="text-3xl mb-2">🏗️</div>
                    No branches yet. {isSuperAdmin ? 'Add one above.' : ''}
                  </td>
                </tr>
              ) : (
                branches.map((branch, idx) => (
                  <tr key={branch.id} className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${idx === branches.length - 1 ? 'border-b-0' : ''}`}>
                    <td className="px-6 py-4 text-slate-900 text-sm font-medium">{branch.name}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{branch.address || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{branch.phoneNumber || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Gym Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Edit Gym</h2>
            <form onSubmit={handleUpdate} className="space-y-4">
              {(['name', 'address', 'email', 'phoneNumber'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5 capitalize">
                    {field === 'phoneNumber' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={editForm[field]}
                    onChange={(e) => setEditForm((p) => ({ ...p, [field]: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Branch Modal */}
      {showBranchModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-5">Add Branch</h2>
            <form onSubmit={handleCreateBranch} className="space-y-4">
              {(['name', 'address', 'phoneNumber'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-slate-700 text-sm font-medium mb-1.5 capitalize">
                    {field === 'phoneNumber' ? 'Phone Number' : field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={branchForm[field]}
                    onChange={(e) => setBranchForm((p) => ({ ...p, [field]: e.target.value }))}
                    required={field === 'name'}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBranchModal(false)} className="flex-1 text-slate-600 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Adding...' : 'Add Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
