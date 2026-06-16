import axios from 'axios';
import {apiClient} from './client';
import {getCourses} from './publicApi';
import {unwrapEnvelope} from './parseResponse';
import type {ApiEnvelope} from './types';
import type {CourseListItem} from './types';
import type {
  DiscoverRecommendationsData,
  RecommendationPreferencesGetData,
  RecommendationPreferencesPayload,
  SaveRecommendationPreferencesData,
  ScoreBand,
} from './recommendationTypes';

function isRecommendationNotFound(err: unknown): boolean {
  return axios.isAxiosError(err) && err.response?.status === 404;
}

/** GET /recommendations/preferences */
export async function getRecommendationPreferences(): Promise<RecommendationPreferencesGetData | null> {
  try {
    const {data} = await apiClient.get<ApiEnvelope<RecommendationPreferencesGetData>>(
      '/recommendations/preferences',
    );
    return unwrapEnvelope(data);
  } catch (err) {
    if (isRecommendationNotFound(err)) {
      console.warn(
        '[GET /recommendations/preferences] not deployed (404) — preferences unavailable',
      );
      return null;
    }
    throw err;
  }
}

/** PUT /recommendations/preferences */
export async function saveRecommendationPreferences(
  payload: RecommendationPreferencesPayload,
  options?: {accessToken?: string},
): Promise<SaveRecommendationPreferencesData | null> {
  try {
    const headers = options?.accessToken
      ? {Authorization: `Bearer ${options.accessToken}`}
      : undefined;
    const {data} = await apiClient.put<ApiEnvelope<SaveRecommendationPreferencesData>>(
      '/recommendations/preferences',
      payload,
      {headers},
    );
    return unwrapEnvelope(data);
  } catch (err) {
    if (isRecommendationNotFound(err)) {
      console.warn(
        '[PUT /recommendations/preferences] not deployed (404) — preferences not saved',
      );
      return null;
    }
    throw err;
  }
}

export type DiscoverRecommendationsParams = {
  page?: number;
  pageSize?: number;
};

function scoreBandFromMatchScore(matchScore: number): ScoreBand {
  if (matchScore >= 80) {
    return 'strong';
  }
  if (matchScore >= 60) {
    return 'good';
  }
  return 'explore';
}

/** Fallback when /recommendations/discover is not deployed yet. */
async function discoverFromCoursesList(
  params?: DiscoverRecommendationsParams,
): Promise<DiscoverRecommendationsData> {
  const pageSize = params?.pageSize ?? 10;
  const page = params?.page ?? 1;
  const coursesPage = await getCourses({page, limit: pageSize});
  const results = coursesPage.courses.map((course: CourseListItem, index: number) => {
    const matchScore = Math.max(60, 92 - index * 4);
    return {
      courseId: course.id,
      matchScore,
      scoreBand: scoreBandFromMatchScore(matchScore),
      scoreBreakdown: {field: 25, country: 25, budget: 25, intake: 25},
      finalRank: (page - 1) * pageSize + index + 1,
      whyMatch: [] as string[],
      isWidened: false,
      course,
    };
  });
  return {
    hasPreferences: true,
    results,
    pagination: {
      page: coursesPage.page,
      pageSize: coursesPage.limit,
      total: coursesPage.total,
      totalPages: coursesPage.totalPages,
      hasMore: coursesPage.page < coursesPage.totalPages,
    },
  };
}

const DISCOVER_LOG = '[GET /recommendations/discover]';

/** GET /recommendations/discover */
export async function getDiscoverRecommendations(
  params?: DiscoverRecommendationsParams,
): Promise<DiscoverRecommendationsData | null> {
  console.log(DISCOVER_LOG, 'request', {params});
  try {
    const res = await apiClient.get<ApiEnvelope<DiscoverRecommendationsData>>(
      '/recommendations/discover',
      {params},
    );
    const unwrapped = unwrapEnvelope(res.data);
    console.log(DISCOVER_LOG, 'response', {
      httpStatus: res.status,
      envelopeStatus: res.data?.status,
      hasEnvelopeData: res.data != null && 'data' in res.data,
      hasPreferences: unwrapped?.hasPreferences,
      resultsCount: unwrapped?.results?.length ?? 0,
      pagination: unwrapped?.pagination,
      firstCourseIds: unwrapped?.results?.slice(0, 3).map(r => r.courseId),
    });
    if (!unwrapped) {
      console.warn(DISCOVER_LOG, 'unwrap returned null', {rawBody: res.data});
    } else if (!unwrapped.results?.length) {
      console.warn(DISCOVER_LOG, 'empty results array', {
        hasPreferences: unwrapped.hasPreferences,
        pagination: unwrapped.pagination,
      });
    }
    return unwrapped;
  } catch (err) {
    if (isRecommendationNotFound(err)) {
      console.warn(
        DISCOVER_LOG,
        'not deployed (404) — falling back to GET /courses',
      );
      return discoverFromCoursesList(params);
    }
    console.error(DISCOVER_LOG, 'failed', err);
    throw err;
  }
}

/**
 * GET /recommendations/discover — server applies saved preferences (page/pageSize only).
 * Alias kept for call sites; no separate preferences fetch is required per API spec.
 */
export async function getDiscoverRecommendationsWithPreferences(
  params?: DiscoverRecommendationsParams,
): Promise<DiscoverRecommendationsData | null> {
  return getDiscoverRecommendations(params);
}
