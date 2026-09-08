export class AppError extends Error {
  constructor({ code, message, status = 500, fields, cause }) {
    super(message, { cause });
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.fields = fields;
  }
}

export function notFoundError(message = 'The requested resource was not found.') {
  return new AppError({ code: 'NOT_FOUND', message, status: 404 });
}
