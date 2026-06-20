import {apiClient, setStoredToken} from './client';
import {saveRecommendationPreferences} from './recommendationApi';
import type {RecommendationPreferencesPayload} from './recommendationTypes';
import type {ApiEnvelope, LoginPayload, SignupPayload, SignupResponse, UserDto} from './types';

const POST_SIGNUP_LOG = '[POST /auth/signup]';
const POST_SIGNUP_PREFS_LOG = '[POST /auth/signup + PUT /recommendations/preferences]';

export async function postSignup(body: SignupPayload) {
  console.log(POST_SIGNUP_LOG, 'request', {
    email: body.email,
    firstName: body.firstName,
    lastName: body.lastName,
    country: body.country,
    countryCode: body.countryCode,
    contact: body.contact,
  });
  try {
    const {data} = await apiClient.post<ApiEnvelope<SignupResponse>>('/auth/signup', body);
    console.log(POST_SIGNUP_LOG, 'response', {
      userId: data.data?.user?.id,
      hasSession: Boolean(data.data?.session?.access_token),
    });
    return data.data;
  } catch (err) {
    console.error(POST_SIGNUP_LOG, 'failed', {email: body.email, err});
    throw err;
  }
}

/**
 * POST /auth/signup, persist the bearer token, then PUT /recommendations/preferences.
 */
export async function postSignupWithPreferences(
  signupBody: SignupPayload,
  preferences: RecommendationPreferencesPayload,
) {
  console.log(POST_SIGNUP_PREFS_LOG, 'request', {
    email: signupBody.email,
    preferredCategories: preferences.preferredCategories,
    preferredCountries: preferences.preferredCountries,
    budget: preferences.budget,
    intendedStart: preferences.intendedStart,
  });
  const {user, session} = await postSignup(signupBody);
  const accessToken = session.access_token;
  await setStoredToken(accessToken);
  await saveRecommendationPreferences(preferences, {accessToken});
  console.log(POST_SIGNUP_PREFS_LOG, 'response', {
    userId: user?.id,
    preferencesSaved: true,
  });
  return {user, session};
}

export async function postLogin(body: LoginPayload) {
  const {data} = await apiClient.post<ApiEnvelope<SignupResponse>>('/auth/login', body);
  return data.data;
}

export async function getAuthMe() {
  const {data} = await apiClient.get<ApiEnvelope<UserDto>>('/auth/me');
  return data.data;
}

export async function postSignOut() {
  await apiClient.post<ApiEnvelope<null>>('/auth/signout');
}

/** POST /auth/forgot-password — sends a password-reset email */
export async function postForgotPassword(email: string) {
  const {data} = await apiClient.post<ApiEnvelope<{message: string}>>(
    '/auth/forgot-password',
    {email},
  );
  return data.data;
}

/** POST /auth/reset-password — resets the password using the token from the email link */
export async function postResetPassword(token: string, password: string) {
  const {data} = await apiClient.post<ApiEnvelope<{message: string}>>(
    '/auth/reset-password',
    {token, password},
  );
  return data.data;
}
