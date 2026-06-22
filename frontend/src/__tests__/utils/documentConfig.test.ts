import { getFieldConfig } from '@/utils/documentConfig';
import { DocumentType } from '@/types/documents';

describe('getFieldConfig', () => {
  describe('Design Partner Agreement', () => {
    const config = getFieldConfig(DocumentType.DESIGN_PARTNER);

    it('returns the correct party labels', () => {
      expect(config.party1Label).toBe('Provider');
      expect(config.party2Label).toBe('Design Partner');
    });

    it('includes programName, feedbackRequirements, and accessPeriod fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('programName');
      expect(keys).toContain('feedbackRequirements');
      expect(keys).toContain('accessPeriod');
    });
  });

  describe('Service Level Agreement', () => {
    const config = getFieldConfig(DocumentType.SLA);

    it('returns Provider / Customer party labels', () => {
      expect(config.party1Label).toBe('Provider');
      expect(config.party2Label).toBe('Customer');
    });

    it('includes uptimeTarget, responseTimeCommitment, and serviceCredits fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('uptimeTarget');
      expect(keys).toContain('responseTimeCommitment');
      expect(keys).toContain('serviceCredits');
    });
  });

  describe('Professional Services Agreement', () => {
    const config = getFieldConfig(DocumentType.PROFESSIONAL_SERVICES);

    it('returns Provider / Client party labels', () => {
      expect(config.party1Label).toBe('Provider');
      expect(config.party2Label).toBe('Client');
    });

    it('includes all five professional-services-specific fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('deliverables');
      expect(keys).toContain('projectTimeline');
      expect(keys).toContain('fees');
      expect(keys).toContain('paymentSchedule');
      expect(keys).toContain('ipOwnership');
    });
  });

  describe('Partnership Agreement', () => {
    const config = getFieldConfig(DocumentType.PARTNERSHIP);

    it('returns Partner 1 / Partner 2 party labels', () => {
      expect(config.party1Label).toBe('Partner 1');
      expect(config.party2Label).toBe('Partner 2');
    });

    it('includes partnershipScope, trademarkRights, revenueShare, and fees fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('partnershipScope');
      expect(keys).toContain('trademarkRights');
      expect(keys).toContain('revenueShare');
      expect(keys).toContain('fees');
    });
  });

  describe('Software License Agreement', () => {
    const config = getFieldConfig(DocumentType.SOFTWARE_LICENSE);

    it('returns Licensor / Licensee party labels', () => {
      expect(config.party1Label).toBe('Licensor');
      expect(config.party2Label).toBe('Licensee');
    });

    it('includes licensedSoftware, licenseType, licenseFees, and supportTerms fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('licensedSoftware');
      expect(keys).toContain('licenseType');
      expect(keys).toContain('licenseFees');
      expect(keys).toContain('supportTerms');
    });
  });

  describe('Data Processing Agreement', () => {
    const config = getFieldConfig(DocumentType.DPA);

    it('returns Data Processor / Data Controller party labels', () => {
      expect(config.party1Label).toBe('Data Processor');
      expect(config.party2Label).toBe('Data Controller');
    });

    it('includes dataSubjects, processingPurpose, dataCategories, and subprocessors fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('dataSubjects');
      expect(keys).toContain('processingPurpose');
      expect(keys).toContain('dataCategories');
      expect(keys).toContain('subprocessors');
    });
  });

  describe('Business Associate Agreement', () => {
    const config = getFieldConfig(DocumentType.BAA);

    it('returns Business Associate / Covered Entity party labels', () => {
      expect(config.party1Label).toBe('Business Associate');
      expect(config.party2Label).toBe('Covered Entity');
    });

    it('includes phiDescription, permittedUses, and safeguards fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('phiDescription');
      expect(keys).toContain('permittedUses');
      expect(keys).toContain('safeguards');
    });
  });

  describe('AI Addendum', () => {
    const config = getFieldConfig(DocumentType.AI_ADDENDUM);

    it('returns AI Provider / Customer party labels', () => {
      expect(config.party1Label).toBe('AI Provider');
      expect(config.party2Label).toBe('Customer');
    });

    it('includes aiFeatures, trainingDataRights, and outputOwnership fields', () => {
      const keys = config.fields.map((f) => f.key);
      expect(keys).toContain('aiFeatures');
      expect(keys).toContain('trainingDataRights');
      expect(keys).toContain('outputOwnership');
    });
  });

  describe('default case (non-generic document types)', () => {
    it('returns empty fields and generic party labels for MUTUAL_NDA', () => {
      const config = getFieldConfig(DocumentType.MUTUAL_NDA);
      expect(config.fields).toEqual([]);
      expect(config.party1Label).toBe('Party 1');
      expect(config.party2Label).toBe('Party 2');
    });
  });

  describe('field label format', () => {
    it('every field has a non-empty key and label', () => {
      const genericTypes = [
        DocumentType.DESIGN_PARTNER,
        DocumentType.SLA,
        DocumentType.PROFESSIONAL_SERVICES,
        DocumentType.PARTNERSHIP,
        DocumentType.SOFTWARE_LICENSE,
        DocumentType.DPA,
        DocumentType.BAA,
        DocumentType.AI_ADDENDUM,
      ];

      genericTypes.forEach((type) => {
        const config = getFieldConfig(type);
        expect(config.fields.length).toBeGreaterThan(0);
        config.fields.forEach((field) => {
          expect(field.key).toBeTruthy();
          expect(field.label).toBeTruthy();
        });
      });
    });
  });
});
