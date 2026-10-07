'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { ConfirmModal } from '@repo/ui';
import {
  Alert, Avatar, Box, Button, Checkbox, Chip, FormControlLabel, Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import api from '../../../../lib/api';
import { getErrorMessage } from '../../../../lib/apiHelpers';
import { Permissions, isAdminRole } from '../../../../lib/auth';
import { useAuth } from '../../../../context/AuthContext';
import { assignableRoles, fetchAllRoles, fetchUserById, fetchUserRoles, fullName, initials } from '../../../../lib/users';
import { useGym } from '../../../../context/GymContext';
import { formatDate } from '../../../../lib/format';
import { AppUser, UserForm } from '../../../../types/user';
import { Role } from '../../../../types/role';

const card = { bgcolor: 'white', border: '1px solid #e2e8f0', borderRadius: 3, p: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' };
const checkboxSx = { color: '#ec4899', '&.Mui-checked': { color: '#ec4899' } };

const toForm = (u: AppUser): UserForm => ({
  firstName: u.firstName ?? '',
  lastName: u.lastName ?? '',
  email: u.email ?? '',
  phoneNumber: u.phoneNumber ?? '',
});

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser, can, isAdmin } = useAuth();
  const { gyms } = useGym();
  const canManage = can(Permissions.ManageUsers);
  const canManageRoles = can(Permissions.ManageRoles) || canManage;
  const isSelf = currentUser?.id === userId;

  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<UserForm>({ firstName: '', lastName: '', email: '', phoneNumber: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [savedRoleIds, setSavedRoleIds] = useState<string[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isSavingRoles, setIsSavingRoles] = useState(false);
  const [confirmSelfDemote, setConfirmSelfDemote] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [found, roles, userRoles] = await Promise.all([
          fetchUserById(userId),
          fetchAllRoles().catch(() => []),
          fetchUserRoles(userId).catch(() => []),
        ]);
        setUser(found);
        if (found) setForm(toForm(found));
        setAllRoles(roles);
        const ids = userRoles.map((r) => r.id);
        setSavedRoleIds(ids);
        setRoleIds(ids);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Failed to load user.'));
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [userId]);

  const detailsDirty = useMemo(
    () => !!user && JSON.stringify(form) !== JSON.stringify(toForm(user)),
    [form, user]
  );
  const rolesDirty = useMemo(
    () => [...roleIds].sort().join() !== [...savedRoleIds].sort().join(),
    [roleIds, savedRoleIds]
  );

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put(`/users/${userId}`, { id: userId, ...form });
      setUser((u) => (u ? { ...u, ...form } : u));
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update user.'));
    } finally {
      setIsSaving(false);
    }
  };

  const saveRoles = async () => {
    setIsSavingRoles(true);
    try {
      await api.put(`/users/${userId}/roles`, { roleIds });
      setSavedRoleIds(roleIds);
      toast.success(isSelf ? 'Roles updated. Sign out and back in for your own access to change.' : 'Roles updated.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update roles.'));
    } finally {
      setIsSavingRoles(false);
      setConfirmSelfDemote(false);
    }
  };

  const handleSaveRoles = () => {
    // Guard against an admin accidentally removing their own admin access.
    const removesOwnAdmin =
      isSelf &&
      allRoles.some((r) => isAdminRole(r.name) && savedRoleIds.includes(r.id) && !roleIds.includes(r.id));
    if (removesOwnAdmin) { setConfirmSelfDemote(true); return; }
    saveRoles();
  };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please choose an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Images must be 5 MB or smaller.'); return; }
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('userId', userId);
      body.append('image', file);
      const res = await api.post('/users/upload', body, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAvatarUrl(res.data?.imageUrl ?? URL.createObjectURL(file));
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to upload photo.'));
    } finally {
      setIsUploading(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Skeleton variant="text" width={200} height={32} />
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
      </Stack>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-2">😕</p>
        <p className="font-semibold text-slate-700">User not found</p>
        <Link href="/dashboard/users" className="text-pink-500 text-sm mt-2 inline-block hover:text-pink-700 transition-colors">
          ← Back to Users
        </Link>
      </div>
    );
  }

  const assignedRoles = allRoles.filter((r) => savedRoleIds.includes(r.id));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: 960 }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Link href="/dashboard/users" className="text-slate-500 hover:text-pink-500 transition-colors no-underline text-sm">Users</Link>
        <span className="text-slate-400">›</span>
        <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>{fullName(user)}</Typography>
      </Box>

      {/* Header */}
      <Box sx={{ ...card, display: 'flex', alignItems: 'center', gap: 2.5, flexWrap: 'wrap' }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={avatarUrl ?? undefined}
            sx={{ width: 72, height: 72, fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
          >
            {initials(user)}
          </Avatar>
          {canManage && (
            <>
              <Button
                onClick={() => fileInput.current?.click()}
                disabled={isUploading}
                aria-label="Upload photo"
                sx={{ position: 'absolute', bottom: -4, right: -4, minWidth: 0, width: 30, height: 30, borderRadius: '50%', bgcolor: 'white', border: '1px solid #e2e8f0', color: 'text.secondary', p: 0, '&:hover': { bgcolor: '#f8fafc' } }}
              >
                <PhotoCameraIcon sx={{ fontSize: 16 }} />
              </Button>
              <input ref={fileInput} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            </>
          )}
        </Box>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }} color="text.primary">{fullName(user)}</Typography>
            {isSelf && <Chip label="You" size="small" sx={{ bgcolor: '#f1f5f9', color: '#475569' }} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          {isAdmin && (
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              🏛️ {user.gymId ? gyms.find((g) => g.id === user.gymId)?.name ?? 'Unknown gym' : 'No gym (all-gym access)'}
            </Typography>
          )}
          <Stack direction="row" sx={{ gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
            {assignedRoles.length > 0
              ? assignedRoles.map((r) => (
                  <Chip
                    key={r.id}
                    label={r.name}
                    size="small"
                    component={Link}
                    href={`/dashboard/users?roleId=${r.id}`}
                    clickable
                    sx={{ bgcolor: '#fdf4ff', color: '#9333ea', border: '1px solid #f3e8ff' }}
                  />
                ))
              : <Chip label="No role assigned" size="small" sx={{ bgcolor: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }} />}
          </Stack>
        </Box>
        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</Typography>
          <Typography variant="body2" color="text.primary">{formatDate(user.createdAt)}</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '3fr 2fr' }, gap: 3, alignItems: 'start' }}>
        {/* Profile details */}
        <Box component="form" onSubmit={handleSaveDetails} sx={card}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="text.primary">Profile details</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            {canManage ? 'Changes apply the next time they sign in.' : 'You need the ManageUsers permission to edit users.'}
          </Typography>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="First Name" required fullWidth disabled={!canManage} value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              <TextField label="Last Name" required fullWidth disabled={!canManage} value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </Stack>
            <TextField label="Email" type="email" required fullWidth disabled={!canManage} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            <TextField label="Phone Number" type="tel" required fullWidth disabled={!canManage} value={form.phoneNumber} onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))} />
          </Stack>
          {canManage && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 3, justifyContent: 'flex-end' }}>
              <Button variant="outlined" disabled={!detailsDirty || isSaving} onClick={() => setForm(toForm(user))} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>
                Discard
              </Button>
              <Button variant="contained" type="submit" disabled={!detailsDirty || isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Stack>
          )}
        </Box>

        {/* Roles */}
        <Box sx={card}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }} color="text.primary">Roles & access</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Each role grants a set of permissions. Manage what a role can do on the{' '}
            <Link href="/dashboard/roles" className="text-pink-600 hover:text-pink-700 no-underline">Roles page</Link>.
          </Typography>

          {allRoles.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>No roles exist yet. Create one on the Roles page first.</Alert>
          ) : (
            <Stack>
              {assignableRoles(allRoles, isAdmin).map((r) => (
                <FormControlLabel
                  key={r.id}
                  disabled={!canManageRoles}
                  sx={{ alignItems: 'flex-start', py: 0.5, mr: 0 }}
                  control={
                    <Checkbox
                      size="small"
                      checked={roleIds.includes(r.id)}
                      onChange={(e) => setRoleIds((ids) => (e.target.checked ? [...ids, r.id] : ids.filter((id) => id !== r.id)))}
                      sx={{ ...checkboxSx, pt: 0.25 }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }} color="text.primary">{r.name}</Typography>
                      {r.description && <Typography variant="caption" color="text.secondary">{r.description}</Typography>}
                    </Box>
                  }
                />
              ))}
            </Stack>
          )}

          {canManageRoles && allRoles.length > 0 && (
            <Stack direction="row" spacing={1.5} sx={{ mt: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" disabled={!rolesDirty || isSavingRoles} onClick={() => setRoleIds(savedRoleIds)} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>
                Discard
              </Button>
              <Button variant="contained" disabled={!rolesDirty || isSavingRoles} onClick={handleSaveRoles}>
                {isSavingRoles ? 'Saving...' : 'Save Roles'}
              </Button>
            </Stack>
          )}
        </Box>
      </Box>

      <ConfirmModal
        open={confirmSelfDemote}
        onClose={() => setConfirmSelfDemote(false)}
        onConfirm={saveRoles}
        title="Remove your own admin role?"
        message="You'll lose access to admin features after you next sign in, and another admin will need to restore it."
        confirmLabel="Remove anyway"
        confirmColor="warning"
        isLoading={isSavingRoles}
      />
    </Box>
  );
}
