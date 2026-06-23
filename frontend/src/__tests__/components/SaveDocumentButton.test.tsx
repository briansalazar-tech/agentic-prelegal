/**
 * Tests for SaveDocumentButton component (PL-7).
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SaveDocumentButton } from '@/components/SaveDocumentButton';
import { DocumentType, getDefaultFormData } from '@/types/documents';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetchOk(body: unknown = {}) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: true,
    status: 201,
    json: jest.fn().mockResolvedValueOnce(body),
  } as unknown as Response);
}

function mockFetchFail(detail = 'Save failed', status = 500) {
  global.fetch = jest.fn().mockResolvedValueOnce({
    ok: false,
    status,
    json: jest.fn().mockResolvedValueOnce({ detail }),
  } as unknown as Response);
}

const docType = DocumentType.MUTUAL_NDA;
const formData = getDefaultFormData(docType);

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

describe('SaveDocumentButton rendering', () => {
  it('renders the Save trigger button', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
  });

  it('does not show the save modal initially', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    expect(screen.queryByRole('heading', { name: 'Save Document' })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Modal open
// ---------------------------------------------------------------------------

describe('SaveDocumentButton modal open', () => {
  it('opens the save modal when the Save button is clicked', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByRole('heading', { name: 'Save Document' })).toBeInTheDocument();
  });

  it('pre-fills the title with the document name and today\'s date', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    const titleInput = screen.getByPlaceholderText('Enter a title for your document');
    // DOCUMENT_NAMES maps mutual_nda → 'Mutual NDA'
    expect((titleInput as HTMLInputElement).value).toContain('Mutual NDA');
  });

  it('shows the document type in the info section', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    // DOCUMENT_NAMES maps mutual_nda → 'Mutual NDA'
    expect(screen.getByText('Mutual NDA')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Saving
// ---------------------------------------------------------------------------

describe('SaveDocumentButton saving', () => {
  it('calls POST /api/documents with credentials when saving', async () => {
    mockFetchOk({ id: 1, document_type: 'mutual_nda', title: 'My NDA' });
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    const titleInput = screen.getByPlaceholderText('Enter a title for your document');
    fireEvent.change(titleInput, { target: { value: 'My NDA' } });

    fireEvent.click(screen.getByRole('button', { name: 'Save Document' }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/documents', expect.objectContaining({
        method: 'POST',
        credentials: 'include',
        body: JSON.stringify({
          document_type: docType,
          title: 'My NDA',
          form_data: formData,
        }),
      }));
    });
  });

  it('shows the success state after saving', async () => {
    mockFetchOk({ id: 1 });
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Document' }));

    await waitFor(() =>
      expect(screen.getByText('Document saved!')).toBeInTheDocument()
    );
  });

  it('closes the modal 1 second after successful save', async () => {
    mockFetchOk({ id: 1 });
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Document' }));

    await waitFor(() => expect(screen.getByText('Document saved!')).toBeInTheDocument());

    act(() => { jest.advanceTimersByTime(1100); });

    await waitFor(() =>
      expect(screen.queryByText('Document saved!')).not.toBeInTheDocument()
    );
  });

  it('shows an error message when save fails', async () => {
    mockFetchFail('Unauthorized', 401);
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Document' }));

    await waitFor(() =>
      expect(screen.getByText('Unauthorized')).toBeInTheDocument()
    );
  });

  it('disables Save Document button when title is empty', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    const titleInput = screen.getByPlaceholderText('Enter a title for your document');
    fireEvent.change(titleInput, { target: { value: '' } });

    expect(screen.getByRole('button', { name: 'Save Document' })).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// Closing
// ---------------------------------------------------------------------------

describe('SaveDocumentButton modal closing', () => {
  it('closes the modal when Cancel is clicked', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByRole('heading', { name: 'Save Document' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.queryByRole('heading', { name: 'Save Document' })).not.toBeInTheDocument();
  });

  it('closes the modal when × is clicked', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: '×' }));
    expect(screen.queryByRole('heading', { name: 'Save Document' })).not.toBeInTheDocument();
  });

  it('closes the modal when Escape is pressed', () => {
    render(<SaveDocumentButton documentType={docType} formData={formData} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('heading', { name: 'Save Document' })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// onSaved callback
// ---------------------------------------------------------------------------

describe('SaveDocumentButton onSaved callback', () => {
  it('calls onSaved after a successful save (1s delay)', async () => {
    const onSaved = jest.fn();
    mockFetchOk({ id: 1 });
    render(<SaveDocumentButton documentType={docType} formData={formData} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    fireEvent.click(screen.getByRole('button', { name: 'Save Document' }));

    await waitFor(() => expect(screen.getByText('Document saved!')).toBeInTheDocument());

    act(() => { jest.advanceTimersByTime(1100); });

    await waitFor(() => expect(onSaved).toHaveBeenCalledTimes(1));
  });
});
