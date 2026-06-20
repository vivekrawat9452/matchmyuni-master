import {apiClient} from './client';
import {fetchRestCountriesWithFallback} from './restCountriesApi';
import {asArray, unwrapEnvelope} from './parseResponse';
import type {
  ApiEnvelope,
  CoursesPage,
  CoursesQueryParams,
  CourseFiltersDto,
  CourseListItem,
  CourseSearchResult,
  FilterOption,
  UniversityDto,
  EventDto,
} from './types';

// ─── Health ───────────────────────────────────────────────────────────────────

const HEALTH_LOG = '[GET /health]';

export async function getHealth() {
  console.log(HEALTH_LOG, 'request');
  try {
    const {data} = await apiClient.get<{status: string; uptime?: number}>('/health');
    console.log(HEALTH_LOG, 'response', {status: data.status, uptime: data.uptime});
    return data;
  } catch (err) {
    console.error(HEALTH_LOG, 'failed', err);
    throw err;
  }
}

// ─── Courses ──────────────────────────────────────────────────────────────────

/**
 * GET /courses — supports API_Docs nested page object and legacy flat pagination.
 *
 * Documented: `{ status, data: { courses, total, page, limit } }`
 * Legacy live: `{ status, data: Course[], currentPage, itemsPerPage, totalItems, totalPages }`
 */
type CoursesListPayload =
  | CourseListItem[]
  | {
      courses?: CourseListItem[];
      data?: CourseListItem[];
      total?: number;
      page?: number;
      limit?: number;
      totalPages?: number;
    };

type CoursesListResponse = {
  status?: string;
  data?: CoursesListPayload;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  totalPages?: number;
};

function normalizeCoursesListResponse(
  res: CoursesListResponse,
  fallbackLimit: number,
): CoursesPage {
  const payload = res.data;

  if (Array.isArray(payload)) {
    const limit = res.itemsPerPage ?? fallbackLimit;
    const total = res.totalItems ?? payload.length;
    const page = res.currentPage ?? 1;
    const totalPages = res.totalPages ?? Math.max(1, Math.ceil(total / limit));
    return {courses: payload, total, page, limit, totalPages};
  }

  if (payload && typeof payload === 'object') {
    const courses = asArray(payload.courses ?? payload.data);
    const limit = payload.limit ?? res.itemsPerPage ?? fallbackLimit;
    const total = payload.total ?? res.totalItems ?? courses.length;
    const page = payload.page ?? res.currentPage ?? 1;
    const totalPages =
      payload.totalPages ??
      res.totalPages ??
      Math.max(1, Math.ceil(total / Math.max(limit, 1)));
    return {courses, total, page, limit, totalPages};
  }

  return {courses: [], total: 0, page: 1, limit: fallbackLimit, totalPages: 1};
}

export async function getCourses(params?: CoursesQueryParams): Promise<CoursesPage> {
  const limit = params?.limit ?? 10;
  const {data: res} = await apiClient.get<CoursesListResponse>('/courses', {params});
  return normalizeCoursesListResponse(res, limit);
}

const COURSE_DETAIL_LOG = '[GET /courses/:id]';

/** GET /courses/:id — envelope or raw course object at the root. */
function parseCourseDetailResponse(
  body: CourseListItem | ApiEnvelope<CourseListItem> | null | undefined,
): CourseListItem | null {
  const unwrapped = unwrapEnvelope(body);
  if (unwrapped && typeof unwrapped === 'object' && 'id' in unwrapped) {
    return unwrapped as CourseListItem;
  }
  return null;
}

export async function getCourseById(id: number): Promise<CourseListItem | null> {
  console.log(COURSE_DETAIL_LOG, 'request', {id});
  try {
    const res = await apiClient.get<CourseListItem | ApiEnvelope<CourseListItem>>(
      `/courses/${id}`,
    );
    const course = parseCourseDetailResponse(res.data);
    console.log(COURSE_DETAIL_LOG, 'response', {
      httpStatus: res.status,
      data: res.data,
      id,
      found: course != null,
      name: course?.name,
      duration: course?.duration,
      scholarshipAvailable: course?.scholarshipAvailable,
      scholarshipDetails: course?.scholarshipDetails,
      isPrime: course?.isPrime,
      upcomingIntakesCount: course?.upcomingIntakes?.length ?? 0,
    });
    return course;
  } catch (err) {
    console.error(COURSE_DETAIL_LOG, 'failed', {id, err});
    return null;
  }
}

const COURSE_SEARCH_LOG = '[GET /courses/search]';

/** GET /courses/search — quick autocomplete (up to 8 courses). */
export async function searchCourses(query: string): Promise<CourseSearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }
  console.log(COURSE_SEARCH_LOG, 'request', {query: trimmed});
  try {
    const {data} = await apiClient.get<ApiEnvelope<CourseSearchResult[]>>('/courses/search', {
      params: {query: trimmed},
    });
    const results = asArray(unwrapEnvelope(data));
    console.log(COURSE_SEARCH_LOG, 'response', {count: results.length});
    return results;
  } catch (err) {
    console.error(COURSE_SEARCH_LOG, 'failed', {query: trimmed, err});
    return [];
  }
}

/** Map string[] or FilterOption[] to FilterOption[]. */
function toFilterOptions(items: (string | FilterOption)[] | undefined): FilterOption[] {
  if (!items?.length) {
    return [];
  }
  return items.map(item =>
    typeof item === 'string' ? {label: item, value: item} : item,
  );
}

/**
 * GET /courses/filters — normalises API_Docs string arrays and legacy `{label,value}` arrays.
 */
function normalizeCourseFilters(raw: Record<string, unknown> | null | undefined): CourseFiltersDto {
  if (!raw) {
    return {
      degree_levels: [],
      countries: [],
      categories: [],
      durations: [],
      intakes: [],
      universities: [],
      fees: [],
      sort: [],
    };
  }

  const degree =
    raw.degree_levels ?? raw.degreelevels ?? raw.degreeLevels;
  const countries = raw.countries ?? raw.destinations;

  return {
    degree_levels: toFilterOptions(degree as (string | FilterOption)[]),
    countries: toFilterOptions(countries as (string | FilterOption)[]),
    categories: toFilterOptions(raw.categories as (string | FilterOption)[]),
    durations: toFilterOptions(raw.durations as (string | FilterOption)[]),
    intakes: toFilterOptions(raw.intakes as (string | FilterOption)[]),
    universities: toFilterOptions(raw.universities as (string | FilterOption)[]),
    fees: toFilterOptions(raw.fees as (string | FilterOption)[]),
    sort: toFilterOptions(raw.sort as (string | FilterOption)[]),
  };
}

export async function getCourseFilters(): Promise<CourseFiltersDto> {
  const {data} = await apiClient.get<ApiEnvelope<Record<string, unknown>>>('/courses/filters');
  return normalizeCourseFilters(unwrapEnvelope(data) ?? undefined);
}

// ─── Universities ─────────────────────────────────────────────────────────────

export async function getUniversities() {
  const {data} = await apiClient.get<ApiEnvelope<UniversityDto[]>>('/universities');
  return asArray(unwrapEnvelope(data));
}

export async function getUniversityById(id: number) {
  const {data} = await apiClient.get<ApiEnvelope<UniversityDto>>(`/universities/${id}`);
  return unwrapEnvelope(data);
}

// ─── Countries ────────────────────────────────────────────────────────────────

const GET_COUNTRIES_LOG = '[GET countries — onboarding picker]';

/** Onboarding country pickers — REST Countries v5 with bundled fallback. */
export async function getCountries() {
  console.log(GET_COUNTRIES_LOG, 'request');
  const countries = await fetchRestCountriesWithFallback();
  console.log(GET_COUNTRIES_LOG, 'response', {count: countries.length});
  return countries;
}

export async function getCountryById(id: number) {
  const countries = await getCountries();
  return countries.find(c => c.id === id) ?? null;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getEvents(params?: {
  eventType?: 'Online' | 'Offline';
  city?: string;
  country?: string;
  page?: number;
  limit?: number;
}) {
  const {data} = await apiClient.get<ApiEnvelope<EventDto[]>>('/events', {params});
  return asArray(unwrapEnvelope(data));
}

export async function getUpcomingEvent() {
  const {data} = await apiClient.get<ApiEnvelope<EventDto>>('/events/upcoming');
  return unwrapEnvelope(data);
}

export async function getEventById(id: number) {
  const {data} = await apiClient.get<ApiEnvelope<EventDto>>(`/events/${id}`);
  return unwrapEnvelope(data);
}
