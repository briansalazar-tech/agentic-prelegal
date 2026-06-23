/**
 * Tests for auth type shapes (PL-7).
 */

import { User, AuthResponse, SavedDocument, DocumentListResponse } from '@/types/auth';

describe('Auth types', () => {
  describe('User', () => {
    it('accepts a valid user object', () => {
      const user: User = { id: 1, email: 'alice@example.com' };
      expect(user.id).toBe(1);
      expect(user.email).toBe('alice@example.com');
    });

    it('id is a number', () => {
      const user: User = { id: 42, email: 'bob@example.com' };
      expect(typeof user.id).toBe('number');
    });

    it('email is a string', () => {
      const user: User = { id: 1, email: 'test@test.com' };
      expect(typeof user.email).toBe('string');
    });
  });

  describe('AuthResponse', () => {
    it('accepts a valid auth response', () => {
      const response: AuthResponse = {
        user: { id: 1, email: 'alice@example.com' },
        message: 'Signed in successfully',
      };
      expect(response.user.id).toBe(1);
      expect(response.message).toBe('Signed in successfully');
    });

    it('embeds a User object', () => {
      const response: AuthResponse = {
        user: { id: 99, email: 'x@x.com' },
        message: 'Account created successfully',
      };
      expect(response.user).toEqual({ id: 99, email: 'x@x.com' });
    });
  });

  describe('SavedDocument', () => {
    const doc: SavedDocument = {
      id: 5,
      document_type: 'mutual_nda',
      title: 'My NDA',
      form_data: { party1: { name: 'Acme' } },
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    };

    it('accepts a valid saved document', () => {
      expect(doc.id).toBe(5);
      expect(doc.title).toBe('My NDA');
    });

    it('has string document_type', () => {
      expect(typeof doc.document_type).toBe('string');
    });

    it('form_data is a Record<string, unknown>', () => {
      expect(typeof doc.form_data).toBe('object');
      expect(doc.form_data).not.toBeNull();
    });

    it('has ISO date strings for created_at and updated_at', () => {
      expect(typeof doc.created_at).toBe('string');
      expect(typeof doc.updated_at).toBe('string');
      expect(new Date(doc.created_at).toString()).not.toBe('Invalid Date');
    });
  });

  describe('DocumentListResponse', () => {
    it('wraps an array of SavedDocuments', () => {
      const response: DocumentListResponse = {
        documents: [
          {
            id: 1,
            document_type: 'mutual_nda',
            title: 'Test',
            form_data: {},
            created_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ],
      };
      expect(response.documents).toHaveLength(1);
      expect(response.documents[0].id).toBe(1);
    });

    it('accepts an empty document list', () => {
      const response: DocumentListResponse = { documents: [] };
      expect(response.documents).toHaveLength(0);
    });
  });
});
