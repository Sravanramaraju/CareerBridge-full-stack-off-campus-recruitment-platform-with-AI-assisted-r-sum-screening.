import { AppError } from '../../lib/appError.js';
import { verifyPassword } from '../../lib/password.js';
import { findUserForLogin, recordSuccessfulLogin } from './auth.repository.js';
import { toSafeUser } from './safeUser.js';
import { issueSession } from './session.service.js';

const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,p=1,t=2$z2XDLkqQwva+VRTLoWYcmQ$aJFmUKZl2nwL9UZfgdZZXOaxd2Qvkx8929WPEeTjhgQ';

function invalidCredentialsError() {
  return new AppError({
    code: 'INVALID_CREDENTIALS',
    message: 'The email or password is incorrect.',
    status: 401,
  });
}

export async function login(
  { email, password, rememberMe, userAgent },
  {
    findUser = findUserForLogin,
    verify = verifyPassword,
    recordLogin = recordSuccessfulLogin,
    createSession = issueSession,
    now = () => new Date(),
  } = {},
) {
  const user = await findUser(email);
  const passwordMatches = await verify(user?.passwordHash ?? DUMMY_PASSWORD_HASH, password).catch(
    () => false,
  );

  if (!user || !passwordMatches || user.status !== 'ACTIVE') {
    throw invalidCredentialsError();
  }

  const authenticatedUser = await recordLogin(user.id, now());
  const session = await createSession({ userId: user.id, rememberMe, userAgent });

  return { user: toSafeUser(authenticatedUser), ...session };
}
