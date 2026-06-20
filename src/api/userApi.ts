import {apiClient, postFormData} from './client';
import {parseCreatedApplication} from './applicationsUtils';
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
  ApplicationListItemDto,
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

const USER_ME_LOG = '[GET /user/me]';

export async function getUserMe() {
  console.log(USER_ME_LOG, 'request');
  try {
    const res = await apiClient.get<ApiEnvelope<UserDto>>('/user/me');
    const unwrapped =
      unwrapEnvelope(res.data) ?? (res.data as unknown as UserDto);
    console.log(USER_ME_LOG, 'response', {
      httpStatus: res.status,
      envelopeStatus: res.data?.status,
      userId: unwrapped?.id,
      studentId: unwrapped?.studentId,
      firstName: unwrapped?.firstName,
      lastName: unwrapped?.lastName,
      email: unwrapped?.email,
    });
    return unwrapped;
  } catch (err) {
    console.error(USER_ME_LOG, 'failed', err);
    throw err;
  }
}

const USER_DETAILS_LOG = '[GET /user/details]';

/** Full user details including student profile */
export async function getUserDetails() {
  console.log(USER_DETAILS_LOG, 'request');
  try {
    const res = await apiClient.get<ApiEnvelope<UserDetailsDto>>('/user/details');
    const details =
      unwrapEnvelope(res.data) ?? (res.data as unknown as UserDetailsDto);
    console.log(USER_DETAILS_LOG, 'response', {
      httpStatus: res.status,
      userId: details?.user?.id,
      hasStudentProfile: details?.studentProfile != null,
      preferredIntake: details?.studentProfile?.preferredIntake,
    });
    return details;
  } catch (err) {
    console.error(USER_DETAILS_LOG, 'failed', err);
    throw err;
  }
}

// ─── Student Profile ──────────────────────────────────────────────────────────

const PATCH_STUDENT_PROFILE_LOG = '[PATCH /student-profiles/update]';

export async function patchStudentProfile(body: StudentProfileUpdatePayload) {
  console.log(PATCH_STUDENT_PROFILE_LOG, 'request', body);
  try {
    const res = await apiClient.patch<ApiEnvelope<Record<string, unknown>>>(
      '/student-profiles/update',
      body,
    );
    const updated =
      unwrapEnvelope(res.data) ??
      (res.data as unknown as Record<string, unknown>);
    console.log(PATCH_STUDENT_PROFILE_LOG, 'response', {
      httpStatus: res.status,
      preferredDestination: updated?.preferredDestination,
      budgetCurrency: updated?.budgetCurrency,
      gradesObtained: updated?.gradesObtained,
    });
    return updated;
  } catch (err) {
    console.error(PATCH_STUDENT_PROFILE_LOG, 'failed', {body, err});
    throw err;
  }
}

// ─── Applications ─────────────────────────────────────────────────────────────

const APPLICATIONS_LOG = '[GET /applications]';
const APPLICATIONS_BY_IDS_LOG = '[GET /applications/by-ids]';
const CREATE_APPLICATION_LOG = '[POST /applications/create]';

/** GET /applications — grouped by fee payment status (applications-student-apis.md) */
export async function getApplications(): Promise<ApplicationsGroupedDto> {
  console.log(APPLICATIONS_LOG, 'request');
  try {
    const res = await apiClient.get<
      ApiEnvelope<
        ApplicationsGroupedDto | ApplicationListItemDto[] | ApplicationDto[]
      >
    >('/applications');
    const body = unwrapEnvelope(res.data);
    let grouped: ApplicationsGroupedDto;
    if (body && typeof body === 'object' && 'unpaid' in body) {
      grouped = {
        unpaid: asArray(body.unpaid),
        pending: asArray(body.pending),
        paid: asArray(body.paid),
      };
    } else {
      const flat = asArray(
        body as unknown as ApplicationListItemDto[] | null | undefined,
      );
      grouped = {
        unpaid: [],
        pending: [],
        paid: flat as ApplicationsGroupedDto['paid'],
      };
    }
    const flatItems = [
      ...grouped.unpaid,
      ...grouped.pending,
      ...grouped.paid,
    ];
    console.log(APPLICATIONS_LOG, 'response', {
      httpStatus: res.status,
      unpaid: grouped.unpaid.length,
      pending: grouped.pending.length,
      paid: grouped.paid.length,
      total: flatItems.length,
      applicationIds: flatItems.map(item => item.application?.id),
      statuses: flatItems.map(item => item.application?.status),
    });
    return grouped;
  } catch (err) {
    console.error(APPLICATIONS_LOG, 'failed', err);
    throw err;
  }
}

export async function getApplicationsByIds(
  ids: string[],
): Promise<ApplicationDetailDto[]> {
  console.log(APPLICATIONS_BY_IDS_LOG, 'request', {ids});
  try {
    const res = await apiClient.get<ApiEnvelope<ApplicationDetailDto[]>>(
      '/applications/by-ids',
      {params: {ids: ids.join(',')}},
    );
    const details = asArray(unwrapEnvelope(res.data));
    console.log(APPLICATIONS_BY_IDS_LOG, 'response', {
      httpStatus: res.status,
      count: details.length,
      applicationIds: details.map(d => d.application?.id),
      feeTypes: details.flatMap(d =>
        (d.applicationFees ?? []).map(f => f.feeType),
      ),
    });
    return details;
  } catch (err) {
    console.error(APPLICATIONS_BY_IDS_LOG, 'failed', {ids, err});
    throw err;
  }
}

/** POST /applications/create — body: `{ courseId, intakeId? }` (applications-student-apis.md) */
export async function createApplication(payload: CreateApplicationPayload) {
  console.log(CREATE_APPLICATION_LOG, 'request', payload);
  try {
    const res = await apiClient.post<
      ApiEnvelope<CreatedApplicationDto> | CreatedApplicationDto
    >('/applications/create', {
      courseId: payload.courseId,
      ...(payload.intakeId != null ? {intakeId: payload.intakeId} : {}),
    });
    const created = parseCreatedApplication(res.data);
    if (created) {
      console.log(CREATE_APPLICATION_LOG, 'response', {
        httpStatus: res.status,
        id: created.id,
        userId: created.userId,
        universityId: created.universityId,
        courseId: created.courseId,
        intakeId: created.intakeId,
        intakeLabel: created.intakeLabel,
        status: created.status,
        feeCurrency: created.feeCurrency,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      });
      return created;
    }
    console.error(CREATE_APPLICATION_LOG, 'invalid response', {
      httpStatus: res.status,
      data: res.data,
      unwrapped: unwrapEnvelope(res.data),
    });
    throw new Error('Invalid application create response');
  } catch (err) {
    console.error(CREATE_APPLICATION_LOG, 'failed', {payload, err});
    throw err;
  }
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

const USER_DOCUMENTS_LOG = '[GET /user/documents]';
const UPLOAD_DOCUMENTS_LOG = '[POST /user/documents]';

/** Allowed MIME types per prompts/apis/user-documents.md */
const ALLOWED_UPLOAD_MIMES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

function normalizeUploadMime(mime: string | undefined): string {
  const raw = (mime || 'application/pdf').trim().toLowerCase();
  if (raw === 'image/jpg') {
    return 'image/jpeg';
  }
  return raw;
}

export async function getUserDocuments() {
  console.log(USER_DOCUMENTS_LOG, 'request');
  try {
    const res = await apiClient.get<ApiEnvelope<UserDocumentDto[]>>('/user/documents');
    const docs = asArray(unwrapEnvelope(res.data));
    console.log(USER_DOCUMENTS_LOG, 'response', {
      httpStatus: res.status,
      count: docs.length,
      types: docs.map(d => d.documentType),
    });
    return docs;
  } catch (err) {
    console.error(USER_DOCUMENTS_LOG, 'failed', err);
    throw err;
  }
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

  const normalizedFiles = files.map(f => {
    const type = normalizeUploadMime(f.type);
    return {...f, type};
  });

  for (const f of normalizedFiles) {
    if (!ALLOWED_UPLOAD_MIMES.has(f.type)) {
      console.warn(UPLOAD_DOCUMENTS_LOG, 'mime not in allow-list', {
        mime: f.type,
        name: f.name,
        allowed: [...ALLOWED_UPLOAD_MIMES],
      });
    }
  }

  console.log(UPLOAD_DOCUMENTS_LOG, 'request', {
    documentType,
    fileCount: normalizedFiles.length,
    files: normalizedFiles.map(f => ({
      name: f.name,
      type: f.type,
      uriPrefix: normalizeUploadUri(f.uri).slice(0, 48),
    })),
  });

  const form = new FormData();
  for (const f of normalizedFiles) {
    form.append('files', {
      uri: uriForFormDataUpload(f.uri),
      name: f.name,
      type: f.type || 'application/octet-stream',
    } as unknown as Blob);
    // prompts/apis/user-documents.md — parallel `documentTypes` entry per file
    form.append('documentTypes', documentType);
  }

  try {
    const data = await postFormData<ApiEnvelope<UserDocumentDto[]>>(
      '/user/documents',
      form,
      {timeoutMs: 60_000},
    );
    const uploaded = asArray(unwrapEnvelope(data));
    console.log(UPLOAD_DOCUMENTS_LOG, 'response', {
      documentType,
      httpEnvelopeStatus: data?.status,
      uploadedCount: uploaded.length,
      ids: uploaded.map(d => d.id),
      types: uploaded.map(d => d.documentType),
      filenames: uploaded.map(d => d.filename),
    });
    return uploaded;
  } catch (err) {
    const axBody =
      err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {status?: number; data?: unknown}}).response
        : null;
    const bodyMsg = axBody?.data
      ? extractUploadErrorMessage(axBody.data)
      : null;
    console.error(UPLOAD_DOCUMENTS_LOG, 'failed', {
      documentType,
      fileCount: normalizedFiles.length,
      httpStatus: axBody?.status,
      message: bodyMsg ?? (err instanceof Error ? err.message : String(err)),
      responseBody: axBody?.data,
    });
    if (bodyMsg) {
      throw new Error(bodyMsg);
    }
    throw err instanceof Error ? err : new Error('Upload failed');
  }
}