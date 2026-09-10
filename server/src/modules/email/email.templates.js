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

function applicationSubmittedTemplate({ name, jobTitle, companyName, applicationId }) {
  const applicationUrl = `${env.CLIENT_ORIGIN}/applicant/applications/${encodeURIComponent(applicationId)}`;
  const safeName = escapeHtml(name || 'there');
  const safeJobTitle = escapeHtml(jobTitle);
  const safeCompanyName = escapeHtml(companyName);
  const safeApplicationUrl = escapeHtml(applicationUrl);
  return {
    text: `Hello ${name || 'there'},\n\nYour application for ${jobTitle} at ${companyName} was submitted successfully.\nTrack it here: ${applicationUrl}`,
    html: `<p>Hello ${safeName},</p><p>Your application for <strong>${safeJobTitle}</strong> at ${safeCompanyName} was submitted successfully.</p><p><a href="${safeApplicationUrl}">Track application</a></p>`,
  };
}

function applicationReceivedTemplate({ name, applicantName, jobTitle, applicationId }) {
  const applicationUrl = `${env.CLIENT_ORIGIN}/recruiter/candidates/${encodeURIComponent(applicationId)}`;
  const safeName = escapeHtml(name || 'there');
  const safeApplicantName = escapeHtml(applicantName);
  const safeJobTitle = escapeHtml(jobTitle);
  const safeApplicationUrl = escapeHtml(applicationUrl);
  return {
    text: `Hello ${name || 'there'},\n\n${applicantName} applied for ${jobTitle}.\nReview the application: ${applicationUrl}`,
    html: `<p>Hello ${safeName},</p><p><strong>${safeApplicantName}</strong> applied for ${safeJobTitle}.</p><p><a href="${safeApplicationUrl}">Review application</a></p>`,
  };
}

const templates = {
  'password-reset': passwordResetTemplate,
  'application-submitted': applicationSubmittedTemplate,
  'application-received': applicationReceivedTemplate,
};

export function renderEmailTemplate(template, payload) {
  const render = templates[template];
  if (!render) throw new Error(`Unknown email template: ${template}`);
  return render(payload);
}
