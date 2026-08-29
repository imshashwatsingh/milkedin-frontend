/**
 * Persistent storage for the auth session.
 *
 * Uses expo-secure-store on native; on web (SecureStore is unavailable)
 * falls back to localStorage. No secrets are ever placed in source code.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthUser } from '@/types';

const ACCESS_TOKEN_KEY = 'milkedin.accessToken';
const REFRESH_TOKEN_KEY = 'milkedin.refreshToken';
const USER_KEY = 'milkedin.user';

const isWeb = Platform.OS === 'web';

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage full / disabled — ignore, will just re-authenticate
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // ignore: treat as non-persistent session
  }
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // ignore
  }
}

export interface StoredSession {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export async function loadSession(): Promise<StoredSession> {
  const [accessToken, refreshToken, userRaw] = await Promise.all([
    getItem(ACCESS_TOKEN_KEY),
    getItem(REFRESH_TOKEN_KEY),
    getItem(USER_KEY),
  ]);
  let user: AuthUser | null = null;
  if (userRaw) {
    try {
      user = JSON.parse(userRaw) as AuthUser;
    } catch {
      user = null;
    }
  }
  return { user, accessToken, refreshToken };
}

export async function saveSession(user: AuthUser, accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([
    setItem(ACCESS_TOKEN_KEY, accessToken),
    setItem(REFRESH_TOKEN_KEY, refreshToken),
    setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function saveAccessToken(accessToken: string): Promise<void> {
  await setItem(ACCESS_TOKEN_KEY, accessToken);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    removeItem(ACCESS_TOKEN_KEY),
    removeItem(REFRESH_TOKEN_KEY),
    removeItem(USER_KEY),
  ]);
}

export async function loadAccessToken(): Promise<string | null> {
  return getItem(ACCESS_TOKEN_KEY);
}