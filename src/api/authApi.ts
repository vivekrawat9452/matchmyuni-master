import {apiClient, setStoredToken} from './client';
import {saveRecommendationPreferences} from './recommendationApi';
import type {RecommendationPreferencesPayload} from './recommendationTypes';
import type {ApiEnvelope, LoginPayload, SignupPayload, SignupResponse, UserDto} from './types';

export async function postSignup(body: SignupPayload) {
  const {data} = await apiClient.post<ApiEnvelope<SignupResponse>>('/auth/signup', body);
  return data.data;
}

/**
 * POST /auth/signup, persist the bearer token, then PUT /recommendations/preferences.
 */
export async function postSignupWithPreferences(
  signupBody: SignupPayload,
  preferences: RecommendationPreferencesPayload,
) {
  const {user, session} = await postSignup(signupBody);
  const accessToken = session.access_token;
  await setStoredToken(accessToken);
  await saveRecommendationPreferences(preferences, {accessToken});
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
