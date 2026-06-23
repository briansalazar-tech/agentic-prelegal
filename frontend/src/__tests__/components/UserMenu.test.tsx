/**
 * Tests for UserMenu component (PL-7).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserMenu } from '@/components/UserMenu';
import { User } from '@/contexts/AuthContext';

const mockSignout = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ signout: mockSignout }),
}));

const testUser: User = { id: 1, email: 'alice@example.com' };

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('UserMenu rendering', () => {
  it('renders the avatar button with the first letter of the email', () => {
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders the email in the trigger button', () => {
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('does not show the dropdown by default', () => {
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    expect(screen.queryByText('My Documents')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Dropdown toggle
// ---------------------------------------------------------------------------

describe('UserMenu dropdown', () => {
  it('opens the dropdown when the button is clicked', () => {
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    fireEvent.click(screen.getByText('A').closest('button')!);
    expect(screen.getByText('My Documents')).toBeInTheDocument();
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });

  it('shows the email again inside the open dropdown', () => {
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    fireEvent.click(screen.getByText('A').closest('button')!);
    const emailElements = screen.getAllByText('alice@example.com');
    expect(emailElements.length).toBeGreaterThan(1);
  });

  it('closes the dropdown when clicked outside', () => {
    render(
      <div>
        <UserMenu user={testUser} onOpenDocuments={jest.fn()} />
        <div data-testid="outside">outside</div>
      </div>
    );
    fireEvent.click(screen.getByText('A').closest('button')!);
    expect(screen.getByText('My Documents')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByText('My Documents')).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

describe('UserMenu actions', () => {
  it('calls onOpenDocuments when My Documents is clicked', () => {
    const onOpenDocuments = jest.fn();
    render(<UserMenu user={testUser} onOpenDocuments={onOpenDocuments} />);
    fireEvent.click(screen.getByText('A').closest('button')!);
    fireEvent.click(screen.getByText('My Documents'));
    expect(onOpenDocuments).toHaveBeenCalledTimes(1);
  });

  it('closes the dropdown after My Documents is clicked', () => {
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    fireEvent.click(screen.getByText('A').closest('button')!);
    fireEvent.click(screen.getByText('My Documents'));
    expect(screen.queryByText('My Documents')).not.toBeInTheDocument();
  });

  it('calls signout when Sign Out is clicked', async () => {
    mockSignout.mockResolvedValueOnce(undefined);
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    fireEvent.click(screen.getByText('A').closest('button')!);
    fireEvent.click(screen.getByText('Sign Out'));
    await waitFor(() => expect(mockSignout).toHaveBeenCalledTimes(1));
  });

  it('closes the dropdown after signing out', async () => {
    mockSignout.mockResolvedValueOnce(undefined);
    render(<UserMenu user={testUser} onOpenDocuments={jest.fn()} />);
    fireEvent.click(screen.getByText('A').closest('button')!);
    fireEvent.click(screen.getByText('Sign Out'));
    await waitFor(() =>
      expect(screen.queryByText('My Documents')).not.toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
// Different user emails
// ---------------------------------------------------------------------------

describe('UserMenu with different user emails', () => {
  it('renders uppercase first letter for any email', () => {
    const user: User = { id: 2, email: 'zoe@example.com' };
    render(<UserMenu user={user} onOpenDocuments={jest.fn()} />);
    expect(screen.getByText('Z')).toBeInTheDocument();
  });
});
