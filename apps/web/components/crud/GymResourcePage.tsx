'use client';

import { useCallback, useEffect, useMemo, useState, ReactNode } from 'react';
import { toast } from 'react-toastify';
import { AppTable, AppModal, ConfirmModal, Column } from '@repo/ui';
import {
  Box, Button, MenuItem, Stack, TablePagination, TextField, Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import api from '../../lib/api';
import { extractPagedResult, getErrorMessage } from '../../lib/apiHelpers';
import { useAuth } from '../../context/AuthContext';
import { useGym } from '../../context/GymContext';
import { GymContextChip } from '../ui/GymContextChip';
import { NoGymNotice } from '../ui/NoGymNotice';

export interface SelectOption {
  value: string;
  label: string;
  /** Extra data about the option, e.g. an item's unit price */
  meta?: Record<string, unknown>;
}

export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'datetime' | 'textarea' | 'select';
  required?: boolean;
  options?: SelectOption[];
  /** Load select options for the current gym (e.g. members, equipment) */
  loadOptions?: (gymId: string) => Promise<SelectOption[]>;
  step?: string;
  min?: string;
  placeholder?: string;
  /** Only show the field when editing */
  editOnly?: boolean;
}

/** Labels for loaded select options, keyed by field name then option value */
export type Lookups = Record<string, Record<string, string>>;

export type FormValues = Record<string, string>;

export interface GymResourceConfig<T> {
  title: string;
  subtitle: string;
  singular: string;
  emptyIcon: string;
  listUrl: (gymId: string) => string;
  createUrl: (gymId: string) => string;
  updateUrl: (row: T, gymId: string) => string;
  deleteUrl: (row: T) => string;
  getId?: (row: T) => string;
  fields: FieldDef[];
  columns: (lookups: Lookups) => Column<T & { id: string }>[];
  toForm: (row: T) => FormValues;
  toPayload: (form: FormValues, gymId: string) => Record<string, unknown>;
  /** Permission required to create, edit and delete; omit when the backend doesn't guard it */
  permission?: string;
  /** Whether the list endpoint supports page/pageSize */
  paged?: boolean;
  searchText?: (row: T, lookups: Lookups) => string;
  /** Adjust other fields after one changes (e.g. recalculate a total) */
  onFormChange?: (form: FormValues, changed: string, options: Record<string, SelectOption[]>) => FormValues;
  /** Helper text shown under a field */
  helperText?: (form: FormValues, options: Record<string, SelectOption[]>) => Record<string, string | undefined>;
  headerExtra?: ReactNode;
}

const emptyFormFor = (fields: FieldDef[]): FormValues =>
  Object.fromEntries(fields.map((f) => [f.name, '']));

/**
 * List / create / edit / delete page for a resource that belongs to a gym
 * (staff, plans, classes, equipment, repairs, inventory, sales).
 */
export function GymResourcePage<T>({ config }: { config: GymResourceConfig<T> }) {
  const { can } = useAuth();
  const { gymId, isLoadingGyms } = useGym();
  const canManage = config.permission ? can(config.permission) : true;
  const getId = useCallback(
    (row: T) => config.getId?.(row) ?? String((row as Record<string, unknown>).id ?? ''),
    [config]
  );

  const [rows, setRows] = useState<T[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lookups, setLookups] = useState<Lookups>({});
  const [optionsByField, setOptionsByField] = useState<Record<string, SelectOption[]>>({});

  const [editing, setEditing] = useState<T | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormValues>(() => emptyFormFor(config.fields));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteRow, setDeleteRow] = useState<T | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRows = useCallback(async () => {
    if (!gymId) { setRows([]); setTotalCount(0); setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await api.get(config.listUrl(gymId), {
        params: config.paged === false ? undefined : { page: page + 1, pageSize },
      });
      const result = extractPagedResult<T>(res);
      setRows(result?.items ?? []);
      setTotalCount(result?.totalCount ?? result?.items?.length ?? 0);
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to load ${config.title.toLowerCase()}.`));
      setRows([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [gymId, page, pageSize, config]);

  useEffect(() => { fetchRows(); }, [fetchRows]);
  useEffect(() => { setPage(0); }, [gymId]);

  // Load options for select fields that depend on the gym (members, equipment, ...)
  useEffect(() => {
    if (!gymId) return;
    const loaders = config.fields.filter((f) => f.loadOptions);
    if (loaders.length === 0) return;
    let cancelled = false;
    Promise.all(
      loaders.map(async (f) => {
        try { return [f.name, await f.loadOptions!(gymId)] as const; }
        catch { return [f.name, [] as SelectOption[]] as const; }
      })
    ).then((entries) => {
      if (cancelled) return;
      setOptionsByField(Object.fromEntries(entries));
      setLookups(Object.fromEntries(entries.map(([name, opts]) => [
        name,
        Object.fromEntries(opts.map((o) => [o.value, typeof o.meta?.name === 'string' ? o.meta.name : o.label])),
      ])));
    });
    return () => { cancelled = true; };
  }, [gymId, config]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyFormFor(config.fields));
    setShowForm(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setForm({ ...emptyFormFor(config.fields), ...config.toForm(row) });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) return;
    setIsSubmitting(true);
    try {
      const payload = config.toPayload(form, gymId);
      if (editing) {
        await api.put(config.updateUrl(editing, gymId), payload);
        toast.success(`${config.singular} updated successfully!`);
      } else {
        await api.post(config.createUrl(gymId), payload);
        toast.success(`${config.singular} created successfully!`);
      }
      closeForm();
      fetchRows();
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to save ${config.singular.toLowerCase()}.`));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteRow) return;
    setIsDeleting(true);
    try {
      await api.delete(config.deleteUrl(deleteRow));
      toast.success(`${config.singular} deleted successfully.`);
      fetchRows();
    } catch (err) {
      toast.error(getErrorMessage(err, `Failed to delete ${config.singular.toLowerCase()}.`));
    } finally {
      setIsDeleting(false);
      setDeleteRow(null);
    }
  };

  const tableRows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows
      .filter((r) => !term || (config.searchText?.(r, lookups) ?? JSON.stringify(r)).toLowerCase().includes(term))
      .map((r) => ({ ...r, id: getId(r) }));
  }, [rows, search, lookups, config, getId]);

  const columns: Column<T & { id: string }>[] = [
    ...config.columns(lookups),
    ...(canManage
      ? [{
          key: 'actions',
          label: 'Actions',
          align: 'right' as const,
          render: (row: T & { id: string }) => (
            <Stack direction="row" sx={{ gap: 1, justifyContent: 'flex-end' }}>
              <Button size="small" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5, borderColor: '#e2e8f0', color: 'text.secondary' }} onClick={() => openEdit(row)}>
                Edit
              </Button>
              <Button size="small" color="error" variant="outlined" sx={{ fontSize: '0.75rem', px: 1.5 }} onClick={() => setDeleteRow(row)}>
                Delete
              </Button>
            </Stack>
          ),
        }]
      : []),
  ];

  const renderField = (f: FieldDef) => {
    const value = form[f.name] ?? '';
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => {
        const next = { ...p, [f.name]: e.target.value };
        return config.onFormChange ? config.onFormChange(next, f.name, optionsByField) : next;
      });
    const options = f.options ?? optionsByField[f.name] ?? [];
    const helper = config.helperText?.(form, optionsByField)?.[f.name];

    if (f.type === 'select') {
      return (
        <TextField key={f.name} select label={f.label} required={f.required} fullWidth value={value} onChange={onChange} helperText={helper}>
          {!f.required && <MenuItem value=""><em>None</em></MenuItem>}
          {options.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
          {options.length === 0 && f.required && <MenuItem value="" disabled>No options available</MenuItem>}
        </TextField>
      );
    }

    const inputType = f.type === 'datetime' ? 'datetime-local' : f.type === 'textarea' ? undefined : f.type ?? 'text';
    return (
      <TextField
        key={f.name}
        label={f.label}
        type={inputType}
        required={f.required}
        fullWidth
        multiline={f.type === 'textarea'}
        rows={f.type === 'textarea' ? 3 : undefined}
        value={value}
        placeholder={f.placeholder}
        helperText={helper}
        onChange={onChange}
        slotProps={{
          inputLabel: f.type === 'date' || f.type === 'datetime' ? { shrink: true } : undefined,
          htmlInput: { step: f.step, min: f.min },
        }}
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="text.primary">{config.title}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{config.subtitle}</Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <GymContextChip />
          {config.headerExtra}
          {canManage && gymId && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              Add {config.singular}
            </Button>
          )}
        </Stack>
      </Box>

      {!gymId && !isLoadingGyms && <NoGymNotice what={config.title.toLowerCase()} />}

      <TextField
        placeholder={`Search ${config.title.toLowerCase()} on this page...`}
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ '& .MuiOutlinedInput-root': { bgcolor: 'white' } }}
      />

      <Box>
        <AppTable
          columns={columns}
          rows={tableRows}
          isLoading={isLoading}
          emptyIcon={config.emptyIcon}
          emptyTitle={search ? `No ${config.title.toLowerCase()} match your search.` : `No ${config.title.toLowerCase()} yet.`}
          emptySubtitle={canManage && gymId && !search ? `Use 'Add ${config.singular}' to create one.` : undefined}
        />
        {config.paged !== false && totalCount > 0 && (
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        )}
      </Box>

      <AppModal
        open={showForm}
        onClose={closeForm}
        title={editing ? `Edit ${config.singular}` : `Add ${config.singular}`}
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5} sx={{ mt: 1, mb: 1 }}>
            {config.fields.filter((f) => !f.editOnly || editing).map(renderField)}
          </Stack>
          <Stack direction="row" spacing={1.5} sx={{ mt: 2, mb: 1 }}>
            <Button fullWidth variant="outlined" onClick={closeForm} sx={{ borderColor: '#e2e8f0', color: 'text.secondary' }}>Cancel</Button>
            <Button fullWidth variant="contained" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editing ? 'Save Changes' : `Create ${config.singular}`}
            </Button>
          </Stack>
        </form>
      </AppModal>

      <ConfirmModal
        open={!!deleteRow}
        onClose={() => setDeleteRow(null)}
        onConfirm={handleDelete}
        title={`Delete ${config.singular}?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={isDeleting}
      />
    </Box>
  );
}
