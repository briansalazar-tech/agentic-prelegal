import { ChatMessage, ChatResponse } from '@/types/chat';

const API_BASE = '/api/chat';

/** Fetch the opening greeting from the AI assistant. */
export async function getGreeting(): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/greeting`);
  if (!res.ok) {
    throw new Error(`Failed to fetch greeting: ${res.statusText}`);
  }
  return res.json() as Promise<ChatResponse>;
}

/**
 * Send the full conversation history to the AI and get back a reply
 * that also includes any newly extracted document fields.
 */
export async function sendMessage(messages: ChatMessage[]): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error((body as { detail?: string }).detail ?? 'Failed to send message');
  }

  return res.json() as Promise<ChatResponse>;
}
