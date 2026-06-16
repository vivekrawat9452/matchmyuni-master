import type {
  ApplicationDto,
  ApplicationListItemDto,
  ApplicationsGroupedDto,
  ApplicationStatus,
} from './types';

/** Flat list of application rows from grouped or legacy API shape. */
export function flattenApplicationItems(
  data: ApplicationsGroupedDto | ApplicationDto[] | null | undefined,
): ApplicationListItemDto[] {
  if (!data) {
    return [];
  }
  if (Array.isArray(data)) {
    return data.map(app => ({
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
