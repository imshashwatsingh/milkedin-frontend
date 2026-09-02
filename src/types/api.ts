/**
 * Types mirroring the actual milk_logs_backend API contract.
 *
 * The backend wraps every successful response in:
 *   { success: true, message: string, data: T }
 * Numeric database columns (numeric / money) are serialised by the `pg`
 * driver as strings (e.g. "60.00"), so record field types below reflect
 * that and callers normalise with the helpers in `utils/format`.
 */

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUser;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  password: string;
  otp: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
}

export interface UpdateProfileResponse {
  user: AuthUser;
}

export interface Category {
  id: number;
  name: string;
  /** Per-litre price as returned by the API (always a string from pg). */
  current_price: string;
}

export interface CreateCategoryRequest {
  name: string;
  current_price: number;
}

export interface MilkRecord {
  id: string;
  /** Present on add/update responses (full row) and optional otherwise. */
  category_id?: number;
  /** Present when returned via a JOIN with categories. */
  category_name?: string;
  quantity_liters: string;
  price_per_liter: string;
  total_price: string;
  /** ISO timestamp representing the calendar day stored in the DB. */
  log_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRecordRequest {
  categoryId: number;
  quantity: number;
  /** YYYY-MM-DD local date. */
  record_date: string;
}

export interface RecordsPage {
  records: MilkRecord[];
  total: number;
}

export interface RecordsByDate {
  result: MilkRecord[];
  total: number;
}

export interface DailySummary {
  date: string;
  totalQuantity: number;
  totalAmount: number;
}

export interface MonthlyBreakdownRow {
  log_date: string;
  total_quantity: string;
  total_amount: string;
}

export interface MonthlySummary {
  total_quantity: number;
  total_amount: number;
  daily_breakdown: MonthlyBreakdownRow[];
}

export interface AIChatRequest {
  message: string;
}

export interface AIChatResponse {
  answer: string;
  tools_used?: string[];
}