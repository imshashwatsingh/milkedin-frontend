import { getRecords } from './milk';
import { requestBlob } from './client';
import type { MilkRecord } from '@/types';

export type PeriodType = 'month' | 'year';

export interface Period {
  type: PeriodType;
  /** For month: "YYYY-MM". For year: "YYYY". */
  value: string;
  label: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function lastDayOfMonth(year: number, month: number): string {
  return pad2(new Date(year, month, 0).getDate());
}

/** Resolve a period into inclusive start/end YYYY-MM-DD strings. */
export function periodDateRange(period: Period): { start: string; end: string } {
  if (period.type === 'month') {
    const [y, m] = period.value.split('-').map(Number);
    return {
      start: `${period.value}-01`,
      end: `${period.value}-${lastDayOfMonth(y, m)}`,
    };
  }
  return { start: `${period.value}-01-01`, end: `${period.value}-12-31` };
}

/** Fetch every record that falls inside the period, via the existing range endpoint. */
export async function fetchPeriodRecords(period: Period): Promise<MilkRecord[]> {
  const { start, end } = periodDateRange(period);
  const page = await getRecords(start, end);
  return page.records;
}

export type ExportFormat = 'pdf' | 'excel';

/**
 * Request a ready-made export file from the backend for the given period and
 * return its raw bytes so the caller can save/share it on the device.
 */
export async function downloadExport(
  format: ExportFormat,
  period: Period,
): Promise<{ bytes: Uint8Array; filename: string; mime: string }> {
  const { start, end } = periodDateRange(period);
  const { bytes, filename } = await requestBlob('/api/logs/export', {
    method: 'GET',
    query: { format, startDate: start, endDate: end },
  });

  const mime =
    format === 'excel'
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'application/pdf';

  return {
    bytes,
    filename: filename ?? `milk-logs-${period.value}.${format === 'excel' ? 'xlsx' : 'pdf'}`,
    mime,
  };
}

/** Build a list of recent periods (for a picker), newest first. */
export function recentPeriods(type: PeriodType, count: number, from: Date = new Date()): Period[] {
  const periods: Period[] = [];
  for (let i = 0; i < count; i++) {
    if (type === 'month') {
      const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      periods.push({
        type,
        value,
        label: d.toLocaleString('en-IN', { month: 'long', year: 'numeric' }),
      });
    } else {
      const year = from.getFullYear() - i;
      periods.push({ type, value: String(year), label: String(year) });
    }
  }
  return periods;
}
