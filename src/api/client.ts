import axios, {type AxiosError} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApiBaseUrl, config} from '../utils/config';

export const TOKEN_KEY = 'mm_access_token';

export async function getStoredToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setStoredToken(token: string | null) {
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
}

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: config.requestTimeoutMs,
  headers: {'Content-Type': 'application/json'},
});

// ── Request interceptor: attach Bearer token ───────────────────────────────
apiClient.interceptors.request.use(async req => {
  const t = await getStoredToken();
  if (t) {
    req.headers.Authorization = `Bearer ${t}`;
  }
  // Let React Native set multipart boundary (default `application/json` breaks uploads).
  if (typeof FormData !== 'undefined' && req.data instanceof FormData) {
    req.headers.set('Content-Type', false);
    req.transformRequest = [data => data];
  }
  return req;
});

// ── Response interceptor: normalise errors ─────────────────────────────────
apiClient.interceptors.response.use(
  res => res,
  (err: AxiosError<{message?: string; status?: string}>) => {
    if (!err.response) {
      // No response — timeout or offline
      err.message =
        err.code === 'ECONNABORTED'
          ? 'Request timed out. Check your connection and try again.'
          : 'Network error. Check your connection and try again.';
    } else if (err.response.status === 401) {
      // Token expired or invalid — clear session and let the app re-route
      void setStoredToken(null);
      err.message = 'Your session has expired. Please sign in again.';
    } else {
      // Use the server's own message when available
      const serverMsg = err.response.data?.message;
      if (typeof serverMsg === 'string' && serverMsg.length) {
        err.message = serverMsg;
      }
    }
    const url = err.config?.url ?? '';
    const isExpectedShortlist404 =
      err.response?.status === 404 && url.includes('/user/shortlist');
    const isExpectedRecommendation404 =
      err.response?.status === 404 && url.includes('/recommendations/');
    if (!isExpectedShortlist404 && !isExpectedRecommendation404) {
      console.log('AXIOS ERROR:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status,
        url,
        baseURL: err.config?.baseURL,
      });
    }
    return Promise.reject(err);
  },
);

function messageFromResponseBody(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return null;
  }
  if ('message' in body && typeof (body as {message?: unknown}).message === 'string') {
    return (body as {message: string}).message;
  }
  if (
    'data' in body &&
    body.data &&
    typeof body.data === 'object' &&
    'message' in body.data &&
    typeof (body.data as {message?: unknown}).message === 'string'
  ) {
    return (body.data as {message: string}).message;
  }
  return null;
}

function parseResponseText(raw: string): unknown {
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * POST multipart/form-data via XMLHttpRequest (most reliable for RN file uploads).
 */
export async function postFormData1<TResponse>(
  path: string,
  form: FormData,
  options?: {timeoutMs?: number},
): Promise<TResponse> {
  const timeoutMs = options?.timeoutMs ?? config.requestTimeoutMs;

  return getStoredToken().then(token => {
    const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;
    console.log('[FINAL URL]', url);
    console.log('🚀 [REQUEST OUTGOING]');
console.log('URL:', url);
console.log('FINAL documentType:', documentType);
console.log('FORM documentType present:', (form as any)._parts?.find((p: any) => p[0] === 'documentType'));
console.log('FORM files present:', (form as any)._parts?.filter((p: any) => p[0] === 'files'));

    return new Promise<TResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.timeout = timeoutMs;
      xhr.setRequestHeader('Accept', 'application/json');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.onload = () => {
        const body = parseResponseText(xhr.responseText ?? '');
        if (xhr.status >= 200 && xhr.status < 300) {
          if (__DEV__) {
            console.log('[postFormData] ok', {path, status: xhr.status});
          }
          resolve(body as TResponse);
          return;
        }
        if (__DEV__) {
          console.log('[postFormData] http error', {path, status: xhr.status, body});
        }
        if (xhr.status === 401) {
          void setStoredToken(null);
          reject(new Error('Your session has expired. Please sign in again.'));
          return;
        }
        const serverMsg = messageFromResponseBody(body);
        reject(new Error(serverMsg?.trim() || `Request failed (${xhr.status})`));
      };

      xhr.onerror = () => {
        if (__DEV__) {
          console.log('[postFormData] xhr.onerror', {
            path,
            status: xhr.status,
            hint: 'Often caused by RN not opening the file URI — on Android use FileProvider content:// from [pickedFile]',
          });
        }
        reject(new Error('Network error. Check your connection and try again.'));
      };

      xhr.ontimeout = () => {
        reject(new Error('Request timed out. Check your connection and try again.'));
      };
      console.log('📡 [XHR DEBUG]');
      console.log('URL:', url);
      console.log('HEADERS:', {
        Accept: 'application/json',
        Authorization: token ? 'Bearer ***' : 'NONE',
      });
      
      console.log('📡 [FORM SENT PARTS]');
      console.log(form);
      console.log((form as any)._parts);
      xhr.send(form);
    });
  });
}
export async function postFormData<TResponse>(
  path: string,
  form: FormData,
  options?: {timeoutMs?: number},
): Promise<TResponse> {
  const timeoutMs = options?.timeoutMs ?? config.requestTimeoutMs;

  return getStoredToken().then(token => {
    const url = `${getApiBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 [postFormData START]');
    console.log('📍 URL:', url);
    console.log('⏱ timeoutMs:', timeoutMs);
    console.log('🔐 token exists:', !!token);

    console.log('📦 FORM RAW _parts BEFORE XHR:');
    console.log(JSON.stringify((form as any)._parts, null, 2));

    return new Promise<TResponse>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', url);
      xhr.timeout = timeoutMs;

      xhr.setRequestHeader('Accept', 'application/json');

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      console.log('📡 XHR READY');
      console.log('📡 HEADERS SET');

      xhr.onload = () => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📩 [XHR RESPONSE RECEIVED]');
        console.log('📩 STATUS:', xhr.status);
        console.log('📩 RAW RESPONSE:', xhr.responseText);

        const body = parseResponseText(xhr.responseText ?? '');

        console.log('📩 PARSED BODY:', body);

        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('✅ SUCCESS PATH');
          resolve(body as TResponse);
          return;
        }

        console.log('❌ ERROR PATH HIT');
        console.log('❌ ERROR BODY:', body);

        if (xhr.status === 401) {
          void setStoredToken(null);
          reject(new Error('Session expired'));
          return;
        }

        const serverMsg = messageFromResponseBody(body);

        console.log('❌ SERVER MESSAGE:', serverMsg);

        reject(
          new Error(serverMsg?.trim() || `Request failed (${xhr.status})`)
        );
      };

      xhr.onerror = () => {
        console.log('🔥 XHR NETWORK ERROR');
        reject(new Error('Network error'));
      };

      xhr.ontimeout = () => {
        console.log('🔥 XHR TIMEOUT');
        reject(new Error('Timeout'));
      };

      console.log('🚀 SENDING FORM NOW');
      xhr.send(form);
    });
  });
}
/**
 * Extract a user-visible error string from an Axios/fetch error.
 * The axios interceptor sets err.message for network/timeout/server cases.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message.trim().length) {
    return err.message;
  }
  const ax = err as AxiosError;
  if (ax.message && ax.message.trim().length) {
    return ax.message;
  }
  return fallback;
}
