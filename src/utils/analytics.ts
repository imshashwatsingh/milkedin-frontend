import type { MilkRecord } from '@/types';
import { milkLogDateToKey } from '@/utils/date';
import { toNumber } from '@/utils/format';

export interface DayTotal {
  dateKey: string;
  quantity: number;
  amount: number;
  count: number;
}

export interface CategoryTotal {
  category: string;
  quantity: number;
  amount: number;
  /** Share of total spend, 0..1. */
  share: number;
}

export interface MonthTotal {
  monthKey: string;
  label: string;
  quantity: number;
  amount: number;
}

export interface Analytics {
  totalQuantity: number;
  totalAmount: number;
  entryCount: number;
  activeDays: number;
  avgPerActiveDay: number;
  bestDay?: DayTotal;
  firstDate?: string;
  lastDate?: string;
  byCategory: CategoryTotal[];
  byMonth: MonthTotal[];
  daily: DayTotal[];
  /** Consecutive days with entries ending today (0 if none today). */
  currentStreak: number;
  /** Longest streak of consecutive days with entries. */
  longestStreak: number;
}

function dayKeyBefore(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}`;
}

function dayKeyAfter(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + 1);
  const p2 = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}`;
}

/**
 * Pure function that turns a flat list of milk records into every metric the
 * Insights screen needs. Works for any period (a day, a month, a year).
 */
export function computeAnalytics(records: MilkRecord[]): Analytics {
  const dailyMap = new Map<string, DayTotal>();
  const categoryMap = new Map<string, { quantity: number; amount: number }>();
  const monthMap = new Map<string, MonthTotal>();
  const monthLabels = new Map<string, string>();

  let totalQuantity = 0;
  let totalAmount = 0;
  const dates = new Set<string>();

  for (const record of records) {
    const dateKey = milkLogDateToKey(record.log_date);
    const quantity = toNumber(record.quantity_liters);
    const amount = toNumber(record.total_price);

    totalQuantity += quantity;
    totalAmount += amount;
    dates.add(dateKey);

    const day = dailyMap.get(dateKey) ?? { dateKey, quantity: 0, amount: 0, count: 0 };
    day.quantity += quantity;
    day.amount += amount;
    day.count += 1;
    dailyMap.set(dateKey, day);

    const category = record.category_name ?? 'Milk';
    const cat = categoryMap.get(category) ?? { quantity: 0, amount: 0 };
    cat.quantity += quantity;
    cat.amount += amount;
    categoryMap.set(category, cat);

    const [y, m] = dateKey.split('-');
    const monthKey = `${y}-${m}`;
    const monthTotal = monthMap.get(monthKey) ?? { monthKey, label: '', quantity: 0, amount: 0 };
    monthTotal.quantity += quantity;
    monthTotal.amount += amount;
    monthMap.set(monthKey, monthTotal);
    monthLabels.set(monthKey, `${y}-${m}`);
  }

  // Daily keys are lexicographically sortable as YYYY-MM-DD.
  const daily = [...dailyMap.values()].sort((a, b) => a.dateKey.localeCompare(b.dateKey));

  const byMonth = [...monthMap.values()].sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  byMonth.forEach((m) => {
    const [y, mm] = m.monthKey.split('-').map(Number);
    m.label = new Date(y, mm - 1, 1).toLocaleString('en-IN', { month: 'short', year: 'numeric' });
  });

  const byCategory = [...categoryMap.entries()]
    .map(([category, value]) => ({
      category,
      quantity: value.quantity,
      amount: value.amount,
      share: totalAmount > 0 ? value.amount / totalAmount : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const bestDay = daily.reduce<DayTotal | undefined>(
    (best, day) => (best === undefined || day.quantity > best.quantity ? day : best),
    undefined,
  );

  const activeDays = daily.length;
  const avgPerActiveDay = activeDays > 0 ? totalQuantity / activeDays : 0;

  // Streaks: build sorted unique date set.
  const sortedDates = [...dates].sort();
  let longestStreak = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of sortedDates) {
    if (prev && dayKeyAfter(prev) === key) {
      run += 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prev = key;
  }

  const todayKey = (() => {
    const now = new Date();
    const p2 = (n: number) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${p2(now.getMonth() + 1)}-${p2(now.getDate())}`;
  })();

  let currentStreak = 0;
  let cursor = todayKey;
  while (dates.has(cursor)) {
    currentStreak += 1;
    cursor = dayKeyBefore(cursor);
  }

  return {
    totalQuantity,
    totalAmount,
    entryCount: records.length,
    activeDays,
    avgPerActiveDay,
    bestDay,
    firstDate: sortedDates[0],
    lastDate: sortedDates[sortedDates.length - 1],
    byCategory,
    byMonth,
    daily,
    currentStreak,
    longestStreak,
  };
}
