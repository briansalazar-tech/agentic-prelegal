/**
 * Tests for the chatApi service (PL-5).
 * fetch is mocked so no real network calls are made.
 */

import { getGreeting, sendMessage } from '@/services/chatApi';
import { ChatResponse } from '@/types/chat';

const mockGreeting: ChatResponse = {
  response: 'Hello! What document do you need?',
  isComplete: false,
};

const mockReply: ChatResponse = {
  response: 'Great, let me help you with that NDA.',
  isComplete: false,
  documentType: 'mutual_nda',
  purpose: 'Evaluating a partnership',
};

function mockFetchSuccess(body: unknown, status = 200) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    json: jest.fn().mockResolvedValueOnce(body),
  } as unknown as Response);
}

function mockFetchError(statusText: string, status = 500, body?: unknown) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    statusText,
    json: jest.fn().mockResolvedValueOnce(body ?? { detail: statusText }),
  } as unknown as Response);
}

// ---------------------------------------------------------------------------
// getGreeting
// ---------------------------------------------------------------------------

describe('getGreeting', () => {
  it('returns the greeting ChatResponse on success', async () => {
    mockFetchSuccess(mockGreeting);
    const result = await getGreeting();
    expect(result).toEqual(mockGreeting);
    expect(fetch).toHaveBeenCalledWith('/api/chat/greeting');
  });

  it('throws an error when the server returns a non-OK status', async () => {
    mockFetchError('Service Unavailable', 503);
    await expect(getGreeting()).rejects.toThrow('Failed to fetch greeting: Service Unavailable');
  });
});

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------

describe('sendMessage', () => {
  const history = [
    { role: 'user' as const, content: 'I need an NDA' },
  ];

  it('sends POST with the message history and returns the AI reply', async () => {
    mockFetchSuccess(mockReply);
    const result = await sendMessage(history);

    expect(result).toEqual(mockReply);
    expect(fetch).toHaveBeenCalledWith('/api/chat/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }),
    });
  });

  it('throws with the detail field from the error body when available', async () => {
    mockFetchError('Internal Server Error', 500, { detail: 'AI service unavailable' });
    await expect(sendMessage(history)).rejects.toThrow('AI service unavailable');
  });

  it('uses statusText when the error body is not valid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockRejectedValueOnce(new Error('not JSON')),
    } as unknown as Response);
    // json() rejects, so the catch clause falls back to { detail: statusText }
    await expect(sendMessage(history)).rejects.toThrow('Internal Server Error');
  });

  it('throws "Failed to send message" when the error body has no detail field', async () => {
    mockFetchError('Unprocessable', 422, {});
    await expect(sendMessage(history)).rejects.toThrow('Failed to send message');
  });

  it('propagates network errors (fetch itself throws)', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network failure'));
    await expect(sendMessage(history)).rejects.toThrow('Network failure');
  });
});
