import { ApiResponse, PagedResult } from '../types/api';

/**
 * Extract the data payload from a standard API response.
 * Backend wraps all responses in { success, message, data }.
 */
export function extractData<T = any>(response: any): T {
  return response?.data?.data;
}

/**
 * Extract items array from a paginated API response.
 * Backend returns { success, message, data: { items, totalCount, page, ... } }.
 */
export function extractPagedItems<T = any>(response: any): T[] {
  return response?.data?.data?.items ?? [];
}

/**
 * Extract the full paged result (items + pagination metadata).
 */
export function extractPagedResult<T = any>(response: any): PagedResult<T> {
  return response?.data?.data;
}

/**
 * Extract the message from an API response.
 */
export function extractMessage(response: any): string {
  return response?.data?.message || '';
}

/**
 * Pull a readable message out of a failed request, including the first
 * validation error the backend returns.
 */
export function getErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string; detail?: string; errors?: { errors?: { description?: string; message?: string }[] } } } })?.response?.data;
  const validation = data?.errors?.errors;
  if (Array.isArray(validation) && validation.length > 0) {
    return validation[0]?.description || validation[0]?.message || data?.message || fallback;
  }
  return data?.message || data?.detail || fallback;
}
