import type {AxiosError} from 'axios';
import {apiClient} from './client';
import {asArray, unwrapEnvelope} from './parseResponse';

const GET_SHORTLIST_LOG = '[GET /api/user/shortlist]';
const POST_SHORTLIST_LOG = '[POST /api/user/shortlist]';
const DELETE_SHORTLIST_LOG = '[DELETE /api/user/shortlist/:courseId]';
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
  console.log(GET_SHORTLIST_LOG, 'request');
  const result = await withShortlistPath(async path => {
    const {data} = await apiClient.get<ApiEnvelope<CourseListItem[]>>(path);
    const body = unwrapEnvelope(data) ?? data?.data;
    const items = asArray(body);
    console.log(GET_SHORTLIST_LOG, 'response', {
      path,
      count: items.length,
      courseIds: items.map(c => c.id),
      shortlistIds: items.map(c => (c as {shortlistId?: number}).shortlistId),
    });
    return items;
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
    console.log(POST_SHORTLIST_LOG, 'request', {courseId});
    const result = await withShortlistPath(async path => {
      const {data} = await apiClient.post<ApiEnvelope<{id: number}>>(path, {
        courseId,
      });
      const created = unwrapEnvelope(data) ?? data?.data;
      console.log(POST_SHORTLIST_LOG, 'response', {path, courseId, created});
      return created;
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
    console.log(DELETE_SHORTLIST_LOG, 'request', {courseId});
    const result = await withShortlistPath(async path => {
      const {data} = await apiClient.delete<ApiEnvelope<{message: string}>>(
        `${path}/${courseId}`,
      );
      const removed = unwrapEnvelope(data) ?? data?.data;
      console.log(DELETE_SHORTLIST_LOG, 'response', {path, courseId, removed});
      return removed;
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
