import { AppError } from '../lib/appError.js';

function validationFields(error, source) {
  return Object.fromEntries(
    error.issues.map((issue) => [
      [source, ...issue.path].join('.'),
      issue.message,
    ]),
  );
}

export function validateRequest(schemas) {
  return (request, _response, next) => {
    const validated = {};

    for (const [source, schema] of Object.entries(schemas)) {
      const result = schema.safeParse(request[source]);

      if (!result.success) {
        return next(
          new AppError({
            code: 'VALIDATION_ERROR',
            message: 'The request contains invalid data.',
            status: 422,
            fields: validationFields(result.error, source),
          }),
        );
      }

      validated[source] = result.data;
    }

    request.validated = { ...request.validated, ...validated };
    return next();
  };
}
