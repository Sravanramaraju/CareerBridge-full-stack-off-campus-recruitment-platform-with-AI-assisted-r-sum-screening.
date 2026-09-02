import { authService as legacyAuthService } from '@/src/services/mockApi';

export const authService = Object.freeze({
  login(credentials) {
    return legacyAuthService.login(credentials.email, credentials.password);
  },
});
