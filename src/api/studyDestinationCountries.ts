import type {CountryDto} from '../api/types';
import {getCourseFilters} from './publicApi';

const STUDY_DESTINATION_FLAGS: Record<string, string> = {
  Albania: '🇦🇱',
  Canada: '🇨🇦',
  Finland: '🇫🇮',
  Georgia: '🇬🇪',
  Germany: '🇩🇪',
  Hungary: '🇭🇺',
  India: '🇮🇳',
  Ireland: '🇮🇪',
  Italy: '🇮🇹',
  Malaysia: '🇲🇾',
  Poland: '🇵🇱',
  Spain: '🇪🇸',
  Switzerland: '🇨🇭',
  UAE: '🇦🇪',
  USA: '🇺🇸',
  'United Kingdom': '🇬🇧',
};

/** Matches GET /courses/filters countries — valid for PUT /recommendations/preferences. */
export const FALLBACK_STUDY_DESTINATIONS: CountryDto[] = [
  {id: 1, name: 'Albania', flag: '🇦🇱'},
  {id: 2, name: 'Canada', flag: '🇨🇦'},
  {id: 3, name: 'Finland', flag: '🇫🇮'},
  {id: 4, name: 'Georgia', flag: '🇬🇪'},
  {id: 5, name: 'Germany', flag: '🇩🇪'},
  {id: 6, name: 'Hungary', flag: '🇭🇺'},
  {id: 7, name: 'India', flag: '🇮🇳'},
  {id: 8, name: 'Ireland', flag: '🇮🇪'},
  {id: 9, name: 'Italy', flag: '🇮🇹'},
  {id: 10, name: 'Malaysia', flag: '🇲🇾'},
  {id: 11, name: 'Poland', flag: '🇵🇱'},
  {id: 12, name: 'Spain', flag: '🇪🇸'},
  {id: 13, name: 'Switzerland', flag: '🇨🇭'},
  {id: 14, name: 'UAE', flag: '🇦🇪'},
  {id: 15, name: 'USA', flag: '🇺🇸'},
  {id: 16, name: 'United Kingdom', flag: '🇬🇧'},
];

function filtersToCountryDtos(
  countries: Array<{label: string; value: string | number}>,
): CountryDto[] {
  return countries.map((opt, index) => {
    const name = String(opt.value);
    return {
      id: index + 1,
      name,
      flag: STUDY_DESTINATION_FLAGS[name] ?? '🌍',
    };
  });
}

/**
 * Study-destination countries for onboarding LocationSelect.
 * Names must match allowedCountries on PUT /recommendations/preferences.
 */
export async function getStudyDestinationCountries(): Promise<CountryDto[]> {
  try {
    const filters = await getCourseFilters();
    if (filters.countries.length > 0) {
      return filtersToCountryDtos(filters.countries);
    }
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[studyDestinationCountries] /courses/filters failed, using fallback:',
        error instanceof Error ? error.message : error,
      );
    }
  }
  return FALLBACK_STUDY_DESTINATIONS;
}
