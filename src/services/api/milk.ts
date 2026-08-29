import { request } from './client';
import type {
  CreateRecordRequest,
  DailySummary,
  MilkRecord,
  MonthlySummary,
  RecordsByDate,
  RecordsPage,
} from '@/types';

/** GET /api/logs — all records, newest first, optional date range. */
export function getRecords(startDate?: string, endDate?: string): Promise<RecordsPage> {
  return request<RecordsPage>('/api/logs', {
    method: 'GET',
    query: { startDate, endDate },
  });
}

/** GET /api/logs/date?date=YYYY-MM-DD — records for one day. */
export function getRecordsByDate(date: string): Promise<RecordsByDate> {
  return request<RecordsByDate>('/api/logs/date', {
    method: 'GET',
    query: { date },
  });
}

/** POST /api/logs — add a milk log. */
export function addMilkRecord(payload: CreateRecordRequest): Promise<MilkRecord> {
  return request<MilkRecord>('/api/logs', {
    method: 'POST',
    body: payload,
  });
}

/** PUT /api/logs/:id — update quantity / category / date. */
export function updateMilkRecord(
  id: string,
  payload: Partial<CreateRecordRequest>,
): Promise<MilkRecord> {
  return request<MilkRecord>(`/api/logs/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

/** DELETE /api/logs/:id — delete a milk log. */
export function deleteMilkRecord(id: string): Promise<MilkRecord> {
  return request<MilkRecord>(`/api/logs/${id}`, { method: 'DELETE' });
}

/** GET /api/logs/summary/daily?date=YYYY-MM-DD */
export function getDailySummary(date: string): Promise<DailySummary> {
  return request<DailySummary>('/api/logs/summary/daily', {
    method: 'GET',
    query: { date },
  });
}

/** GET /api/logs/summary/monthly?month=YYYY-MM */
export function getMonthlySummary(month: string): Promise<MonthlySummary> {
  return request<MonthlySummary>('/api/logs/summary/monthly', {
    method: 'GET',
    query: { month },
  });
}