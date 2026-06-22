import { DocumentType, DocumentFormData } from './documents';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PartyInfoExtraction {
  name?: string;
  title?: string;
  company?: string;
  noticeAddress?: string;
  date?: string;
}

export interface ChatResponse {
  response: string;
  isComplete: boolean;

  // Document type routing
  documentType?: string;
  suggestedDocument?: string;

  // Common fields
  purpose?: string;
  effectiveDate?: string;
  governingLaw?: string;
  jurisdiction?: string;

  // Mutual NDA
  mndaTermType?: 'expires' | 'continues';
  mndaTermYears?: number;
  confidentialityTermType?: 'years' | 'perpetuity';
  confidentialityTermYears?: number;
  modifications?: string;

  // Cloud Service Agreement
  providerName?: string;
  customerName?: string;
  subscriptionPeriod?: string;
  technicalSupport?: string;
  fees?: string;
  paymentTerms?: string;

  // Pilot Agreement
  pilotPeriod?: string;
  evaluationPurpose?: string;
  generalCapAmount?: string;

  // Design Partner Agreement
  programName?: string;
  feedbackRequirements?: string;
  accessPeriod?: string;

  // Service Level Agreement
  uptimeTarget?: string;
  responseTimeCommitment?: string;
  serviceCredits?: string;

  // Professional Services Agreement
  deliverables?: string;
  projectTimeline?: string;
  paymentSchedule?: string;
  ipOwnership?: string;

  // Partnership Agreement
  partnershipScope?: string;
  trademarkRights?: string;
  revenueShare?: string;

  // Software License Agreement
  licensedSoftware?: string;
  licenseType?: string;
  licenseFees?: string;
  supportTerms?: string;

  // Data Processing Agreement
  dataSubjects?: string;
  processingPurpose?: string;
  dataCategories?: string;
  subprocessors?: string;

  // Business Associate Agreement
  phiDescription?: string;
  permittedUses?: string;
  safeguards?: string;

  // AI Addendum
  aiFeatures?: string;
  trainingDataRights?: string;
  outputOwnership?: string;

  // Party info (all document types)
  party1?: PartyInfoExtraction;
  party2?: PartyInfoExtraction;
}

// All scalar field names that can be extracted from a ChatResponse and written into DocumentFormData.
const EXTRACTABLE_SCALAR_FIELDS: ReadonlyArray<keyof ChatResponse> = [
  'purpose', 'effectiveDate', 'governingLaw', 'jurisdiction',
  'mndaTermType', 'mndaTermYears', 'confidentialityTermType', 'confidentialityTermYears', 'modifications',
  'providerName', 'customerName', 'subscriptionPeriod', 'technicalSupport', 'fees', 'paymentTerms',
  'pilotPeriod', 'evaluationPurpose', 'generalCapAmount',
  'programName', 'feedbackRequirements', 'accessPeriod',
  'uptimeTarget', 'responseTimeCommitment', 'serviceCredits',
  'deliverables', 'projectTimeline', 'paymentSchedule', 'ipOwnership',
  'partnershipScope', 'trademarkRights', 'revenueShare',
  'licensedSoftware', 'licenseType', 'licenseFees', 'supportTerms',
  'dataSubjects', 'processingPurpose', 'dataCategories', 'subprocessors',
  'phiDescription', 'permittedUses', 'safeguards',
  'aiFeatures', 'trainingDataRights', 'outputOwnership',
];

/**
 * Extract document form fields from a chat response.
 * Only fields that were populated by the AI (non-null) are included in the result,
 * so callers can safely merge the result into their existing form data.
 */
export function extractFieldsFromResponse(response: ChatResponse): Partial<DocumentFormData> {
  const fields: Partial<DocumentFormData> = {};

  for (const field of EXTRACTABLE_SCALAR_FIELDS) {
    const value = response[field];
    if (value != null) {
      (fields as Record<string, unknown>)[field as string] = value;
    }
  }

  if (response.party1) {
    fields.party1 = {
      name: response.party1.name ?? '',
      title: response.party1.title ?? '',
      company: response.party1.company ?? '',
      noticeAddress: response.party1.noticeAddress ?? '',
      date: response.party1.date ?? '',
    };
  }

  if (response.party2) {
    fields.party2 = {
      name: response.party2.name ?? '',
      title: response.party2.title ?? '',
      company: response.party2.company ?? '',
      noticeAddress: response.party2.noticeAddress ?? '',
      date: response.party2.date ?? '',
    };
  }

  return fields;
}

/**
 * Map a documentType string from the API (e.g. "mutual_nda") to the DocumentType enum.
 * Returns null if the string doesn't match any known type.
 */
export function parseDocumentType(docTypeStr: string | undefined): DocumentType | null {
  if (!docTypeStr) return null;
  const normalized = docTypeStr.toLowerCase().replace(/-/g, '_');
  return Object.values(DocumentType).find((dt) => dt === normalized) ?? null;
}
