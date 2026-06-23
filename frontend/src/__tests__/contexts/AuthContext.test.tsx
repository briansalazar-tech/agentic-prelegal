/**
 * Tests for AuthContext (PL-7).
 * Verifies that the AuthProvider hydrates user state from the cookie
 * and that signin/signup/signout update state and call the right endpoints.
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

function mockFetchOk(body: unknown) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValueOnce(body),
  } as unknown as Response);
}

function mockFetchFail(body: unknown = {}, status = 401) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: jest.fn().mockResolvedValueOnce(body),
  } as unknown as Response);
}

const mockUser = { id: 1, email: 'alice@example.com' };
const mockAuthResponse = { user: mockUser, message: 'Signed in successfully' };

// ---------------------------------------------------------------------------
// Initial hydration
// ---------------------------------------------------------------------------

describe('AuthProvider hydration', () => {
  it('starts in loading state', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('sets user when /api/auth/me returns ok', async () => {
    mockFetchOk(mockUser);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toEqual(mockUser);
  });

  it('sets user to null when /api/auth/me returns 401', async () => {
    mockFetchFail({}, 401);
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('sets user to null when fetch throws a network error', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network failure'));
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();
  });

  it('calls /api/auth/me with credentials: include', async () => {
    mockFetchOk(mockUser);
    renderHook(() => useAuth(), { wrapper });
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/auth/me', { credentials: 'include' });
    });
  });
});

// ---------------------------------------------------------------------------
// signin
// ---------------------------------------------------------------------------

describe('useAuth signin', () => {
  beforeEach(() => {
    // First call is the /me hydration
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce({}),
      } as unknown as Response);
  });

  it('calls POST /api/auth/signin with credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce(mockAuthResponse),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signin('alice@example.com', 'password123');
    });

    expect(fetch).toHaveBeenCalledWith('/api/auth/signin', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email: 'alice@example.com', password: 'password123' }),
    }));
  });

  it('sets user after successful signin', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce(mockAuthResponse),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signin('alice@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('throws an error with the detail message on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValueOnce({ detail: 'Invalid email or password' }),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => result.current.signin('bad@example.com', 'wrongpass'))
    ).rejects.toThrow('Invalid email or password');
  });

  it('throws a fallback error when detail is missing', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: jest.fn().mockResolvedValueOnce({}),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => result.current.signin('x@x.com', 'password'))
    ).rejects.toThrow('Sign in failed');
  });
});

// ---------------------------------------------------------------------------
// signup
// ---------------------------------------------------------------------------

describe('useAuth signup', () => {
  beforeEach(() => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce({}),
      } as unknown as Response);
  });

  it('calls POST /api/auth/signup with credentials', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce({ user: mockUser, message: 'Account created successfully' }),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signup('alice@example.com', 'password123');
    });

    expect(fetch).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({ email: 'alice@example.com', password: 'password123' }),
    }));
  });

  it('sets user after successful signup', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValueOnce({ user: mockUser, message: 'Account created successfully' }),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.signup('alice@example.com', 'password123');
    });

    expect(result.current.user).toEqual(mockUser);
  });

  it('throws with detail message on failure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: jest.fn().mockResolvedValueOnce({ detail: 'Email already registered' }),
    } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await expect(
      act(async () => result.current.signup('taken@example.com', 'password123'))
    ).rejects.toThrow('Email already registered');
  });
});

// ---------------------------------------------------------------------------
// signout
// ---------------------------------------------------------------------------

describe('useAuth signout', () => {
  it('calls POST /api/auth/signout and clears user', async () => {
    // Hydration returns a user
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Response)
      // signout returns any 200
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ message: 'Signed out' }),
      } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(mockUser));

    await act(async () => {
      await result.current.signout();
    });

    expect(result.current.user).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/auth/signout', expect.objectContaining({
      method: 'POST',
      credentials: 'include',
    }));
  });
});

// ---------------------------------------------------------------------------
// refreshUser
// ---------------------------------------------------------------------------

describe('useAuth refreshUser', () => {
  it('updates user state from the server', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValueOnce({}),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce(mockUser),
      } as unknown as Response);

    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.user).toBeNull();

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user).toEqual(mockUser);
  });
});

// ---------------------------------------------------------------------------
// useAuth outside provider
// ---------------------------------------------------------------------------

describe('useAuth outside AuthProvider', () => {
  it('throws when used outside AuthProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider'
    );
    consoleSpy.mockRestore();
  });
});
