'use client';

import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  membershipStatus: string;
}

export default function MembersPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoading(true);
      try {
        // Super admins see all, gym owners see their gym's members
        const endpoint = user?.gymId ? `/members/gym/${user.gymId}` : '/members';
        const res = await api.get(endpoint);
        setMembers(res.data?.value ?? res.data ?? []);
      } catch {
        setMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMembers();
  }, [user?.gymId]);

  const filtered = members.filter(
    (m) =>
      m.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      m.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
      case 'expired': return 'bg-red-500/15 text-red-400 border-red-500/20';
      case 'pending': return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/15 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-slate-500 text-sm mt-1">
            {user?.gymId ? 'Members in your gym' : 'All members across all gyms'}
          </p>
        </div>
        <div className="text-slate-600 text-sm bg-white border border-slate-200 shadow-sm rounded-xl px-4 py-2">
          {filtered.length} member{filtered.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔍</span>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-white border border-slate-200 shadow-sm text-slate-900 placeholder-slate-400 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="px-6 py-4">Member</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-200 rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-16">
                    <div className="text-4xl mb-3">👥</div>
                    <p className="text-slate-500 text-sm">{search ? 'No members match your search.' : 'No members found.'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((member, idx) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {member.firstName?.[0]?.toUpperCase()}{member.lastName?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-slate-900 text-sm font-medium">{member.firstName} {member.lastName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{member.email}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{member.phoneNumber || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColor(member.membershipStatus)}`}>
                        {member.membershipStatus || 'Unknown'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
