import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';

function createSmtpTransport() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
      : {}),
  });
}

export function createEmailProvider({ transport = createSmtpTransport(), from = env.SMTP_FROM } = {}) {
  return {
    send({ recipient, subject, text, html }) {
      return transport.sendMail({ from, to: recipient, subject, text, html });
    },
  };
}

export const emailProvider = createEmailProvider();
