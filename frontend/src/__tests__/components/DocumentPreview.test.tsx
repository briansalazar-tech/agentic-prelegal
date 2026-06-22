import { render, screen } from '@testing-library/react';
import { DocumentPreview } from '@/components/DocumentPreview';
import { DocumentType, getDefaultFormData } from '@/types/documents';

describe('DocumentPreview', () => {
  describe('empty state', () => {
    it('shows the prompt text when no document type is set', () => {
      const formData = getDefaultFormData(DocumentType.MUTUAL_NDA);
      render(<DocumentPreview documentType={null} formData={formData} />);
      expect(screen.getByText('Tell me what document you need')).toBeInTheDocument();
    });

    it('shows the preview hint text when no document type is set', () => {
      const formData = getDefaultFormData(DocumentType.MUTUAL_NDA);
      render(<DocumentPreview documentType={null} formData={formData} />);
      expect(screen.getByText('The preview will appear as we gather information')).toBeInTheDocument();
    });
  });

  describe('routing to dedicated preview components', () => {
    it('routes MUTUAL_NDA to NDAPreview (renders the NDA title)', () => {
      const formData = getDefaultFormData(DocumentType.MUTUAL_NDA);
      render(<DocumentPreview documentType={DocumentType.MUTUAL_NDA} formData={formData} />);
      expect(screen.getByText('Mutual Non-Disclosure Agreement')).toBeInTheDocument();
    });

    it('routes PILOT to PilotPreview (renders the Pilot Agreement title)', () => {
      const formData = getDefaultFormData(DocumentType.PILOT);
      render(<DocumentPreview documentType={DocumentType.PILOT} formData={formData} />);
      expect(screen.getByText('Pilot Agreement')).toBeInTheDocument();
    });

    it('routes CLOUD_SERVICE to CloudServicePreview (renders the Cloud Service title)', () => {
      const formData = getDefaultFormData(DocumentType.CLOUD_SERVICE);
      render(<DocumentPreview documentType={DocumentType.CLOUD_SERVICE} formData={formData} />);
      expect(screen.getByText('Cloud Service Agreement')).toBeInTheDocument();
    });
  });

  describe('routing to GenericPreview', () => {
    const genericCases: Array<[DocumentType, string]> = [
      [DocumentType.DESIGN_PARTNER, 'Design Partner Agreement'],
      [DocumentType.SLA, 'Service Level Agreement'],
      [DocumentType.PROFESSIONAL_SERVICES, 'Professional Services Agreement'],
      [DocumentType.PARTNERSHIP, 'Partnership Agreement'],
      [DocumentType.SOFTWARE_LICENSE, 'Software License Agreement'],
      [DocumentType.DPA, 'Data Processing Agreement'],
      [DocumentType.BAA, 'Business Associate Agreement'],
      [DocumentType.AI_ADDENDUM, 'AI Addendum'],
    ];

    test.each(genericCases)(
      'routes %s to GenericPreview (renders "%s" title)',
      (type, expectedTitle) => {
        const formData = getDefaultFormData(type);
        render(<DocumentPreview documentType={type} formData={formData} />);
        expect(screen.getByText(expectedTitle)).toBeInTheDocument();
      }
    );
  });
});
