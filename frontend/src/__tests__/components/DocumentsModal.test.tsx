/**
 * Tests for DocumentsModal component (PL-7).
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DocumentsModal } from '@/components/DocumentsModal';
import { DocumentType } from '@/types/documents';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(body: unknown) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValueOnce(body),
  } as unknown as Response);
}

function mockFetchFail(status = 500) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: jest.fn().mockResolvedValueOnce({ detail: 'Server error' }),
  } as unknown as Response);
}

const mockDoc = {
  id: 1,
  document_type: 'mutual_nda',
  title: 'Acme NDA',
  form_data: { party1: { name: 'Acme' } },
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-02T12:00:00Z',
};

const mockDoc2 = {
  id: 2,
  document_type: 'pilot',
  title: 'Pilot Test',
  form_data: {},
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
};

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = jest.fn().mockReturnValue(true);
});

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

describe('DocumentsModal loading', () => {
  it('shows a loading spinner while fetching', () => {
    global.fetch = jest.fn().mockReturnValue(new Promise(() => {})); // never resolves
    const { container } = render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

describe('DocumentsModal empty state', () => {
  it('shows "No saved documents yet" when list is empty', async () => {
    mockFetchOk({ documents: [] });
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText('No saved documents yet')).toBeInTheDocument()
    );
  });

  it('shows the helper text in empty state', async () => {
    mockFetchOk({ documents: [] });
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() =>
      expect(
        screen.getByText('Create and save your first document to see it here')
      ).toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
// Document list
// ---------------------------------------------------------------------------

describe('DocumentsModal document list', () => {
  it('renders document titles', async () => {
    mockFetchOk({ documents: [mockDoc, mockDoc2] });
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Acme NDA')).toBeInTheDocument());
    expect(screen.getByText('Pilot Test')).toBeInTheDocument();
  });

  it('shows the document type badge', async () => {
    mockFetchOk({ documents: [mockDoc] });
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    // DOCUMENT_NAMES maps mutual_nda → 'Mutual NDA'
    await waitFor(() =>
      expect(screen.getByText('Mutual NDA')).toBeInTheDocument()
    );
  });

  it('renders Open and Delete buttons for each document', async () => {
    mockFetchOk({ documents: [mockDoc] });
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('fetches with credentials: include', async () => {
    mockFetchOk({ documents: [] });
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith('/api/documents', { credentials: 'include' }));
  });
});

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

describe('DocumentsModal error state', () => {
  it('shows an error message when the fetch fails', async () => {
    mockFetchFail(500);
    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() =>
      expect(screen.getByText('Failed to fetch documents')).toBeInTheDocument()
    );
  });
});

// ---------------------------------------------------------------------------
// Load document
// ---------------------------------------------------------------------------

describe('DocumentsModal load document', () => {
  it('calls onLoadDocument with docType and formData when Open is clicked', async () => {
    mockFetchOk({ documents: [mockDoc] });
    const onLoadDocument = jest.fn();
    const onClose = jest.fn();
    render(<DocumentsModal onClose={onClose} onLoadDocument={onLoadDocument} />);

    await waitFor(() => expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));

    expect(onLoadDocument).toHaveBeenCalledWith(
      DocumentType.MUTUAL_NDA,
      mockDoc.form_data
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Delete document
// ---------------------------------------------------------------------------

describe('DocumentsModal delete document', () => {
  it('calls DELETE /api/documents/:id when Delete is confirmed', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ documents: [mockDoc] }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ message: 'Deleted' }),
      } as unknown as Response);

    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/documents/1', expect.objectContaining({
        method: 'DELETE',
        credentials: 'include',
      }));
    });
  });

  it('removes the deleted document from the list', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ documents: [mockDoc] }),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValueOnce({ message: 'Deleted' }),
      } as unknown as Response);

    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('Acme NDA')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() =>
      expect(screen.queryByText('Acme NDA')).not.toBeInTheDocument()
    );
  });

  it('does not delete when confirm is cancelled', async () => {
    window.confirm = jest.fn().mockReturnValue(false);
    mockFetchOk({ documents: [mockDoc] });

    render(<DocumentsModal onClose={jest.fn()} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    // fetch should only have been called once (the initial GET)
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Acme NDA')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Closing
// ---------------------------------------------------------------------------

describe('DocumentsModal closing', () => {
  it('calls onClose when the × button is clicked', async () => {
    mockFetchOk({ documents: [] });
    const onClose = jest.fn();
    render(<DocumentsModal onClose={onClose} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('My Documents')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape is pressed', async () => {
    mockFetchOk({ documents: [] });
    const onClose = jest.fn();
    render(<DocumentsModal onClose={onClose} onLoadDocument={jest.fn()} />);
    await waitFor(() => expect(screen.getByText('My Documents')).toBeInTheDocument());
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
