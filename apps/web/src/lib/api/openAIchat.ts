import { instance } from './client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string | null;
}

export async function postOpenAIChat(messages: ChatMessage[]) {
  const response = await instance.post<ChatResponse>('/chat', {
    messages,
  });
  return response.data;
}
