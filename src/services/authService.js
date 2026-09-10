import { apiClient } from '@/src/services/apiClient';

function toFrontendSession(result) {
  if (!result?.user) return null;
  return {
    ...result.user,
    role: result.user.role.toLowerCase(),
    expiresAt: result.expiresAt,
  };
}

function signupPayload(values, recruiter) {
  const payload = {
    name: values.name,
    email: values.email,
    password: values.password,
    acceptedTerms: values.acceptedTerms,
  };
  if (recruiter) payload.companyName = values.companyName;
  return payload;
}

export const authService = Object.freeze({
  async login(credentials, options) {
    return toFrontendSession(await apiClient.post('/auth/login', credentials, options));
  },
  async getCurrentSession(options) {
    return toFrontendSession(await apiClient.get('/auth/me', options));
  },
  async signupApplicant(values, options) {
    return toFrontendSession(await apiClient.post(
      '/auth/signup/applicant', signupPayload(values, false), options,
    ));
  },
  async signupRecruiter(values, options) {
    return toFrontendSession(await apiClient.post(
      '/auth/signup/recruiter', signupPayload(values, true), options,
    ));
  },
  logout(options) {
    return apiClient.post('/auth/logout', undefined, options);
  },
  forgotPassword(email, options) {
    return apiClient.post('/auth/forgot-password', { email }, options);
  },
  resetPassword(values, options) {
    return apiClient.post('/auth/reset-password', values, options);
  },
});
