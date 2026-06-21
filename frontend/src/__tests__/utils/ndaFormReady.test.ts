import { isNdaReadyForDownload } from '@/utils/nda';
import { defaultFormData, NDAFormData } from '@/types/nda';

const fullFormData: NDAFormData = {
  ...defaultFormData,
  governingLaw: 'Delaware',
  jurisdiction: 'New Castle County, Delaware',
  party1: { company: 'Acme Inc', name: 'John Smith', title: 'CEO', noticeAddress: 'legal@acme.com', date: '2024-01-01' },
  party2: { company: 'Tech Corp', name: 'Jane Doe', title: 'CTO', noticeAddress: 'legal@tech.com', date: '2024-01-01' },
};

describe('isNdaReadyForDownload', () => {
  it('returns true when all required fields are filled', () => {
    expect(isNdaReadyForDownload(fullFormData)).toBe(true);
  });

  it('returns false when party1 company is missing', () => {
    const data = { ...fullFormData, party1: { ...fullFormData.party1, company: '' } };
    expect(isNdaReadyForDownload(data)).toBe(false);
  });

  it('returns false when party1 name is missing', () => {
    const data = { ...fullFormData, party1: { ...fullFormData.party1, name: '' } };
    expect(isNdaReadyForDownload(data)).toBe(false);
  });

  it('returns false when party2 company is missing', () => {
    const data = { ...fullFormData, party2: { ...fullFormData.party2, company: '' } };
    expect(isNdaReadyForDownload(data)).toBe(false);
  });

  it('returns false when party2 name is missing', () => {
    const data = { ...fullFormData, party2: { ...fullFormData.party2, name: '' } };
    expect(isNdaReadyForDownload(data)).toBe(false);
  });

  it('returns false when governingLaw is missing', () => {
    const data = { ...fullFormData, governingLaw: '' };
    expect(isNdaReadyForDownload(data)).toBe(false);
  });

  it('returns false when jurisdiction is missing', () => {
    const data = { ...fullFormData, jurisdiction: '' };
    expect(isNdaReadyForDownload(data)).toBe(false);
  });

  it('returns false when defaultFormData is used (no parties filled)', () => {
    expect(isNdaReadyForDownload(defaultFormData)).toBe(false);
  });
});
