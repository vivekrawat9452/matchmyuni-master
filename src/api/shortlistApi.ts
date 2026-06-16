import type {AxiosError} from 'axios';
import {apiClient} from './client';
import {asArray, unwrapEnvelope} from './parseResponse';
import {
  addLocalShortlist,
  getLocalShortlist,
  mergeShortlistCourses,
  removeLocalShortlist,
} from './shortlistLocal';
import type {ApiEnvelope, CourseListItem} from './types';

/** Try app-style path first, then path from prompts/apis/shortlist-student-apis.md */
const SHORTLIST_PATHS = ['/user/shortlist', '/api/user/shortlist'] as const;

function isShortlistNotFound(err: unknown): boolean {
  const status = (err as AxiosError)?.response?.status;
  return status === 404;
}

function isShortlistConflict(err: unknown): boolean {
  return (err as AxiosError)?.response?.status === 409;
}

export function resolveCourseId(course: CourseListItem): number | null {
  if (typeof course.id === 'number' && course.id > 0) {
    return course.id;
  }
  const alt = (course as {courseId?: number}).courseId;
  if (typeof alt === 'number' && alt > 0) {
    return alt;
  }
  return null;
}

async function withShortlistPath<T>(
  run: (path: string) => Promise<T>,
): Promise<T | null> {
  let lastErr: unknown;
  for (const path of SHORTLIST_PATHS) {
    try {
      return await run(path);
    } catch (err) {
      lastErr = err;
      if (!isShortlistNotFound(err)) {
        throw err;
      }
    }
  }
  if (lastErr) {
    return null;
  }
  return null;
}

async function fetchServerShortlist(): Promise<CourseListItem[] | null> {
  const result = await withShortlistPath(async path => {
    const {data} = await apiClient.get<ApiEnvelope<CourseListItem[]>>(path);
    const body = unwrapEnvelope(data) ?? data?.data;
    return asArray(body);
  });
  return result;
}

export async function getShortlist(): Promise<CourseListItem[]> {
  const local = await getLocalShortlist();
  try {
    const server = await fetchServerShortlist();
    if (server === null) {
      return local;
    }
    return mergeShortlistCourses(server, local);
  } catch {
    return local;
  }
}

export async function addToShortlist(courseId: number, course?: CourseListItem) {
  if (course) {
    await addLocalShortlist({...course, id: courseId});
  }

  try {
    const result = await withShortlistPath(async path => {
      const {data} = await apiClient.post<ApiEnvelope<{id: number}>>(path, {
        courseId,
      });
      return unwrapEnvelope(data) ?? data?.data;
    });
    return result;
  } catch (err) {
    if (isShortlistConflict(err)) {
      return null;
    }
    throw err;
  }
}

export async function removeFromShortlist(courseId: number) {
  await removeLocalShortlist(courseId);

  try {
    const result = await withShortlistPath(async path => {
      const {data} = await apiClient.delete<ApiEnvelope<{message: string}>>(
        `${path}/${courseId}`,
      );
      return unwrapEnvelope(data) ?? data?.data;
    });
    return result;
  } catch (err) {
    if (isShortlistNotFound(err)) {
      return null;
    }
    throw err;
  }
}

export function isShortlistApiUnavailable(err: unknown): boolean {
  return isShortlistNotFound(err);
}
