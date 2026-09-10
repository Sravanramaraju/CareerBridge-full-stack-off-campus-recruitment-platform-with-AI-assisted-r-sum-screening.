import { notFoundError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { localStorageService } from './localStorage.service.js';
import { ensureResumeEmbedding } from '../matching/semanticEmbedding.service.js';
import { scheduleSemanticTask } from '../matching/semanticTaskScheduler.js';
import {
  clearOwnedPrimaryResumes,
  createApplicantResume,
  findAccessibleResume,
  findNewestOwnedResume,
  findOwnedResume,
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
    ensureEmbedding = ensureResumeEmbedding,
    scheduleTask = scheduleSemanticTask,
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
    void scheduleTask(
      () => ensureEmbedding({ id: resume.id, parseStatus: 'READY', extractedText }),
      { resumeId: resume.id },
    );
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

function resumeNotFoundError() {
  return notFoundError('The requested résumé was not found.');
}

export async function setPrimaryResume(
  userId,
  resumeId,
  {
    runTransaction = (operation) => prisma.$transaction(operation),
    findResume = findOwnedResume,
    clearPrimary = clearOwnedPrimaryResumes,
    updateResume = updateOwnedResume,
    findMetadata = findOwnedResumeMetadata,
  } = {},
) {
  return runTransaction(async (database) => {
    const resume = await findResume(resumeId, userId, database);
    if (!resume) throw resumeNotFoundError();
    await clearPrimary(userId, database);
    const updated = await updateResume(resumeId, userId, { isPrimary: true }, database);
    if (updated.count !== 1) throw resumeNotFoundError();
    return findMetadata(resumeId, userId, database);
  });
}

export async function deleteApplicantResume(
  userId,
  resumeId,
  {
    now = () => new Date(),
    runTransaction = (operation) => prisma.$transaction(operation),
    findResume = findOwnedResume,
    updateResume = updateOwnedResume,
    findReplacement = findNewestOwnedResume,
  } = {},
) {
  return runTransaction(async (database) => {
    const resume = await findResume(resumeId, userId, database);
    if (!resume) throw resumeNotFoundError();

    const deleted = await updateResume(
      resumeId,
      userId,
      { deletedAt: now(), isPrimary: false },
      database,
    );
    if (deleted.count !== 1) throw resumeNotFoundError();

    if (resume.isPrimary) {
      const replacement = await findReplacement(userId, database);
      if (replacement) {
        await updateResume(replacement.id, userId, { isPrimary: true }, database);
      }
    }
    return { deleted: true };
  });
}

export async function getResumeContent(
  userId,
  role,
  resumeId,
  {
    findResume = findAccessibleResume,
    storage = localStorageService,
  } = {},
) {
  const resume = await findResume(resumeId, userId, role);
  if (!resume) throw resumeNotFoundError();
  if (resume.storageProvider !== 'LOCAL') {
    throw notFoundError('The requested résumé content is unavailable.');
  }

  const buffer = await storage.open(resume.storageKey);
  return {
    buffer,
    fileName: resume.originalFileName,
    mimeType: resume.mimeType,
    fileSize: resume.fileSize,
  };
}
