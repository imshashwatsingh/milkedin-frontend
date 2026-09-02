import { request } from './client';
import type { AIChatResponse } from '@/types';

/** POST /api/ai/chat — natural-language milk assistant (auth required). */
export function sendAIMessage(message: string): Promise<AIChatResponse> {
  return request<AIChatResponse>('/api/ai/chat', {
    method: 'POST',
    body: { message },
  });
}
