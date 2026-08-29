import { request } from './client';
import type {
  AuthTokens,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UpdateProfileResponse,
} from '@/types';

export function registerAccount(payload: RegisterRequest): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>('/api/auth/register', {
    method: 'POST',
    body: payload,
  });
}

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', {
    method: 'POST',
    body: payload,
  });
}

export function logout(): Promise<null> {
  return request<null>('/api/auth/logout', { method: 'POST' });
}

export function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  return request<AuthTokens>('/api/auth/refresh-token', {
    method: 'POST',
    body: { refreshToken },
    retryOnUnauthorized: false,
  });
}

export function fetchMe(): Promise<AuthUser> {
  return request<AuthUser>('/api/auth/me', { method: 'GET' });
}

/** Request a password reset email. Always resolves (no error if email unknown). */
export function forgotPassword(payload: ForgotPasswordRequest): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/api/auth/forgot-password', {
    method: 'POST',
    body: payload,
  });
}

/** Reset a password using the OTP from the reset email. */
export function resetPassword(payload: ResetPasswordRequest): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/api/auth/reset-password', {
    method: 'POST',
    body: { email: payload.email, password: payload.password, otp: payload.otp },
    retryOnUnauthorized: false,
  });
}

/** Update the signed-in user's profile. Returns the updated user. */
export function updateProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  return request<UpdateProfileResponse>('/api/auth/profile', {
    method: 'PUT',
    body: payload,
  });
}