import {
  DocumentType,
  DOCUMENT_NAMES,
  getDefaultFormData,
  defaultPartyInfo,
} from '@/types/documents';

// ---------------------------------------------------------------------------
// DOCUMENT_NAMES
// ---------------------------------------------------------------------------

describe('DOCUMENT_NAMES', () => {
  it('has a display name for every DocumentType value', () => {
    const allTypes = Object.values(DocumentType);
    allTypes.forEach((type) => {
      expect(DOCUMENT_NAMES[type]).toBeTruthy();
    });
  });

  it('maps all 11 document types', () => {
    expect(Object.keys(DOCUMENT_NAMES)).toHaveLength(11);
  });

  it('returns the correct name for each type', () => {
    expect(DOCUMENT_NAMES[DocumentType.MUTUAL_NDA]).toBe('Mutual NDA');
    expect(DOCUMENT_NAMES[DocumentType.CLOUD_SERVICE]).toBe('Cloud Service Agreement');
    expect(DOCUMENT_NAMES[DocumentType.PILOT]).toBe('Pilot Agreement');
    expect(DOCUMENT_NAMES[DocumentType.DESIGN_PARTNER]).toBe('Design Partner Agreement');
    expect(DOCUMENT_NAMES[DocumentType.SLA]).toBe('Service Level Agreement');
    expect(DOCUMENT_NAMES[DocumentType.PROFESSIONAL_SERVICES]).toBe('Professional Services Agreement');
    expect(DOCUMENT_NAMES[DocumentType.PARTNERSHIP]).toBe('Partnership Agreement');
    expect(DOCUMENT_NAMES[DocumentType.SOFTWARE_LICENSE]).toBe('Software License Agreement');
    expect(DOCUMENT_NAMES[DocumentType.DPA]).toBe('Data Processing Agreement');
    expect(DOCUMENT_NAMES[DocumentType.BAA]).toBe('Business Associate Agreement');
    expect(DOCUMENT_NAMES[DocumentType.AI_ADDENDUM]).toBe('AI Addendum');
  });
});

// ---------------------------------------------------------------------------
// getDefaultFormData — common behaviour
// ---------------------------------------------------------------------------

describe('getDefaultFormData — shared behaviour', () => {
  const allTypes = Object.values(DocumentType);

  it('returns an object with the correct documentType discriminant for every type', () => {
    allTypes.forEach((type) => {
      const data = getDefaultFormData(type);
      expect(data.documentType).toBe(type);
    });
  });

  it('sets effectiveDate to today for every document type', () => {
    const today = new Date().toISOString().split('T')[0];
    allTypes.forEach((type) => {
      const data = getDefaultFormData(type);
      expect(data.effectiveDate).toBe(today);
    });
  });

  it('initialises empty party1 and party2 for every document type', () => {
    allTypes.forEach((type) => {
      const data = getDefaultFormData(type);
      expect(data.party1).toEqual(defaultPartyInfo);
      expect(data.party2).toEqual(defaultPartyInfo);
    });
  });

  it('initialises empty governingLaw and jurisdiction for every document type', () => {
    allTypes.forEach((type) => {
      const data = getDefaultFormData(type);
      expect(data.governingLaw).toBe('');
      expect(data.jurisdiction).toBe('');
    });
  });
});

// ---------------------------------------------------------------------------
// getDefaultFormData — type-specific defaults
// ---------------------------------------------------------------------------

describe('getDefaultFormData — Mutual NDA', () => {
  const data = getDefaultFormData(DocumentType.MUTUAL_NDA);

  it('sets mndaTermType to "expires"', () => {
    expect((data as { mndaTermType: string }).mndaTermType).toBe('expires');
  });

  it('sets mndaTermYears to 1', () => {
    expect((data as { mndaTermYears: number }).mndaTermYears).toBe(1);
  });

  it('sets confidentialityTermType to "years"', () => {
    expect((data as { confidentialityTermType: string }).confidentialityTermType).toBe('years');
  });

  it('sets confidentialityTermYears to 1', () => {
    expect((data as { confidentialityTermYears: number }).confidentialityTermYears).toBe(1);
  });

  it('initialises modifications as empty string', () => {
    expect((data as { modifications: string }).modifications).toBe('');
  });
});

describe('getDefaultFormData — Cloud Service Agreement', () => {
  const data = getDefaultFormData(DocumentType.CLOUD_SERVICE) as { subscriptionPeriod: string };

  it('sets subscriptionPeriod to "1 year"', () => {
    expect(data.subscriptionPeriod).toBe('1 year');
  });
});

describe('getDefaultFormData — Pilot Agreement', () => {
  const data = getDefaultFormData(DocumentType.PILOT) as {
    pilotPeriod: string;
    generalCapAmount: string;
  };

  it('sets pilotPeriod to "90 days"', () => {
    expect(data.pilotPeriod).toBe('90 days');
  });

  it('sets generalCapAmount to "$0"', () => {
    expect(data.generalCapAmount).toBe('$0');
  });
});

describe('getDefaultFormData — Service Level Agreement', () => {
  const data = getDefaultFormData(DocumentType.SLA) as { uptimeTarget: string };

  it('sets uptimeTarget to "99.9%"', () => {
    expect(data.uptimeTarget).toBe('99.9%');
  });
});

describe('getDefaultFormData — string-field types initialise to empty strings', () => {
  const cases: Array<[DocumentType, string[]]> = [
    [DocumentType.DESIGN_PARTNER, ['providerName', 'customerName', 'programName', 'feedbackRequirements', 'accessPeriod']],
    [DocumentType.PROFESSIONAL_SERVICES, ['deliverables', 'projectTimeline', 'fees', 'paymentSchedule', 'ipOwnership']],
    [DocumentType.PARTNERSHIP, ['partnershipScope', 'trademarkRights', 'revenueShare', 'fees']],
    [DocumentType.SOFTWARE_LICENSE, ['licensedSoftware', 'licenseType', 'licenseFees', 'supportTerms']],
    [DocumentType.DPA, ['dataSubjects', 'processingPurpose', 'dataCategories', 'subprocessors']],
    [DocumentType.BAA, ['phiDescription', 'permittedUses', 'safeguards']],
    [DocumentType.AI_ADDENDUM, ['aiFeatures', 'trainingDataRights', 'outputOwnership']],
  ];

  test.each(cases)('%s: all type-specific string fields start as empty strings', (type, fields) => {
    const data = getDefaultFormData(type) as Record<string, unknown>;
    fields.forEach((field) => {
      expect(data[field]).toBe('');
    });
  });
});
