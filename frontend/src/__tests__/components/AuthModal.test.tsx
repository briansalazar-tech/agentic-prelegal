/**
 * Tests for AuthModal component (PL-7).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '@/components/AuthModal';

const mockSignin = jest.fn();
const mockSignup = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    signin: mockSignin,
    signup: mockSignup,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

// Helpers for submitting the form (avoids ambiguity with tab buttons)
function submitForm(container: HTMLElement) {
  const form = container.querySelector('form');
  if (form) fireEvent.submit(form);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('AuthModal rendering', () => {
  it('renders the Sign In heading by default', () => {
    render(<AuthModal onClose={jest.fn()} />);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('renders email and password fields', () => {
    render(<AuthModal onClose={jest.fn()} />);
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
  });

  it('renders at least one Sign In button (tab or submit)', () => {
    render(<AuthModal onClose={jest.fn()} />);
    expect(screen.getAllByRole('button', { name: 'Sign In' }).length).toBeGreaterThan(0);
  });

  it('renders the close (×) button', () => {
    render(<AuthModal onClose={jest.fn()} />);
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  it('renders mode toggle tabs', () => {
    render(<AuthModal onClose={jest.fn()} />);
    // Both tabs exist
    const allSignIn = screen.getAllByRole('button', { name: 'Sign In' });
    const allSignUp = screen.getAllByRole('button', { name: 'Sign Up' });
    expect(allSignIn.length).toBeGreaterThan(0);
    expect(allSignUp.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Mode switching
// ---------------------------------------------------------------------------

describe('AuthModal mode switching', () => {
  it('switches to Sign Up mode when the Sign Up tab is clicked', () => {
    render(<AuthModal onClose={jest.fn()} />);
    // Click the Sign Up tab (first button with that name)
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign Up' })[0]);
    expect(screen.getByRole('heading', { name: 'Create Account' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('At least 8 characters')).toBeInTheDocument();
  });

  it('switches back to Sign In mode from Sign Up', () => {
    render(<AuthModal onClose={jest.fn()} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign Up' })[0]);
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign In' })[0]);
    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
  });

  it('clears the error when switching modes', async () => {
    mockSignin.mockRejectedValueOnce(new Error('Invalid credentials'));
    const { container } = render(<AuthModal onClose={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'wrongpass' },
    });
    submitForm(container);
    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());

    // Switch mode to clear the error
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign Up' })[0]);
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sign In submission
// ---------------------------------------------------------------------------

describe('AuthModal sign in submission', () => {
  it('calls signin with email and password on submit', async () => {
    mockSignin.mockResolvedValueOnce(undefined);
    const { container } = render(<AuthModal onClose={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'password123' },
    });
    submitForm(container);

    await waitFor(() => {
      expect(mockSignin).toHaveBeenCalledWith('alice@example.com', 'password123');
    });
  });

  it('calls onClose after successful sign in', async () => {
    mockSignin.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    const { container } = render(<AuthModal onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'password123' },
    });
    submitForm(container);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });

  it('displays error message on failed sign in', async () => {
    mockSignin.mockRejectedValueOnce(new Error('Invalid email or password'));
    const { container } = render(<AuthModal onClose={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'bad@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'wrongpass' },
    });
    submitForm(container);

    await waitFor(() =>
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument()
    );
  });

  it('shows "Please wait..." while loading', async () => {
    let resolveSignin: () => void;
    mockSignin.mockReturnValueOnce(
      new Promise<void>((resolve) => { resolveSignin = resolve; })
    );
    const { container } = render(<AuthModal onClose={jest.fn()} />);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'alice@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'password123' },
    });
    submitForm(container);

    expect(await screen.findByText('Please wait...')).toBeInTheDocument();
    resolveSignin!();
  });
});

// ---------------------------------------------------------------------------
// Sign Up submission
// ---------------------------------------------------------------------------

describe('AuthModal sign up submission', () => {
  it('calls signup with email and password', async () => {
    mockSignup.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    const { container } = render(<AuthModal onClose={onClose} />);

    // Switch to Sign Up mode
    fireEvent.click(screen.getAllByRole('button', { name: 'Sign Up' })[0]);

    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword' },
    });
    submitForm(container);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith('new@example.com', 'newpassword');
    });
  });

  it('displays error when email is already taken', async () => {
    mockSignup.mockRejectedValueOnce(new Error('Email already registered'));
    const { container } = render(<AuthModal onClose={jest.fn()} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Sign Up' })[0]);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'taken@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'password123' },
    });
    submitForm(container);

    await waitFor(() =>
      expect(screen.getByText('Email already registered')).toBeInTheDocument()
    );
  });

  it('calls onClose after successful sign up', async () => {
    mockSignup.mockResolvedValueOnce(undefined);
    const onClose = jest.fn();
    const { container } = render(<AuthModal onClose={onClose} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Sign Up' })[0]);
    fireEvent.change(screen.getByPlaceholderText('you@example.com'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), {
      target: { value: 'newpassword' },
    });
    submitForm(container);

    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});

// ---------------------------------------------------------------------------
// Closing
// ---------------------------------------------------------------------------

describe('AuthModal closing', () => {
  it('calls onClose when the × button is clicked', () => {
    const onClose = jest.fn();
    render(<AuthModal onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', () => {
    const onClose = jest.fn();
    render(<AuthModal onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
