'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../lib/api';

interface Role {
  id: string;
  name: string;
  description?: string;
}

interface Permission {
  id: string;
  name: string;
  description?: string;
}

export default function RolesPage() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SuperAdmin' || user?.role === 'Admin';

  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  // Assign Permissions state
  const [assignRoleId, setAssignRoleId] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const [form, setForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions').catch(() => ({ data: [] }))
      ]);
      const rolesData = rolesRes.data?.data ?? rolesRes.data?.value ?? rolesRes.data ?? [];
      const permsData = permsRes.data?.data ?? permsRes.data?.value ?? permsRes.data ?? [];
      
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setAllPermissions(Array.isArray(permsData) ? permsData : []);
    } catch {
      toast.error('Failed to load data');
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    try {
      await api.post('/roles', {
        name: form.name,
        description: form.description || undefined
      });
      toast.success('Role created successfully!');
      setShowCreateModal(false);
      setForm({ name: '', description: '' });
      fetchData();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string, detail?: string } } };
      setFormError(axiosErr.response?.data?.message || axiosErr.response?.data?.detail || 'Failed to create role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/roles/${id}`);
      toast.success('Role deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete role');
    } finally {
      setDeleteId(null);
    }
  };

  const handleOpenAssign = async (roleId: string) => {
    setAssignRoleId(roleId);
    setSelectedPermissions([]);
    try {
      // Attempt to fetch existing permissions for this role, if supported
      const res = await api.get(`/roles/${roleId}/permissions`);
      const existing = res.data?.data ?? res.data?.value ?? res.data ?? [];
      if (Array.isArray(existing)) {
        setSelectedPermissions(existing.map((p: any) => p.id || p));
      }
    } catch (err) {
      console.log('Could not fetch existing role permissions, or endpoint not available', err);
    }
  };

  const handleAssignPermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoleId) return;
    setIsAssigning(true);
    try {
      // Assuming POST /roles/permissions based on payload structure
      await api.post('/roles/permissions', {
        roleId: assignRoleId,
        permissionIds: selectedPermissions
      });
      toast.success('Permissions assigned successfully!');
      setAssignRoleId(null);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string, detail?: string } } };
      toast.error(axiosErr.response?.data?.message || 'Failed to assign permissions.');
    } finally {
      setIsAssigning(false);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) ? prev.filter(id => id !== permId) : [...prev, permId]
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Roles</h1>
          <p className="text-slate-500 text-sm mt-1">Manage user roles and their assigned permissions</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-pink-500/20"
          >
            <span>+</span> Add Role
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
                    {isSuperAdmin && <td className="px-6 py-4 text-right"><div className="h-6 w-24 bg-slate-200 rounded ml-auto" /></td>}
                  </tr>
                ))
              ) : roles.length === 0 ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 3 : 2} className="text-center text-slate-500 py-16">
                    <div className="text-4xl mb-3">🛡️</div>
                    <p className="text-sm">No roles found. {isSuperAdmin ? 'Create one to get started.' : ''}</p>
                  </td>
                </tr>
              ) : (
                roles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{role.name}</td>
                    <td className="px-6 py-4">{role.description || '—'}</td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenAssign(role.id)}
                            className="text-xs text-slate-600 hover:text-pink-600 bg-slate-100 hover:bg-pink-50 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Assign Permissions
                          </button>
                          <button
                            onClick={() => setDeleteId(role.id)}
                            className="text-xs text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Delete
                          </button>
                        </div>
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
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Create Role</h2>
            <p className="text-slate-500 text-sm mb-5">Add a new role to the system.</p>

            {formError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Role Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g. Manager"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-1.5">Description (Optional)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  placeholder="What is this role for?"
                  className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isSubmitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Permissions Modal */}
      {assignRoleId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <h2 className="text-lg font-bold text-slate-900 mb-1">Assign Permissions</h2>
            <p className="text-slate-500 text-sm mb-5">Select the permissions this role should have.</p>
            
            <form onSubmit={handleAssignPermissions} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 border border-slate-200 rounded-xl p-2 bg-slate-50">
                {allPermissions.length === 0 ? (
                  <p className="text-center text-slate-500 py-8 text-sm">No permissions available in the system.</p>
                ) : (
                  allPermissions.map((perm) => (
                    <label key={perm.id} className="flex items-start gap-3 p-3 hover:bg-white rounded-lg cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                      <input 
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-1 w-4 h-4 text-pink-600 rounded border-slate-300 focus:ring-pink-500"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{perm.name}</p>
                        {perm.description && <p className="text-xs text-slate-500 mt-0.5">{perm.description}</p>}
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div className="flex gap-3 pt-2 shrink-0">
                <button type="button" onClick={() => setAssignRoleId(null)} className="flex-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isAssigning} className="flex-1 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold transition-all">
                  {isAssigning ? 'Saving...' : 'Save Assignments'}
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
            <h2 className="text-lg font-bold text-slate-900 mb-2">Delete Role?</h2>
            <p className="text-slate-500 text-sm mb-6">This action cannot be undone. Users with this role may lose access.</p>
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
