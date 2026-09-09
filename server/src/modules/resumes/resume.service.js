import { notFoundError } from '../../lib/appError.js';
import { localStorageService } from './localStorage.service.js';
import {
  createApplicantResume,
  findOwnedResumeMetadata,
  listApplicantResumes,
  updateOwnedResume,
} from './resume.repository.js';
import { extractStructuredResumeData } from './resumeStructuredExtraction.js';
import { extractResumeText } from './resumeTextExtraction.js';
import { validateResumeFile } from './resumeValidation.js';

export function getApplicantResumes(
  userId,
  { listResumes = listApplicantResumes } = {},
) {
  return listResumes(userId);
}

export async function uploadApplicantResume(
  userId,
  file,
  {
    validateFile = validateResumeFile,
    storage = localStorageService,
    createResume = createApplicantResume,
    updateResume = updateOwnedResume,
    findResume = findOwnedResumeMetadata,
    extractText = extractResumeText,
    extractData = extractStructuredResumeData,
  } = {},
) {
  const validated = await validateFile(file);
  const stored = await storage.save(file.buffer, { extension: validated.extension });
  let resume;

  try {
    resume = await createResume(userId, {
      originalFileName: file.originalname,
      storageProvider: stored.storageProvider.toUpperCase(),
      storageKey: stored.storageKey,
      mimeType: validated.mimeType,
      fileSize: validated.size,
      parseStatus: 'PROCESSING',
    });
  } catch (error) {
    await storage.delete(stored.storageKey);
    throw error;
  }

  try {
    const extractedText = await extractText(file.buffer, validated.mimeType);
    const parsedData = extractData(extractedText);
    await updateResume(resume.id, userId, {
      parseStatus: 'READY',
      extractedText,
      parsedData,
      parseError: null,
    });
  } catch {
    await updateResume(resume.id, userId, {
      parseStatus: 'FAILED',
      parseError: 'Text extraction failed. Upload a different PDF or DOCX file.',
    });
  }

  const result = await findResume(resume.id, userId);
  if (!result) throw notFoundError('The uploaded résumé was not found.');
  return result;
}
