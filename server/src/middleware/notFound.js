import { notFoundError } from '../lib/appError.js';

export function notFoundHandler(request, _response, next) {
  next(notFoundError(`No route matches ${request.method} ${request.originalUrl}.`));
}
