import type { MilkRecord } from '@/types';
import { toNumber } from '@/utils/format';

export interface CategoryBreakdown {
  category: string;
  quantity: number;
  cost: number;
  count: number;
}

/**
 * Group raw milk-log records by their category/product name and sum the
 * quantity and total cost for each. Returns the groups sorted by spend
 * (highest first) so the most significant categories surface at the top.
 *
 * Categories are taken from `category_name`; records without one fall back to
 * a plain "Milk" label so the breakdown is always complete.
 */
export function summarizeByCategory(records: MilkRecord[]): CategoryBreakdown[] {
  const map = new Map<string, CategoryBreakdown>();

  for (const record of records) {
    const name = (record.category_name ?? '').trim() || 'Milk';
    const entry =
      map.get(name) ??
      ({ category: name, quantity: 0, cost: 0, count: 0 } as CategoryBreakdown);

    entry.quantity += toNumber(record.quantity_liters);
    entry.cost += toNumber(record.total_price);
    entry.count += 1;

    map.set(name, entry);
  }

  return [...map.values()].sort(
    (a, b) => b.cost - a.cost || b.quantity - a.quantity,
  );
}
