import { env } from '../../config/env.js';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function passwordResetTemplate({ name, resetToken }) {
  const resetUrl = `${env.CLIENT_ORIGIN}/reset-password?token=${encodeURIComponent(resetToken)}`;
  const safeName = escapeHtml(name || 'there');
  const safeResetUrl = escapeHtml(resetUrl);

  return {
    text: `Hello ${name || 'there'},\n\nUse this link to reset your CareerBridge password:\n${resetUrl}\n\nIf you did not request this, you can ignore this message.`,
    html: `<p>Hello ${safeName},</p><p>Use the link below to reset your CareerBridge password.</p><p><a href="${safeResetUrl}">Reset password</a></p><p>If you did not request this, you can ignore this message.</p>`,
  };
}

const templates = {
  'password-reset': passwordResetTemplate,
};

export function renderEmailTemplate(template, payload) {
  const render = templates[template];
  if (!render) throw new Error(`Unknown email template: ${template}`);
  return render(payload);
}
