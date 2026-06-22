/**
 * Tests for the fake login session management (PL-4 placeholder auth).
 */

const SESSION_KEY = 'prelegal_session';

function storeSession(name: string): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name }));
}

function getSession(): { name: string } | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { name: string };
  } catch {
    return null;
  }
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

describe('PL-4 fake login session management', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no session is stored', () => {
    expect(getSession()).toBeNull();
  });

  it('stores and retrieves a session with a display name', () => {
    storeSession('Jane Smith');
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.name).toBe('Jane Smith');
  });

  it('returns null after clearing the session', () => {
    storeSession('Jane Smith');
    clearSession();
    expect(getSession()).toBeNull();
  });

  it('overwrites an existing session with a new name', () => {
    storeSession('Jane Smith');
    storeSession('Bob Jones');
    const session = getSession();
    expect(session?.name).toBe('Bob Jones');
  });

  it('returns null when stored value is invalid JSON', () => {
    localStorage.setItem(SESSION_KEY, 'not-valid-json');
    expect(getSession()).toBeNull();
  });
});
