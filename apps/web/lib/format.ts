import api from './api';
import { extractPagedItems } from './apiHelpers';
import type { SelectOption } from '../components/crud/GymResourcePage';
import type { Member } from '../types/member';
import type { Equipment, InventoryItem, Staff } from '../types/resources';

export const formatMoney = (value?: number | null) =>
  value == null ? '—' : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString() : '—';

export const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';

/** ISO string -> value for <input type="date"> */
export const toDateInput = (value?: string | null) => (value ? value.slice(0, 10) : '');

/** ISO string -> value for <input type="datetime-local"> in the browser's time zone */
export const toDateTimeInput = (value?: string | null) => {
  if (!value) return '';
  const d = new Date(value);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

/** Date or datetime input value -> UTC ISO string the backend accepts */
export const toIso = (value?: string) => (value ? new Date(value).toISOString() : null);

/** Form string -> number for the API (0 when empty) */
export const num = (value?: string) => (value ? parseFloat(value) : 0);
export const int = (value?: string) => (value ? parseInt(value, 10) : 0);

const ALL = { page: 1, pageSize: 100 };

export const loadMemberOptions = async (gymId: string): Promise<SelectOption[]> => {
  const res = await api.get(`/members/all/${gymId}`, { params: ALL });
  return extractPagedItems<Member>(res).map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }));
};

export const loadEquipmentOptions = async (gymId: string): Promise<SelectOption[]> => {
  const res = await api.get(`/equipments/gym/${gymId}`, { params: ALL });
  return extractPagedItems<Equipment>(res).map((e) => ({ value: e.id, label: e.name }));
};

export const loadInventoryOptions = async (gymId: string): Promise<SelectOption[]> => {
  const res = await api.get(`/inventory/gym/${gymId}`, { params: ALL });
  return extractPagedItems<InventoryItem>(res).map((i) => ({
    value: i.id,
    label: `${i.name} — ${formatMoney(i.price)} (${i.quantity} in stock)`,
    meta: { price: i.price, quantity: i.quantity, name: i.name },
  }));
};

export const loadStaffOptions = async (gymId: string): Promise<SelectOption[]> => {
  const res = await api.get(`/staffs/gym/${gymId}`);
  return extractPagedItems<Staff>(res).map((s) => ({ value: s.staffId, label: `${s.firstName} ${s.lastName}` }));
};
