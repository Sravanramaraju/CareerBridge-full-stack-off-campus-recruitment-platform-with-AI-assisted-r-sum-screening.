import multer from 'multer';
import { AppError } from '../../lib/appError.js';
import { MAX_RESUME_BYTES } from './resumeValidation.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1, fields: 4 },
});

export function createResumeUploadMiddleware({ uploadSingle = upload.single('resume') } = {}) {
  return (request, response, next) => {
    uploadSingle(request, response, (error) => {
      if (!error) return next();
      if (error instanceof multer.MulterError) {
        return next(new AppError({
          code: 'INVALID_RESUME_FILE',
          message: 'The résumé file could not be accepted.',
          status: 422,
          fields: {
            file: error.code === 'LIMIT_FILE_SIZE'
              ? 'Résumé files must be 5 MB or smaller.'
              : 'Upload one résumé using the resume field.',
          },
        }));
      }
      return next(error);
    });
  };
}

export const resumeUploadMiddleware = createResumeUploadMiddleware();
