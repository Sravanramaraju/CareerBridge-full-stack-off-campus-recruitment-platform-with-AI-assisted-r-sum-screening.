import { AppError } from '../../lib/appError.js';
import { prisma } from '../../lib/database.js';
import { hashPassword } from '../../lib/password.js';
import {
  createApplicantAccount,
  createRecruiterAccount,
  findUserIdByEmail,
} from './auth.repository.js';
import { createAvailableCompanySlug } from './companySlug.service.js';
import { toSafeUser } from './safeUser.js';
import { createSessionRecord } from './session.repository.js';
import { issueSession } from './session.service.js';

function emailInUseError() {
  return new AppError({
    code: 'EMAIL_IN_USE',
    message: 'An account already exists for this email address.',
    status: 409,
    fields: { 'body.email': 'Use a different email address or sign in.' },
  });
}

export async function registerApplicant(
  { name, email, password, userAgent },
  {
    hash = hashPassword,
    runTransaction = (operation) => prisma.$transaction(operation),
    findExisting = findUserIdByEmail,
    createAccount = createApplicantAccount,
    createSession = issueSession,
  } = {},
) {
  const passwordHash = await hash(password);

  return runTransaction(async (database) => {
    if (await findExisting(email, database)) throw emailInUseError();

    const account = await createAccount({ name, email, passwordHash }, database);
    const session = await createSession(
      { userId: account.id, rememberMe: false, userAgent },
      { createRecord: (data) => createSessionRecord(data, database) },
    );

    return { user: toSafeUser(account), ...session };
  });
}

export async function registerRecruiter(
  { name, email, password, companyName, userAgent },
  {
    hash = hashPassword,
    runTransaction = (operation) => prisma.$transaction(operation),
    findExisting = findUserIdByEmail,
    resolveCompanySlug = createAvailableCompanySlug,
    createAccount = createRecruiterAccount,
    createSession = issueSession,
  } = {},
) {
  const passwordHash = await hash(password);

  return runTransaction(async (database) => {
    if (await findExisting(email, database)) throw emailInUseError();

    const companySlug = await resolveCompanySlug(companyName, database);
    const account = await createAccount(
      { name, email, passwordHash, companyName, companySlug },
      database,
    );
    const session = await createSession(
      { userId: account.id, rememberMe: false, userAgent },
      { createRecord: (data) => createSessionRecord(data, database) },
    );

    return { user: toSafeUser(account), ...session };
  });
}
