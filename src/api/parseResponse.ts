import type {ApiEnvelope} from './types';

/** Read `data` from a standard `{ status, data }` envelope. */
export function unwrapEnvelope<T>(body: ApiEnvelope<T> | T | null | undefined): T | null {
  if (body == null || typeof body !== 'object') {
    return null;
  }
  if ('status' in body && 'data' in body) {
    return (body as ApiEnvelope<T>).data ?? null;
  }
  return body as T;
}

/** True when the value is a non-empty array. */
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}
