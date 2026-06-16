import type {CountryDto} from '../api/types';
import type {
  IntendedStart,
  RecommendationBudget,
  RecommendationPreferencesPayload,
} from '../api/recommendationTypes';
import type {OnboardingDraft} from '../stores/onboardingStore';

/** Study-interest chip id → API category label (must match GET /recommendations/preferences allowedCategories). */
export const STUDY_ID_TO_CATEGORY: Record<string, string> = {
  business: 'Management Studies',
  engineering: 'Engineering & Technology',
  medicine: 'Medicine & Dentistry',
  law: 'Law',
  cs: 'Computer Sciences',
  arts: 'Visual Arts',
  arch: 'Architecture',
  psych: 'Humanities & Social Science',
  finance: 'Management Studies',
  edu: 'Education',
  science: 'Sciences',
  media: 'Media & design',
};

export const TIMELINE_ID_TO_INTENDED_START: Record<string, IntendedStart> = {
  y0: 'this_year',
  y1: 'next_year',
  y23: 'two_three_years',
  exp: 'two_three_years',
};

export const TIMELINE_TITLE_TO_INTENDED_START: Record<string, IntendedStart> = {
  'This year': 'this_year',
  'Next year': 'next_year',
  'In 2–3 years': 'two_three_years',
  'Just exploring': 'two_three_years',
};

export const BUDGET_ID_TO_API: Record<string, RecommendationBudget> = {
  t1: 'under_3k',
  t2: 'three_to_6k',
  t3: 'six_to_12k',
  t4: 'not_sure',
  t5: 'not_sure',
};

export const BUDGET_TITLE_TO_API: Record<string, RecommendationBudget> = {
  'Under $3,000/yr': 'under_3k',
  '$3,000–6,000/yr': 'three_to_6k',
  '$6,000–12,000/yr': 'six_to_12k',
  '$12,000–25,000/yr': 'not_sure',
  '$25,000+/yr': 'not_sure',
};

export function studyIdsToCategories(ids: string[]): string[] {
  const out: string[] = [];
  for (const id of ids) {
    const label = STUDY_ID_TO_CATEGORY[id];
    if (label && !out.includes(label)) {
      out.push(label);
    }
  }
  return out;
}

export function resolvePreferredCountries(
  countryIds: number[],
  countries: CountryDto[],
): string[] {
  const idToName = new Map(countries.map(c => [c.id, c.name] as const));
  return countryIds.map(id => idToName.get(id)).filter((n): n is string => Boolean(n));
}

/**
 * Build PUT /recommendations/preferences body from onboarding draft.
 * Returns null when required fields are missing.
 */
export function buildPreferencesFromOnboarding(
  draft: Pick<
    OnboardingDraft,
    | 'highestQualificationLevel'
    | 'intendedStart'
    | 'budget'
    | 'preferredCategories'
    | 'studyTags'
    | 'countryIds'
    | 'timeline'
    | 'budgetTier'
  >,
  countries: CountryDto[],
): RecommendationPreferencesPayload | null {
  const intendedStart =
    draft.intendedStart ??
    (draft.timeline ? TIMELINE_TITLE_TO_INTENDED_START[draft.timeline] : undefined);

  const budget =
    draft.budget ?? (draft.budgetTier ? BUDGET_TITLE_TO_API[draft.budgetTier] : undefined);

  const preferredCategories =
    draft.preferredCategories.length > 0
      ? draft.preferredCategories
      : studyIdsToCategories(draft.studyTags);

  const preferredCountries = resolvePreferredCountries(draft.countryIds, countries);

  if (
    !intendedStart ||
    !budget ||
    preferredCategories.length === 0 ||
    preferredCountries.length === 0
  ) {
    return null;
  }

  return {
    highestQualificationLevel: draft.highestQualificationLevel,
    intendedStart,
    preferredCategories,
    preferredCountries,
    budget,
  };
}
