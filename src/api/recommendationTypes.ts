import type {CourseListItem} from './types';

/** API values — prompts/apis/recommendation-student-apis.md */
export type HighestQualificationLevel =
  | 'grade_10'
  | 'grade_12'
  | 'diploma'
  | 'bachelors'
  | 'masters';

export type IntendedStart = 'this_year' | 'next_year' | 'two_three_years';

export type RecommendationBudget =
  | 'under_3k'
  | 'three_to_6k'
  | 'six_to_12k'
  | 'not_sure';

export type ScoreBand = 'strong' | 'good' | 'explore';

export interface RecommendationPreferences {
  highestQualificationLevel: HighestQualificationLevel;
  intendedStart: IntendedStart;
  preferredCategories: string[];
  preferredCountries: string[];
  budget: RecommendationBudget;
  profileHash?: string;
  preferencesSetAt?: string;
}

export interface RecommendationPreferencesPayload {
  highestQualificationLevel: HighestQualificationLevel;
  intendedStart: IntendedStart;
  preferredCategories: string[];
  preferredCountries: string[];
  budget: RecommendationBudget;
}

export interface RecommendationPreferencesGetData {
  preferences: RecommendationPreferences | null;
  allowedCategories: string[];
  allowedCountries: string[];
}

export interface SaveRecommendationPreferencesData {
  preferences: RecommendationPreferences;
  profileHash: string;
  cacheInvalidated: boolean;
}

export interface DiscoverScoreBreakdown {
  field: number;
  country: number;
  budget: number;
  intake: number;
}

export interface DiscoverCourseResult {
  courseId: number;
  matchScore: number;
  scoreBand: ScoreBand;
  scoreBreakdown: DiscoverScoreBreakdown;
  finalRank: number;
  whyMatch: string[];
  isWidened: boolean;
  wideningStep?: number;
  wideningLabel?: string;
  costLabel?: string;
  course: CourseListItem;
}

export interface DiscoverPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface DiscoverRecommendationsData {
  hasPreferences: boolean;
  results: DiscoverCourseResult[];
  pagination: DiscoverPagination;
}
