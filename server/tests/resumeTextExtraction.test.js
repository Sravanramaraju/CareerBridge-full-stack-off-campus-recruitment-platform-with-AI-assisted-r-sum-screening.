import { describe, expect, it, vi } from 'vitest';
import {
  extractPdfText,
  extractResumeText,
  normalizeExtractedText,
} from '../src/modules/resumes/resumeTextExtraction.js';

describe('resume text extraction', () => {
  it('normalizes whitespace and unsafe null characters', () => {
    expect(normalizeExtractedText('  Profile\0\r\n\r\n\r\n  React   Developer  ')).toBe(
      'Profile\n\nReact Developer',
    );
  });

  it('routes PDF and DOCX bytes to their real extractors', async () => {
    const buffer = Buffer.from('document');
    const readPdf = vi.fn().mockResolvedValue('PDF text');
    const readDocx = vi.fn().mockResolvedValue('DOCX text');

    await expect(extractResumeText(buffer, 'application/pdf', { readPdf, readDocx }))
      .resolves.toBe('PDF text');
    await expect(extractResumeText(
      buffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      { readPdf, readDocx },
    )).resolves.toBe('DOCX text');
    expect(readPdf).toHaveBeenCalledWith(buffer);
    expect(readDocx).toHaveBeenCalledWith(buffer);
  });

  it('always releases PDF parser resources', async () => {
    const destroy = vi.fn().mockResolvedValue(undefined);
    const parser = { getText: vi.fn().mockResolvedValue({ text: 'Résumé' }), destroy };

    await expect(extractPdfText(Buffer.from('pdf'), {
      createParser: () => parser,
    })).resolves.toBe('Résumé');
    expect(destroy).toHaveBeenCalledOnce();
  });

  it('rejects unsupported document types', async () => {
    await expect(extractResumeText(Buffer.from('text'), 'text/plain')).rejects.toThrow(
      'Unsupported résumé MIME type.',
    );
  });
});
