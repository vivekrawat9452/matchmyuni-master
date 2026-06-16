import {create} from 'zustand';
import type {
  HighestQualificationLevel,
  IntendedStart,
  RecommendationBudget,
} from '../api/recommendationTypes';

export type SignupMethod = 'email' | 'phone' | 'google' | 'apple';

export interface OnboardingDraft {
  signupMethod: SignupMethod | null;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  countryName: string;
  countryCode: string;
  contact: string;
  /** Study-interest chip ids from StudyInterests screen */
  studyTags: string[];
  /** API category labels for PUT /recommendations/preferences */
  preferredCategories: string[];
  /** Country ids from LocationSelect (study destinations) */
  countryIds: number[];
  /** Display label from StartTimeline */
  timeline: string | null;
  /** API intendedStart for recommendations */
  intendedStart: IntendedStart | null;
  /** Display label from BudgetSelect */
  budgetTier: string | null;
  /** API budget for recommendations */
  budget: RecommendationBudget | null;
  /** Default qualification when onboarding has no dedicated screen */
  highestQualificationLevel: HighestQualificationLevel;
  setField: <K extends keyof Omit<OnboardingDraft, 'setField' | 'reset'>>(
    k: K,
    v: OnboardingDraft[K],
  ) => void;
  reset: () => void;
}

const initial: Omit<OnboardingDraft, 'setField' | 'reset'> = {
  signupMethod: null,
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  countryName: '',
  countryCode: '+1',
  contact: '',
  studyTags: [],
  preferredCategories: [],
  countryIds: [],
  timeline: null,
  intendedStart: null,
  budgetTier: null,
  budget: null,
  highestQualificationLevel: 'grade_12',
};

export const useOnboardingStore = create<OnboardingDraft>(set => ({
  ...initial,
  setField: (k, v) => set({[k]: v} as Partial<OnboardingDraft>),
  reset: () => set({...initial}),
}));
