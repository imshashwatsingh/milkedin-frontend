/**
 * Formatting helpers for the values the backend returns.
 *
 * The backend serialises `numeric` columns as strings ("60.00"); these
 * helpers normalise them to numbers and format them human-readably.
 */

/** Parse a pg numeric value (string or number) to a JS number. */
export function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Format an amount as Indian Rupees, e.g. ₹60 or ₹60.50 or ₹1,234.50.
 * Uses Indian grouping (lakh style) when available, with a manual fallback.
 */
export function formatRupees(value: string | number | null | undefined): string {
  const amount = toNumber(value);
  let grouped: string;
  try {
    grouped = amount.toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  } catch {
    grouped = String(amount);
  }
  return `₹${grouped}`;
}

/**
 * Format a quantity in litres, e.g. "2 L" or "2.5 L". Trailing zeros are
 * trimmed so "2.00" reads as "2".
 */
export function formatLitres(value: string | number | null | undefined): string {
  const amount = toNumber(value);
  const trimmed = Number(amount.toFixed(2));
  return `${trimmed} L`;
}

/** Plain number without the unit, trailing zeros trimmed (for inputs). */
export function trimNumber(value: string | number): string {
  const amount = toNumber(value);
  const fixed = amount.toFixed(2);
  return fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}