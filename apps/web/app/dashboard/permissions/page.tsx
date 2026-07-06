'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../lib/api';

interface Permission {
  id: string;
  name: string;
  description?: string;
}

export default function PermissionsPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPermissions = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/permissions');
      // Adjusting to potential response formats
      const data = res.data?.data ?? res.data?.value ?? res.data ?? [];
      setPermissions(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to load permissions');
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchPermissions(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/permissions', {
        name: form.name,
        description: form.description || undefined
      });
      toast.success('Permission created successfully!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchPermissions();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string, detail?: string } } };
      setFormError(axiosErr.response?.data?.message || axiosErr.response?.data?.detail || 'Failed to create permission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/permissions/${id}`);
      toast.success('Permission deleted');
      fetchPermissions();
    } catch {
      toast.error('Failed to delete permission');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Permissions</h1>
          <p className="text-slate-500 text-sm mt-1">Manage system permissions and access levels</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-pink-500/20"
          >
            <span>+</span> Add Permission
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
                <th className="px-6 py-4">Description</th>
                {isSuperAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-24" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-200 rounded w-48" /></td>
                    {isSuperAdmin && <td className="px-6 py-4 text-right"><div className="h-6 w-16 bg-slate-200 rounded ml-auto" /></td>}
                  </tr>
                ))
              ) : permissions.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 3 : 2} className="text-center text-slate-500 py-16">
                    <div className="text-4xl mb-3">🔑</div>
                    <p className="text-sm">No permissions found. {isSuperAdmin ? 'Create one to get started.' : ''}</p>
                  </td>
                </tr>
              ) : (
                permissions.map((perm) => (
                  <tr key={perm.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{perm.name}</td>
                    <td className="px-6 py-4">{perm.description || '—'}</td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setDeleteId(perm.id)}
                          className="text-xs text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Permission</h2>
            <p className="text-slate-500 text-sm mb-5">Add a new permission to the system.</p>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Permission Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. ReadUsers"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Description (Optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What does this permission allow?"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Creating...' : 'Create Permission'}
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
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Permission?</h2>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. Make sure no roles depend on this.</p>
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
