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
});
