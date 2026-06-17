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

const PREFERENCES_GET_LOG = '[GET /recommendations/preferences]';
const PREFERENCES_PUT_LOG = '[PUT /recommendations/preferences]';

/** GET /recommendations/preferences */
export async function getRecommendationPreferences(): Promise<RecommendationPreferencesGetData | null> {
  console.log(PREFERENCES_GET_LOG, 'request');
  try {
    const res = await apiClient.get<ApiEnvelope<RecommendationPreferencesGetData>>(
      '/recommendations/preferences',
    );
    const unwrapped = unwrapEnvelope(res.data);
    console.log(PREFERENCES_GET_LOG, 'response', {
      data: res.data,
      httpStatus: res.status,
      envelopeStatus: res.data,
      hasPreferences: unwrapped?.preferences != null,
      preferredCategoriesCount: unwrapped?.preferences?.preferredCategories?.length ?? 0,
      preferredCountriesCount: unwrapped?.preferences?.preferredCountries?.length ?? 0,
      allowedCategoriesCount: unwrapped?.allowedCategories?.length ?? 0,
      allowedCountriesCount: unwrapped?.allowedCountries?.length ?? 0,
    });
    return unwrapped;
  } catch (err) {
    if (isRecommendationNotFound(err)) {
      console.warn(PREFERENCES_GET_LOG, 'not deployed (404) — preferences unavailable');
      return null;
    }
    console.error(PREFERENCES_GET_LOG, 'failed', err);
    throw err;
  }
}

/** PUT /recommendations/preferences */
export async function saveRecommendationPreferences(
  payload: RecommendationPreferencesPayload,
  options?: {accessToken?: string},
): Promise<SaveRecommendationPreferencesData | null> {
  console.log(PREFERENCES_PUT_LOG, 'request (onboarding signup)', {
    highestQualificationLevel: payload.highestQualificationLevel,
    intendedStart: payload.intendedStart,
    budget: payload.budget,
    preferredCategories: payload.preferredCategories,
    preferredCountries: payload.preferredCountries,
    hasExplicitAccessToken: Boolean(options?.accessToken),
  });
  try {
    const headers = options?.accessToken
      ? {Authorization: `Bearer ${options.accessToken}`}
      : undefined;
    const res = await apiClient.put<ApiEnvelope<SaveRecommendationPreferencesData>>(
      '/recommendations/preferences',
      payload,
      {headers},
    );
    const unwrapped = unwrapEnvelope(res.data);
    console.log(PREFERENCES_PUT_LOG, 'response (onboarding signup)', {
      httpStatus: res.status,
      envelopeStatus: res.data?.status,
      profileHash: unwrapped?.profileHash,
      cacheInvalidated: unwrapped?.cacheInvalidated,
      preferencesSetAt: unwrapped?.preferences?.preferencesSetAt,
    });
    return unwrapped;
  } catch (err) {
    if (isRecommendationNotFound(err)) {
      console.warn(PREFERENCES_PUT_LOG, 'not deployed (404) — preferences not saved');
      return null;
    }
    console.error(PREFERENCES_PUT_LOG, 'failed (onboarding signup)', err);
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
