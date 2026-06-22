/**
 * Tests for PL-5 chat type utilities:
 *   extractFieldsFromResponse — maps AI structured output to DocumentFormData
 *   parseDocumentType         — maps the API's string value to the DocumentType enum
 */

import { ChatResponse, extractFieldsFromResponse, parseDocumentType } from '@/types/chat';
import { DocumentType } from '@/types/documents';

// Minimal valid ChatResponse with only the required fields
function makeResponse(overrides: Partial<ChatResponse> = {}): ChatResponse {
  return { response: 'Hello', isComplete: false, ...overrides };
}

// ---------------------------------------------------------------------------
// extractFieldsFromResponse
// ---------------------------------------------------------------------------

describe('extractFieldsFromResponse', () => {
  it('returns an empty object when no document fields are present', () => {
    const result = extractFieldsFromResponse(makeResponse());
    expect(result).toEqual({});
  });

  it('extracts common scalar fields (purpose, effectiveDate, governingLaw, jurisdiction)', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        purpose: 'Evaluate a potential partnership',
        effectiveDate: '2026-01-01',
        governingLaw: 'Delaware',
        jurisdiction: 'New Castle County, Delaware',
      })
    );
    expect(result).toEqual({
      purpose: 'Evaluate a potential partnership',
      effectiveDate: '2026-01-01',
      governingLaw: 'Delaware',
      jurisdiction: 'New Castle County, Delaware',
    });
  });

  it('extracts Mutual NDA specific fields', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        mndaTermType: 'expires',
        mndaTermYears: 2,
        confidentialityTermType: 'years',
        confidentialityTermYears: 3,
        modifications: 'Standard',
      })
    );
    expect(result.mndaTermType).toBe('expires');
    expect(result.mndaTermYears).toBe(2);
    expect(result.confidentialityTermType).toBe('years');
    expect(result.confidentialityTermYears).toBe(3);
    expect(result.modifications).toBe('Standard');
  });

  it('extracts Cloud Service Agreement fields', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        providerName: 'Acme SaaS',
        customerName: 'Widgets Inc',
        subscriptionPeriod: '12 months',
        fees: '$500/month',
        paymentTerms: 'Net 30',
        technicalSupport: '24/7 email',
      })
    );
    expect(result.providerName).toBe('Acme SaaS');
    expect(result.customerName).toBe('Widgets Inc');
    expect(result.subscriptionPeriod).toBe('12 months');
    expect(result.fees).toBe('$500/month');
  });

  it('extracts party1 with empty-string fallbacks for missing sub-fields', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        party1: { name: 'Alice', company: 'Acme Corp' },
      })
    );
    expect(result.party1).toEqual({
      name: 'Alice',
      title: '',
      company: 'Acme Corp',
      noticeAddress: '',
      date: '',
    });
  });

  it('extracts party2 independently of party1', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        party2: { name: 'Bob', title: 'CEO', company: 'Beta LLC', noticeAddress: 'bob@beta.com', date: '2026-01-01' },
      })
    );
    expect(result.party1).toBeUndefined();
    expect(result.party2).toEqual({
      name: 'Bob',
      title: 'CEO',
      company: 'Beta LLC',
      noticeAddress: 'bob@beta.com',
      date: '2026-01-01',
    });
  });

  it('extracts both parties at the same time', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        party1: { company: 'Alpha Inc' },
        party2: { company: 'Beta Inc' },
      })
    );
    expect(result.party1?.company).toBe('Alpha Inc');
    expect(result.party2?.company).toBe('Beta Inc');
  });

  it('omits null and undefined fields — does not include them in the result', () => {
    const result = extractFieldsFromResponse(
      makeResponse({ purpose: 'Test', governingLaw: undefined, fees: null as unknown as string })
    );
    expect('governingLaw' in result).toBe(false);
    expect('fees' in result).toBe(false);
    expect(result.purpose).toBe('Test');
  });

  it('includes numeric fields with value 0 (does not treat 0 as falsy/absent)', () => {
    const result = extractFieldsFromResponse(makeResponse({ mndaTermYears: 0 }));
    expect(result.mndaTermYears).toBe(0);
    expect('mndaTermYears' in result).toBe(true);
  });

  it('does not include response, isComplete, documentType, or suggestedDocument in extracted fields', () => {
    const result = extractFieldsFromResponse(
      makeResponse({
        documentType: 'mutual_nda',
        suggestedDocument: 'mutual_nda',
        isComplete: true,
      })
    );
    expect('response' in result).toBe(false);
    expect('isComplete' in result).toBe(false);
    expect('documentType' in result).toBe(false);
    expect('suggestedDocument' in result).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// parseDocumentType
// ---------------------------------------------------------------------------

describe('parseDocumentType', () => {
  it('returns null for undefined', () => {
    expect(parseDocumentType(undefined)).toBeNull();
  });

  it('returns null for an empty string', () => {
    expect(parseDocumentType('')).toBeNull();
  });

  it('returns null for an unrecognised string', () => {
    expect(parseDocumentType('employment_agreement')).toBeNull();
  });

  it('maps "mutual_nda" to DocumentType.MUTUAL_NDA', () => {
    expect(parseDocumentType('mutual_nda')).toBe(DocumentType.MUTUAL_NDA);
  });

  it('maps "cloud_service" to DocumentType.CLOUD_SERVICE', () => {
    expect(parseDocumentType('cloud_service')).toBe(DocumentType.CLOUD_SERVICE);
  });

  it('maps "pilot" to DocumentType.PILOT', () => {
    expect(parseDocumentType('pilot')).toBe(DocumentType.PILOT);
  });

  it('maps "design_partner" to DocumentType.DESIGN_PARTNER', () => {
    expect(parseDocumentType('design_partner')).toBe(DocumentType.DESIGN_PARTNER);
  });

  it('maps "sla" to DocumentType.SLA', () => {
    expect(parseDocumentType('sla')).toBe(DocumentType.SLA);
  });

  it('maps "professional_services" to DocumentType.PROFESSIONAL_SERVICES', () => {
    expect(parseDocumentType('professional_services')).toBe(DocumentType.PROFESSIONAL_SERVICES);
  });

  it('maps "partnership" to DocumentType.PARTNERSHIP', () => {
    expect(parseDocumentType('partnership')).toBe(DocumentType.PARTNERSHIP);
  });

  it('maps "software_license" to DocumentType.SOFTWARE_LICENSE', () => {
    expect(parseDocumentType('software_license')).toBe(DocumentType.SOFTWARE_LICENSE);
  });

  it('maps "dpa" to DocumentType.DPA', () => {
    expect(parseDocumentType('dpa')).toBe(DocumentType.DPA);
  });

  it('maps "baa" to DocumentType.BAA', () => {
    expect(parseDocumentType('baa')).toBe(DocumentType.BAA);
  });

  it('maps "ai_addendum" to DocumentType.AI_ADDENDUM', () => {
    expect(parseDocumentType('ai_addendum')).toBe(DocumentType.AI_ADDENDUM);
  });

  it('normalises hyphens to underscores before matching', () => {
    expect(parseDocumentType('mutual-nda')).toBe(DocumentType.MUTUAL_NDA);
    expect(parseDocumentType('cloud-service')).toBe(DocumentType.CLOUD_SERVICE);
  });

  it('normalises uppercase to lowercase before matching', () => {
    expect(parseDocumentType('MUTUAL_NDA')).toBe(DocumentType.MUTUAL_NDA);
    expect(parseDocumentType('Pilot')).toBe(DocumentType.PILOT);
  });
});
