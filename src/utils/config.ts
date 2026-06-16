/** Staging API — all client requests use this base URL. */
export const STAGING_API_BASE_URL = 'https://matchmyuni-staging.up.railway.app';

/** REST Countries v5 — onboarding country pickers (not the staging API). */
export const REST_COUNTRIES_BASE_URL = 'https://api.restcountries.com/countries/v5';
export const REST_COUNTRIES_API_KEY = 'rc_live_c1029cceeda3477e8403b4ae2a63ab71';

export const config = {
  apiBaseUrl: STAGING_API_BASE_URL,
  requestTimeoutMs: 25_000,
  restCountriesBaseUrl: REST_COUNTRIES_BASE_URL,
  restCountriesApiKey: REST_COUNTRIES_API_KEY,
} as const;

export function getApiBaseUrl() {
  return config.apiBaseUrl.replace(/\/$/, '');
}
