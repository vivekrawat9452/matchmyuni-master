import {unwrapEnvelope} from './parseResponse';
import type {
  ApiEnvelope,
  ApplicationDto,
  ApplicationListItemDto,
  ApplicationsGroupedDto,
  ApplicationStatus,
  CreatedApplicationDto,
} from './types';

function isRecord(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === 'object' && !Array.isArray(v);
}

/** Normalize POST /applications/create payloads (flat DTO or nested list-item shape). */
export function parseCreatedApplication(
  body: unknown,
): CreatedApplicationDto | null {
  let payload: unknown = unwrapEnvelope(body as ApiEnvelope<unknown>);
  if (
    isRecord(payload) &&
    'status' in payload &&
    'data' in payload &&
    !('id' in payload) &&
    !('application' in payload)
  ) {
    payload = unwrapEnvelope(payload as unknown as ApiEnvelope<unknown>);
  }
  if (!isRecord(payload)) {
    return null;
  }

  const id =
    (typeof payload.id === 'string' && payload.id) ||
    (typeof payload.applicationId === 'string' && payload.applicationId) ||
    (isRecord(payload.application) &&
    typeof payload.application.id === 'string'
      ? payload.application.id
      : '');

  if (!id) {
    return null;
  }

  const nestedApp = isRecord(payload.application) ? payload.application : null;
  const nestedCourse = isRecord(payload.course) ? payload.course : null;

  return {
    id,
    userId:
      (typeof payload.userId === 'string' && payload.userId) ||
      (nestedApp && typeof nestedApp.userId === 'string'
        ? nestedApp.userId
        : ''),
    universityId:
      (typeof payload.universityId === 'number' && payload.universityId) ||
      (nestedCourse && typeof nestedCourse.universityId === 'number'
        ? nestedCourse.universityId
        : 0),
    courseId:
      (typeof payload.courseId === 'number' && payload.courseId) ||
      (nestedCourse && typeof nestedCourse.id === 'number'
        ? nestedCourse.id
        : 0),
    intakeId:
      typeof payload.intakeId === 'number'
        ? payload.intakeId
        : nestedApp && typeof nestedApp.intakeId === 'number'
          ? nestedApp.intakeId
          : 0,
    intakeLabel:
      typeof payload.intakeLabel === 'string'
        ? payload.intakeLabel
        : nestedApp && typeof nestedApp.intakeLabel === 'string'
          ? nestedApp.intakeLabel
          : undefined,
    status: (nestedApp?.status ?? payload.status ?? 'created') as ApplicationStatus,
    feeCurrency:
      typeof payload.feeCurrency === 'string'
        ? payload.feeCurrency
        : nestedApp && typeof nestedApp.feeCurrency === 'string'
          ? nestedApp.feeCurrency
          : undefined,
    createdAt:
      (typeof payload.createdAt === 'string' && payload.createdAt) ||
      (nestedApp && typeof nestedApp.createdAt === 'string'
        ? nestedApp.createdAt
        : ''),
    updatedAt:
      (typeof payload.updatedAt === 'string' && payload.updatedAt) ||
      (nestedApp && typeof nestedApp.updatedAt === 'string'
        ? nestedApp.updatedAt
        : ''),
  };
}

/** Flat list of application rows from grouped, list-item, or legacy API shape. */
export function flattenApplicationItems(
  data:
    | ApplicationsGroupedDto
    | ApplicationListItemDto[]
    | ApplicationDto[]
    | null
    | undefined,
): ApplicationListItemDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    if (
      data.length > 0 &&
      typeof data[0] === 'object' &&
      data[0] != null &&
      'application' in data[0]
    ) {
      return data as ApplicationListItemDto[];
    }
    return (data as ApplicationDto[]).map(app => ({
      application: {
        id: app.id,
        status: app.status,
        receiptUrl: app.receiptUrl ?? null,
      },
      course: app.course ?? {
        id: app.courseId,
        universityId: app.universityId,
        universityName: app.university?.name ?? '',
        name: 'Course',
      },
      university: {
        name: app.university?.name ?? app.course?.universityName ?? '',
        logoUrl: app.university?.logoUrl,
      },
    }));
  }
  return [...data.unpaid, ...data.pending, ...data.paid];
}

/** Legacy home dashboard shape from grouped list items. */
export function toApplicationDtos(
  items: ApplicationListItemDto[],
): ApplicationDto[] {
  return items.map(item => ({
    id: item.application.id,
    userId: '',
    universityId: item.course.universityId ?? 0,
    courseId: item.course.id,
    status: item.application.status as ApplicationStatus,
    createdAt: '',
    updatedAt: '',
    course: item.course,
    university: item.university
      ? {
          id: item.course.universityId ?? 0,
          name: item.university.name,
          city: item.course.city ?? '',
          country: item.course.country ?? '',
          logoUrl: item.university.logoUrl,
        }
      : undefined,
  }));
}

export function countApplications(
  data: ApplicationsGroupedDto | ApplicationDto[] | null | undefined,
): number {
  return flattenApplicationItems(data).length;
}
