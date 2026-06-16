import {apiClient, postFormData} from './client';
import {normalizeUploadUri, uriForFormDataUpload} from '../utils/pickedFile';
import {asArray, unwrapEnvelope} from './parseResponse';
import {API_DOCUMENT_TYPES, type ApiDocumentType} from './documentTypes';
import type {
  ApiEnvelope,
  StudentProfileUpdatePayload,
  UserDto,
  UserDetailsDto,
  ApplicationDto,
  ApplicationDetailDto,
  ApplicationsGroupedDto,
  CreateApplicationPayload,
  CreatedApplicationDto,
  PaymentHistoryDto,
  UserDocumentDto,
} from './types';

export type UploadDocumentFile = {
  uri: string;
  name: string;
  type: string;
};

function assertApiDocumentType(value: string): asserts value is ApiDocumentType {
  if (!(API_DOCUMENT_TYPES as readonly string[]).includes(value)) {
    throw new Error(`Invalid documentType: "${value}"`);
  }
}

function extractUploadErrorMessage(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  if ('message' in body && typeof body.message === 'string' && body.message.trim()) {
    return body.message;
  }
  if ('data' in body && body.data && typeof body.data === 'object') {
    const data = body.data as {message?: unknown};
    if (typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }
  }
  return null;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export async function getUserMe() {
  const {data} = await apiClient.get<ApiEnvelope<UserDto>>('/user/me');
  return unwrapEnvelope(data) ?? (data as UserDto);
}

/** Full user details including student profile */
export async function getUserDetails() {
  const {data} = await apiClient.get<ApiEnvelope<UserDetailsDto>>('/user/details');
  return unwrapEnvelope(data) ?? (data as UserDetailsDto);
}

// ─── Student Profile ──────────────────────────────────────────────────────────

export async function patchStudentProfile(body: StudentProfileUpdatePayload) {
  const {data} = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
    '/student-profiles/update',
    body,
  );
  return unwrapEnvelope(data) ?? (data as Record<string, unknown>);
}

// ─── Applications ─────────────────────────────────────────────────────────────

/** GET /applications — grouped by fee payment status (applications-student-apis.md) */
export async function getApplications(): Promise<ApplicationsGroupedDto> {
  const {data} = await apiClient.get<
    ApiEnvelope<ApplicationsGroupedDto | ApplicationDto[]>
  >('/applications');
  const body = unwrapEnvelope(data);
  if (body && typeof body === 'object' && 'unpaid' in body) {
    return {
      unpaid: asArray(body.unpaid),
      pending: asArray(body.pending),
      paid: asArray(body.paid),
    };
  }
  const flat = asArray(body as ApplicationDto[] | null);
  return {unpaid: [], pending: [], paid: flat as unknown as ApplicationsGroupedDto['paid']};
}

export async function getApplicationsByIds(
  ids: string[],
): Promise<ApplicationDetailDto[]> {
  const {data} = await apiClient.get<ApiEnvelope<ApplicationDetailDto[]>>(
    '/applications/by-ids',
    {params: {ids: ids.join(',')}},
  );
  return asArray(unwrapEnvelope(data));
}

/** POST /applications/create — body: `{ courseId }` only (API_Docs.md) */
export async function createApplication(payload: CreateApplicationPayload) {
  const {data} = await apiClient.post<
    ApiEnvelope<CreatedApplicationDto> | CreatedApplicationDto
  >('/applications/create', {courseId: payload.courseId});
  const created = unwrapEnvelope(data);
  if (created && typeof created === 'object' && 'id' in created) {
    return created as CreatedApplicationDto;
  }
  throw new Error('Invalid application create response');
}

export async function deleteApplication(id: string) {
  const {data} = await apiClient.delete<ApiEnvelope<{message: string}>>(
    `/applications/${id}`,
  );
  return unwrapEnvelope(data) ?? (data as {message: string});
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export async function getPaymentHistory(params?: {page?: number; limit?: number}) {
  const {data} = await apiClient.get<ApiEnvelope<PaymentHistoryDto[]>>(
    '/payments/history',
    {params},
  );
  return asArray(unwrapEnvelope(data));
}

// ─── Documents ────────────────────────────────────────────────────────────────

export async function getUserDocuments() {
  const {data} = await apiClient.get<ApiEnvelope<UserDocumentDto[]>>('/user/documents');
  return asArray(unwrapEnvelope(data));
}

/**
 * Upload one or more document files (same `documentType` for every file in the batch).
 * POST /user/documents — multipart/form-data: `files`, `documentTypes` (parallel arrays, max 10).
 * @see prompts/apis/user-documents.md
 */
export async function uploadDocuments(
  documentType: ApiDocumentType,
  files: UploadDocumentFile[],
): Promise<UserDocumentDto[]> {
  if (!documentType) {
    throw new Error('documentType is required');
  }
  assertApiDocumentType(documentType);
  if (!files.length) {
    throw new Error('At least one file is required');
  }
  if (files.length > 10) {
    throw new Error('Maximum 10 files per upload');
  }

  const form = new FormData();
  for (const f of files) {
    form.append('files', {
      uri: uriForFormDataUpload(f.uri),
      name: f.name,
      type: f.type || 'application/octet-stream',
    } as unknown as Blob);
    form.append('documentTypes', documentType);
  }

  if (__DEV__) {
    const first = files[0];
    const uri = normalizeUploadUri(first.uri);
    console.log(
      `[uploadDocuments] type=${documentType} files=${files.length} name=${first.name} mime=${first.type} uri=${uri.slice(0, 60)}`,
    );
  }

  try {
    const data = await postFormData<ApiEnvelope<UserDocumentDto[]>>(
      '/user/documents',
      form,
      {timeoutMs: 60_000},
    );
    if (__DEV__) {
      console.log('[uploadDocuments] success', {documentType, count: files.length});
    }
    return asArray(unwrapEnvelope(data));
  } catch (err) {
    const bodyMsg =
      err && typeof err === 'object' && 'response' in err
        ? extractUploadErrorMessage((err as {response?: {data?: unknown}}).response?.data)
        : null;
    if (bodyMsg) {
      throw new Error(bodyMsg);
    }
    throw err instanceof Error ? err : new Error('Upload failed');
  }
}