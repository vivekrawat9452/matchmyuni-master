import {config} from '../utils/config';
import {FALLBACK_COUNTRIES} from '../data/fallbackCountries';
import type {CountryDto} from './types';

type RestCountryObject = {
  names?: {common?: string};
  codes?: {ccn3?: string; alpha_2?: string};
  flag?: {emoji?: string};
  region?: string;
  subregion?: string;
};

type RestCountriesListResponse = {
  data?: {
    objects?: RestCountryObject[];
    meta?: {
      total?: number;
      count?: number;
      limit?: number;
      offset?: number;
      more?: boolean;
    };
    errors?: Array<{message?: string}>;
  };
  errors?: Array<{message?: string}>;
};

const RESPONSE_FIELDS =
  'names.common,codes.ccn3,codes.alpha_2,flag.emoji,region,subregion';

function restCountriesErrorMessage(body: RestCountriesListResponse): string {
  const msg =
    body.errors?.[0]?.message ??
    body.data?.errors?.[0]?.message;
  return msg?.trim() || 'Failed to load countries';
}

function mapToCountryDto(raw: RestCountryObject, fallbackId: number): CountryDto | null {
  const name = raw.names?.common?.trim();
  if (!name) {
    return null;
  }

  const ccn3 = raw.codes?.ccn3;
  const parsedId = ccn3 ? Number.parseInt(ccn3, 10) : fallbackId;
  if (!Number.isFinite(parsedId)) {
    return null;
  }

  return {
    id: parsedId,
    name,
    flag: raw.flag?.emoji,
    location: raw.subregion || raw.region,
  };
}

function buildCountriesUrl(limit: number, offset: number): string {
  const url = new URL(config.restCountriesBaseUrl);
  url.searchParams.set('limit', String(limit));
  url.searchParams.set('offset', String(offset));
  url.searchParams.set('response_fields', RESPONSE_FIELDS);
  url.searchParams.set('api-key', config.restCountriesApiKey);
  return url.toString();
}

async function fetchCountriesPage(
  limit: number,
  offset: number,
): Promise<{
  objects: RestCountryObject[];
  meta?: NonNullable<RestCountriesListResponse['data']>['meta'];
}> {
  const response = await fetch(buildCountriesUrl(limit, offset), {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.restCountriesApiKey}`,
    },
  });

  const body = (await response.json()) as RestCountriesListResponse;

  if (!response.ok) {
    throw new Error(restCountriesErrorMessage(body));
  }

  const objects = body.data?.objects;
  if (!objects) {
    throw new Error(restCountriesErrorMessage(body));
  }

  return {objects, meta: body.data?.meta};
}

/** Fetch all countries from REST Countries v5 (paginated, max 100 per page). */
export async function fetchRestCountries(): Promise<CountryDto[]> {
  const limit = 100;
  let offset = 0;
  const countries: CountryDto[] = [];
  let more = true;

  while (more) {
    const {objects, meta} = await fetchCountriesPage(limit, offset);

    for (const obj of objects) {
      const dto = mapToCountryDto(obj, offset + countries.length + 1);
      if (dto) {
        countries.push(dto);
      }
    }

    const total = meta?.total;
    more =
      meta?.more === true ||
      (meta?.more !== false &&
        typeof total === 'number' &&
        countries.length < total);

    offset += limit;
  }

  if (countries.length === 0) {
    throw new Error('REST Countries API returned no countries');
  }

  return countries;
}

/** REST Countries v5 with bundled fallback when the API is unavailable. */
export async function fetchRestCountriesWithFallback(): Promise<CountryDto[]> {
  try {
    return await fetchRestCountries();
  } catch (error) {
    if (__DEV__) {
      console.warn(
        '[restCountriesApi] REST Countries request failed, using fallback list:',
        error instanceof Error ? error.message : error,
      );
    }
    return FALLBACK_COUNTRIES;
  }
}
