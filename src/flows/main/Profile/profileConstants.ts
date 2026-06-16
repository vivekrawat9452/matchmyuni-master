/** Study-preferences options — Figma node 680:11309 */

export const DESTINATION_OPTIONS = [
  'USA', 'Italy', 'France', 'Germany', 'India', 'Albania', 'Malaysia',
  'Finland', 'Canada', 'Poland', 'UK', 'Georgia', 'Hungry', 'Switzerland',
  'Spain', 'Thailand', 'Malta', 'Ireland',
] as const;

export const BUDGET_OPTIONS = [
  'Under $3,000/yr',
  '$3,000-6,000/yr',
  '$6,000-12,000/yr',
  '$12,000-25,000/yr',
  '$25,000+/yr',
] as const;

export const FIELD_OPTIONS = [
  'Law', 'Media', 'Architecture', 'Arts & Design', 'Computer Sci.',
  'Psychology', 'Finance', 'Education', 'Sciences',
] as const;

export const DOCUMENT_TYPES = [
  {key: 'academic_transcripts', label: 'Academic transcripts'},
  {key: 'passport_copy', label: 'Passport copy'},
  {key: 'personal_statement', label: 'Personal statement'},
  {key: 'recommendation_letter', label: 'Recommendation letter'},
  {key: 'english_proficiency', label: 'English proficiency (IELTS)'},
] as const;

export const PROFILE_WEB_URLS = {
  about: 'https://matchmyuni.com/about',
  help: 'https://matchmyuni.com/help',
} as const;
