/**
 * Auth provider.
 *
 * Holds the current signed-in user and tokens, restores the session from
 * device storage on launch, exposes signIn / signOut, and wires the API
 * client's token refresh + unauthorized handling.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as authApi from '@/services/api/auth';
import { configureAuthClient } from '@/services/api/client';
import type { AuthUser, LoginRequest, RegisterRequest, UpdateProfileRequest } from '@/types';

import {
  clearSession,
  loadAccessToken,
  loadSession,
  saveAccessToken,
  saveSession,
} from './storage';

interface AuthContextValue {
  user: AuthUser | null;
  /** True only while restoring a persisted session on launch. */
  initializing: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  registerAndSignIn: (payload: RegisterRequest) => Promise<void>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);

  const accessTokenRef = useRef<string | null>(null);
  const refreshTokenRef = useRef<string | null>(null);
  const userRef = useRef<AuthUser | null>(null);

  const restoreSession = useCallback(async () => {
    const session = await loadSession();
    if (session.accessToken && session.user) {
      accessTokenRef.current = session.accessToken;
      refreshTokenRef.current = session.refreshToken;
      userRef.current = session.user;
      setUser(session.user);
    }
    setInitializing(false);
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const persistSession = useCallback(async (nextUser: AuthUser, accessToken: string, refreshToken: string) => {
    accessTokenRef.current = accessToken;
    refreshTokenRef.current = refreshToken;
    userRef.current = nextUser;
    setUser(nextUser);
    await saveSession(nextUser, accessToken, refreshToken);
  }, []);

  const signIn = useCallback(
    async (credentials: LoginRequest) => {
      const response = await authApi.login(credentials);
      await persistSession(response.user, response.accessToken, response.refreshToken);
    },
    [persistSession],
  );

  const registerAndSignIn = useCallback(
    async (payload: RegisterRequest) => {
      await authApi.registerAccount(payload);
      // The backend does not issue tokens on register, so sign in right after.
      await signIn({ email: payload.email, password: payload.password });
    },
    [signIn],
  );

  const updateProfile = useCallback(async (payload: UpdateProfileRequest) => {
    const { user: updatedUser } = await authApi.updateProfile(payload);
    const session = await loadSession();
    if (session.accessToken && session.refreshToken) {
      await saveSession(updatedUser, session.accessToken, session.refreshToken);
    }
    userRef.current = updatedUser;
    setUser(updatedUser);
  }, []);

  const signOut = useCallback(async () => {
    // Best-effort server-side logout; never block the UI on it.
    try {
      await authApi.logout();
    } catch {
      // network issues are fine here
    }
    accessTokenRef.current = null;
    refreshTokenRef.current = null;
    userRef.current = null;
    setUser(null);
    await clearSession();
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<string> => {
    const stored = await loadAccessToken();
    if (refreshTokenRef.current) {
      try {
        const response = await authApi.refreshAccessToken(refreshTokenRef.current);
        accessTokenRef.current = response.accessToken;
        await saveAccessToken(response.accessToken);
        return response.accessToken;
      } catch {
        if (stored === accessTokenRef.current) {
          await clearSession();
          accessTokenRef.current = null;
          refreshTokenRef.current = null;
          userRef.current = null;
          setUser(null);
        }
        throw new Error('refresh_failed');
      }
    }
    throw new Error('refresh_failed');
  }, []);

  // Wire the API client once (idempotent setter).
  useEffect(() => {
    configureAuthClient({
      getAccessToken: () => accessTokenRef.current,
      refreshAccessToken,
      onUnauthorized: () => {
        void signOut().catch(() => undefined);
      },
    });
  }, [refreshAccessToken, signOut]);

  const     value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      signIn,
      registerAndSignIn,
      updateProfile,
      signOut,
    }),
    [user, initializing, signIn, registerAndSignIn, updateProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}