/**
 * Client-side validation for the milkedIn forms. Messages are written to be
 * understood by someone with no technical background.
 */

export type FieldErrors = Partial<Record<string, string>>;

const NUMBER_PATTERN = /^\d{1,4}(\.\d{1,2})?$/;

export function validateQuantity(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'Please enter how much milk you bought.';
  if (!NUMBER_PATTERN.test(trimmed)) {
    return 'Enter a number like 2 or 2.5.';
  }
  const value = Number(trimmed);
  if (value <= 0) return 'The quantity must be more than zero.';
  if (value > 100) return 'That seems too high. Check the number and try again.';
  return null;
}

export function validatePrice(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'Please enter the price per litre.';
  if (!NUMBER_PATTERN.test(trimmed)) {
    return 'Enter a price like 60 or 65.50.';
  }
  const value = Number(trimmed);
  if (value <= 0) return 'The price must be more than zero.';
  if (value > 1000) return 'That price seems too high. Check it and try again.';
  return null;
}

export function validateCategoryName(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'Please give this milk a name.';
  if (trimmed.length > 100) return 'The name is too long. Keep it under 100 letters.';
  return null;
}

export function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return 'Please enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return 'That email address does not look right. Please check it.';
  }
  return null;
}

export function validatePassword(raw: string): string | null {
  if (!raw) return 'Please enter your password.';
  if (raw.length < 8) return 'Password must be at least 8 characters long.';
  if (!/[A-Z]/.test(raw) || !/\d/.test(raw)) {
    return 'Password needs at least one capital letter and one number.';
  }
  return null;
}

export function validateName(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length < 3) return 'Name should be at least 3 letters.';
  if (trimmed.length > 50) return 'Name is too long.';
  return null;
}