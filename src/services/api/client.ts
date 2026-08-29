/**
 * Thin HTTP client for the milk_logs_backend API.
 *
 * Responsibilities:
 *  - resolve the API base URL (env var → dev-server host → localhost)
 *  - attach the JWT access token to every request
 *  - transparently refresh an expired access token once and retry
 *  - throw a single `ApiError` type with a user-friendly message
 *
 * The backend returns JSON envelopes on success:
 *   { success: true, message, data }
 * Error responses from Express are NOT JSON (they are HTML), so the client
 * parses status codes and best-effort extracts a server message.
 */

import Constants from 'expo-constants';

import { API_PORT } from '@/constants/api';
import type { ApiEnvelope } from '@/types';

const API_ENV_URL = process.env.EXPO_PUBLIC_API_URL;

export function resolveBaseUrl(): string {
  if (API_ENV_URL) return API_ENV_URL.replace(/\/+$/, '');
  // In development the Expo dev server host usually points at the same
  // machine running the backend, so reach it over the LAN IP.
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(':')[0];
  if (host) return `http://${host}:${API_PORT}`;
  return `http://localhost:${API_PORT}`;
}

export const API_BASE_URL = resolveBaseUrl();

/**
 * Lightweight in-memory cache for JSON GET responses.
 *
 * The backend treats `log_date` as plain calendar days and the data changes
 * only when the user adds/edits/deletes a record, so we can safely cache GETs
 * for a short window. Any mutation (POST/PUT/DELETE) wipes the cache so the
 * next read is always fresh — this lines up with the `useRefreshOnFocus`
 * pattern that refetches after navigating back from add/edit screens.
 */
const apiCache = new Map<string, { data: unknown; expires: number }>();
const DEFAULT_CACHE_TTL_MS = 60_000;

function cacheKeyFor(path: string, options: RequestOptions, token: string | null): string {
  const url = new URL(path, API_BASE_URL);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }
  return `${token ?? 'public'}|${url.toString()}`;
}

/** Empty the GET cache (e.g. on logout or after a bulk change). */
export function clearApiCache(): void {
  apiCache.clear();
}

export type ApiErrorKind = 'network' | 'http' | 'unknown';

export class ApiError extends Error {
  kind: ApiErrorKind;
  status?: number;
  serverMessage?: string;

  constructor(options: { kind: ApiErrorKind; message: string; status?: number; serverMessage?: string }) {
    super(options.message);
    this.name = 'ApiError';
    this.kind = options.kind;
    this.status = options.status;
    this.serverMessage = options.serverMessage;
  }
}

type TokenGetter = () => string | null;
type TokenRefresher = () => Promise<string>;
type UnauthorizedHandler = () => void;

const authState: {
  getAccessToken: TokenGetter | null;
  refreshAccessToken: TokenRefresher | null;
  onUnauthorized: UnauthorizedHandler | null;
} = {
  getAccessToken: null,
  refreshAccessToken: null,
  onUnauthorized: null,
};

/** Called once by the auth provider after it is mounted. */
export function configureAuthClient(options: {
  getAccessToken: TokenGetter;
  refreshAccessToken: TokenRefresher;
  onUnauthorized: UnauthorizedHandler;
}): void {
  authState.getAccessToken = options.getAccessToken;
  authState.refreshAccessToken = options.refreshAccessToken;
  authState.onUnauthorized = options.onUnauthorized;
}

/** Best-effort extraction of the message from an Express error page. */
function extractServerMessage(body: string): string | undefined {
  const match = /Error:\s*(.+?)(?:\s{2,}|&\w+;at\s|\.js:\d|\(file:|\n|$)/i.exec(body);
  let message = match ? match[1] : undefined;
  if (!message) return undefined;
  message = message
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^["']|["']$/g, '')
    .trim();
  // The middleware prefixes quotes around validation messages.
  message = message.replace(/^"|"$/g, '');
  return message || undefined;
}

function friendlyMessageFor(kind: ApiErrorKind, status?: number, serverMessage?: string): string {
  if (kind === 'network') {
    return "Can't reach the server. Check your internet connection, then try again.";
  }
  if (status === 401) {
    return 'Your session has ended. Please sign in again.';
  }
  if (status === 400 && serverMessage) {
    const cleaned = serverMessage.replace(/^"/, '').replace(/"$/, '');
    return cleaned;
  }
  if (status && status >= 500) {
    return 'Something went wrong on our side. Please try again in a moment.';
  }
  if (serverMessage) return serverMessage;
  if (status === 404) return 'That item was not found. It may have been deleted.';
  return 'Something went wrong. Please try again.';
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | undefined>;
  /** Allow one automatic access-token refresh retry (default true). */
  retryOnUnauthorized?: boolean;
  /** Skip the GET cache and force a network fetch (default false). */
  bypassCache?: boolean;
}

interface RealResponse {
  status: number;
  text: string;
}

async function doFetch(path: string, options: RequestOptions, token: string | null): Promise<RealResponse> {
  const url = new URL(path, API_BASE_URL);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url.toString(), {
      method: options.method ?? 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    return { status: response.status, text: await response.text() };
  } catch {
    throw new ApiError({ kind: 'network', message: friendlyMessageFor('network') });
  }
}

async function parseEnvelope<T>(response: RealResponse): Promise<T> {
  let parsedJson: ApiEnvelope<T> | null = null;
  try {
    parsedJson = response.text ? JSON.parse(response.text) : null;
  } catch {
    parsedJson = null;
  }

  if (parsedJson && typeof parsedJson === 'object' && 'data' in parsedJson) {
    return parsedJson.data;
  }

  // Non-JSON (Express default error page) with a correct status code.
  const serverMessage = extractServerMessage(response.text);
  throw new ApiError({
    kind: 'http',
    status: response.status,
    message: friendlyMessageFor('http', response.status, serverMessage),
    serverMessage,
  });
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const retry = options.retryOnUnauthorized ?? true;
  const token = authState.getAccessToken?.() ?? null;
  const method = options.method ?? 'GET';
  const isGet = method === 'GET';

  // Serve a fresh-enough GET from cache without hitting the network.
  if (isGet && !options.bypassCache) {
    const key = cacheKeyFor(path, options, token);
    const hit = apiCache.get(key);
    if (hit && hit.expires > Date.now()) {
      return hit.data as T;
    }
  }

  const first = await doFetch(path, options, token);

  if (first.status === 401 && retry && authState.refreshAccessToken) {
    try {
      const nextToken = await authState.refreshAccessToken();
      if (nextToken) {
        const retried = await doFetch(path, options, nextToken);
        return parseEnvelope<T>(retried);
      }
    } catch {
      // fall through to unauthorized handling
    }
  }

  if (first.status === 401) {
    authState.onUnauthorized?.();
    throw new ApiError({
      kind: 'http',
      status: 401,
      message: friendlyMessageFor('http', 401),
    });
  }

  if (!first.status.toString().startsWith('2')) {
    const serverMessage = extractServerMessage(first.text);
    throw new ApiError({
      kind: 'http',
      status: first.status,
      message: friendlyMessageFor('http', first.status, serverMessage),
      serverMessage,
    });
  }

  const result = parseEnvelope<T>(first);

  // Cache successful GETs; invalidate everything on a mutation.
  if (isGet && !options.bypassCache) {
    apiCache.set(cacheKeyFor(path, options, token), {
      data: result,
      expires: Date.now() + DEFAULT_CACHE_TTL_MS,
    });
  } else if (!isGet) {
    clearApiCache();
  }

  return result;
}

async function doFetchBinary(
  path: string,
  options: RequestOptions,
  token: string | null,
): Promise<{ status: number; buffer: ArrayBuffer; headers: Record<string, string> }> {
  const url = new URL(path, API_BASE_URL);
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(url.toString(), {
      method: options.method ?? 'GET',
      headers,
    });
    const buffer = await response.arrayBuffer();
    const headersObj: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headersObj[key.toLowerCase()] = value;
    });
    return { status: response.status, buffer, headers: headersObj };
  } catch {
    throw new ApiError({ kind: 'network', message: friendlyMessageFor('network') });
  }
}

export interface BlobResult {
  bytes: Uint8Array;
  contentType: string;
  filename: string | null;
}

/** Fetch a binary response (e.g. an exported PDF/XLSX) with auth + refresh. */
export async function requestBlob(path: string, options: RequestOptions = {}): Promise<BlobResult> {
  const retry = options.retryOnUnauthorized ?? true;
  const token = authState.getAccessToken?.() ?? null;

  const first = await doFetchBinary(path, options, token);

  if (first.status === 401 && retry && authState.refreshAccessToken) {
    try {
      const nextToken = await authState.refreshAccessToken();
      if (nextToken) {
        const retried = await doFetchBinary(path, options, nextToken);
        if (retried.status.toString().startsWith('2')) {
          return finalizeBlob(retried);
        }
        if (retried.status === 401) {
          authState.onUnauthorized?.();
          throw new ApiError({ kind: 'http', status: 401, message: friendlyMessageFor('http', 401) });
        }
        throw new ApiError({
          kind: 'http',
          status: retried.status,
          message: friendlyMessageFor('http', retried.status),
        });
      }
    } catch {
      // fall through to unauthorized handling
    }
  }

  if (first.status === 401) {
    authState.onUnauthorized?.();
    throw new ApiError({ kind: 'http', status: 401, message: friendlyMessageFor('http', 401) });
  }

  if (!first.status.toString().startsWith('2')) {
    throw new ApiError({
      kind: 'http',
      status: first.status,
      message: friendlyMessageFor('http', first.status),
    });
  }

  return finalizeBlob(first);
}

function finalizeBlob(result: { buffer: ArrayBuffer; headers: Record<string, string> }): BlobResult {
  const contentType = result.headers['content-type'] ?? '';
  const contentDisposition = result.headers['content-disposition'] ?? null;
  const filename = parseContentDispositionFilename(contentDisposition);
  return { bytes: new Uint8Array(result.buffer), contentType, filename };
}

function parseContentDispositionFilename(header: string | null): string | null {
  if (!header) return null;
  const match = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(header);
  return match ? match[1] : null;
}