import { render, screen } from '@testing-library/react';
import { GenericPreview } from '@/components/GenericPreview';
import { DocumentType, getDefaultFormData, SLAData, BAAData, DPAData } from '@/types/documents';

describe('GenericPreview', () => {
  describe('Service Level Agreement', () => {
    const formData = getDefaultFormData(DocumentType.SLA) as SLAData;

    it('renders the document title', () => {
      render(<GenericPreview documentType={DocumentType.SLA} formData={formData} />);
      expect(screen.getByText('Service Level Agreement')).toBeInTheDocument();
    });

    it('renders SLA-specific field labels', () => {
      render(<GenericPreview documentType={DocumentType.SLA} formData={formData} />);
      expect(screen.getByText('Uptime Target')).toBeInTheDocument();
      expect(screen.getByText('Response Time Commitment')).toBeInTheDocument();
      expect(screen.getByText('Service Credits')).toBeInTheDocument();
    });

    it('shows placeholder text when uptime target is not set', () => {
      render(<GenericPreview documentType={DocumentType.SLA} formData={{ ...formData, uptimeTarget: '' }} />);
      expect(screen.getByText('[Uptime Target]')).toBeInTheDocument();
    });

    it('renders a filled uptime target value', () => {
      render(<GenericPreview documentType={DocumentType.SLA} formData={{ ...formData, uptimeTarget: '99.99%' }} />);
      expect(screen.getByText('99.99%')).toBeInTheDocument();
    });

    it('renders Provider / Customer party labels', () => {
      render(<GenericPreview documentType={DocumentType.SLA} formData={formData} />);
      expect(screen.getByText('Provider')).toBeInTheDocument();
      expect(screen.getByText('Customer')).toBeInTheDocument();
    });
  });

  describe('Business Associate Agreement', () => {
    const formData = getDefaultFormData(DocumentType.BAA) as BAAData;

    it('renders the document title', () => {
      render(<GenericPreview documentType={DocumentType.BAA} formData={formData} />);
      expect(screen.getByText('Business Associate Agreement')).toBeInTheDocument();
    });

    it('renders BAA-specific field labels', () => {
      render(<GenericPreview documentType={DocumentType.BAA} formData={formData} />);
      expect(screen.getByText('PHI Description')).toBeInTheDocument();
      expect(screen.getByText('Permitted Uses')).toBeInTheDocument();
      expect(screen.getByText('Security Safeguards')).toBeInTheDocument();
    });

    it('renders Business Associate / Covered Entity party labels', () => {
      render(<GenericPreview documentType={DocumentType.BAA} formData={formData} />);
      expect(screen.getByText('Business Associate')).toBeInTheDocument();
      expect(screen.getByText('Covered Entity')).toBeInTheDocument();
    });

    it('renders filled PHI description', () => {
      render(
        <GenericPreview
          documentType={DocumentType.BAA}
          formData={{ ...formData, phiDescription: 'Patient billing records' }}
        />
      );
      expect(screen.getByText('Patient billing records')).toBeInTheDocument();
    });
  });

  describe('Data Processing Agreement', () => {
    const formData = getDefaultFormData(DocumentType.DPA) as DPAData;

    it('renders the document title', () => {
      render(<GenericPreview documentType={DocumentType.DPA} formData={formData} />);
      expect(screen.getByText('Data Processing Agreement')).toBeInTheDocument();
    });

    it('renders Data Processor / Data Controller party labels', () => {
      render(<GenericPreview documentType={DocumentType.DPA} formData={formData} />);
      expect(screen.getByText('Data Processor')).toBeInTheDocument();
      expect(screen.getByText('Data Controller')).toBeInTheDocument();
    });
  });

  describe('common sections', () => {
    it('renders the Agreement Details section for all generic types', () => {
      const types = [
        DocumentType.DESIGN_PARTNER,
        DocumentType.SLA,
        DocumentType.PROFESSIONAL_SERVICES,
        DocumentType.PARTNERSHIP,
        DocumentType.SOFTWARE_LICENSE,
        DocumentType.DPA,
        DocumentType.BAA,
        DocumentType.AI_ADDENDUM,
      ];

      types.forEach((type) => {
        const { unmount } = render(
          <GenericPreview documentType={type} formData={getDefaultFormData(type)} />
        );
        expect(screen.getByText('Agreement Details')).toBeInTheDocument();
        unmount();
      });
    });

    it('renders Purpose and Effective Date headings', () => {
      const formData = getDefaultFormData(DocumentType.SLA);
      render(<GenericPreview documentType={DocumentType.SLA} formData={formData} />);
      expect(screen.getByText('Purpose')).toBeInTheDocument();
      expect(screen.getByText('Effective Date')).toBeInTheDocument();
    });

    it('renders the CC BY 4.0 licence footer', () => {
      const formData = getDefaultFormData(DocumentType.BAA);
      render(<GenericPreview documentType={DocumentType.BAA} formData={formData} />);
      const link = screen.getByRole('link', { name: 'CC BY 4.0' });
      expect(link).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
    });
  });
});
