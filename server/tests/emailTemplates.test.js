import { describe, expect, it } from 'vitest';
import { renderEmailTemplate } from '../src/modules/email/email.templates.js';

describe('email templates', () => {
  it('renders an encoded password reset link in text and HTML', () => {
    const rendered = renderEmailTemplate('password-reset', {
      name: 'Ananya',
      resetToken: 'token/with+symbols',
    });

    expect(rendered.text).toContain('/reset-password?token=token%2Fwith%2Bsymbols');
    expect(rendered.html).toContain('/reset-password?token=token%2Fwith%2Bsymbols');
  });

  it('escapes user-controlled values in HTML', () => {
    const rendered = renderEmailTemplate('password-reset', {
      name: '<script>alert(1)</script>',
      resetToken: 'token',
    });

    expect(rendered.html).not.toContain('<script>');
    expect(rendered.html).toContain('&lt;script&gt;');
  });

  it('renders applicant submission confirmations with a tracking link', () => {
    const rendered = renderEmailTemplate('application-submitted', {
      name: 'Ananya',
      jobTitle: 'Graduate Engineer',
      companyName: 'Northstar Labs',
      applicationId: 'application-1',
    });
    expect(rendered.text).toContain('Graduate Engineer at Northstar Labs');
    expect(rendered.html).toContain('/applicant/applications/application-1');
  });

  it('renders recruiter application alerts without trusting applicant HTML', () => {
    const rendered = renderEmailTemplate('application-received', {
      name: 'Recruiter',
      applicantName: '<script>Ananya</script>',
      jobTitle: 'Graduate Engineer',
      applicationId: 'application-1',
    });
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.html).toContain('&lt;script&gt;Ananya&lt;/script&gt;');
    expect(rendered.html).toContain('/recruiter/candidates/application-1');
  });

  it('renders safe application status updates for applicants', () => {
    const rendered = renderEmailTemplate('application-status-changed', {
      name: 'Ananya',
      jobTitle: 'Graduate Engineer',
      status: 'Interview',
      reason: '<script>Scheduled for Friday</script>',
      applicationId: 'application-1',
    });
    expect(rendered.text).toContain('is now Interview');
    expect(rendered.html).not.toContain('<script>');
    expect(rendered.html).toContain('&lt;script&gt;Scheduled for Friday&lt;/script&gt;');
    expect(rendered.html).toContain('/applicant/applications/application-1');
  });
});
