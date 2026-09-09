import path from 'node:path';
import { fileTypeFromBuffer } from 'file-type';
import { AppError } from '../../lib/appError.js';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const resumeTypes = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function invalidResume(message, field = 'file') {
  return new AppError({
    code: 'INVALID_RESUME_FILE',
    message: 'The résumé file could not be accepted.',
    status: 422,
    fields: { [field]: message },
  });
}

export async function validateResumeFile(
  file,
  { detectType = fileTypeFromBuffer } = {},
) {
  if (!file?.buffer || file.buffer.length === 0) {
    throw invalidResume('Choose a PDF or DOCX résumé to upload.');
  }
  if (file.size > MAX_RESUME_BYTES || file.buffer.length > MAX_RESUME_BYTES) {
    throw invalidResume('Résumé files must be 5 MB or smaller.');
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  const expectedMime = resumeTypes[extension];
  if (!expectedMime) {
    throw invalidResume('Only PDF and DOCX résumé files are supported.');
  }

  const detected = await detectType(file.buffer);
  if (detected?.mime !== expectedMime) {
    throw invalidResume('The file contents do not match its extension.');
  }
  if (file.mimetype && ![expectedMime, 'application/octet-stream'].includes(file.mimetype)) {
    throw invalidResume('The browser-reported file type does not match the résumé.');
  }

  return { extension, mimeType: expectedMime, size: file.buffer.length };
}
