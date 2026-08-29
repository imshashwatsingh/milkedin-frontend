import { request } from './client';
import type { Category, CreateCategoryRequest } from '@/types';

export function listCategories(): Promise<Category[]> {
  return request<Category[]>('/api/categories', { method: 'GET' });
}

export function createCategory(payload: CreateCategoryRequest): Promise<Category> {
  return request<Category>('/api/categories', {
    method: 'POST',
    body: payload,
  });
}

export function updateCategory(id: number, payload: Partial<CreateCategoryRequest>): Promise<Category> {
  return request<Category>(`/api/categories/${id}`, {
    method: 'PUT',
    body: payload,
  });
}

export function deleteCategory(id: number): Promise<{ id: number }> {
  return request<{ id: number }>(`/api/categories/${id}`, { method: 'DELETE' });
}