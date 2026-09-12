import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { createApp } from '../../src/app.js';
import { disconnectDatabase } from '../../src/lib/database.js';
import { openOutboxPayload } from '../../src/modules/email/outboxCrypto.js';
import {
  closeIntegrationDatabase,
  integrationDatabase,
  resetIntegrationDatabase,
} from './database.js';
import {
  createUser,
  integrationOrigin,
  integrationPassword,
  loginUser,
} from './fixtures.js';

const email = 'recovery@example.com';

describe('password recovery with PostgreSQL', () => {
  beforeEach(async () => {
    await resetIntegrationDatabase();
    await createUser({ id: 'recovery-user', email, name: 'Recovery User' });
  });

  afterAll(async () => {
    await Promise.all([disconnectDatabase(), closeIntegrationDatabase()]);
  });

  it('queues an encrypted reset token, changes the password, and revokes every session', async () => {
    await Promise.all([loginUser(email), loginUser(email)]);
    expect(await integrationDatabase.session.count()).toBe(2);

    await request(createApp())
      .post('/api/v1/auth/forgot-password')
      .set('Origin', integrationOrigin)
      .send({ email })
      .expect(202);

    const message = await integrationDatabase.emailOutbox.findFirstOrThrow({
      where: { template: 'password-reset' },
    });
    expect(message.payload).not.toHaveProperty('resetToken');
    const payload = openOutboxPayload(message.payload);
    expect(payload.resetToken).toMatch(/^[A-Za-z0-9_-]{43}$/);

    const newPassword = 'new-secure-pass-456';
    await request(createApp())
      .post('/api/v1/auth/reset-password')
      .set('Origin', integrationOrigin)
      .send({ token: payload.resetToken, password: newPassword })
      .expect(200);
    expect(await integrationDatabase.session.count()).toBe(0);

    await request(createApp())
      .post('/api/v1/auth/login')
      .set('Origin', integrationOrigin)
      .send({ email, password: integrationPassword, rememberMe: false })
      .expect(401);
    await request(createApp())
      .post('/api/v1/auth/login')
      .set('Origin', integrationOrigin)
      .send({ email, password: newPassword, rememberMe: false })
      .expect(200);
    await request(createApp())
      .post('/api/v1/auth/reset-password')
      .set('Origin', integrationOrigin)
      .send({ token: payload.resetToken, password: 'third-secure-pass-789' })
      .expect(400);
  });

  it('uses a generic response for unknown accounts and rejects expired reset tokens', async () => {
    const unknown = await request(createApp())
      .post('/api/v1/auth/forgot-password')
      .set('Origin', integrationOrigin)
      .send({ email: 'missing@example.com' })
      .expect(202);
    expect(unknown.body.data.message).toMatch(/if an account exists/i);
    expect(await integrationDatabase.emailOutbox.count()).toBe(0);

    await request(createApp())
      .post('/api/v1/auth/forgot-password')
      .set('Origin', integrationOrigin)
      .send({ email })
      .expect(202);
    const message = await integrationDatabase.emailOutbox.findFirstOrThrow();
    const payload = openOutboxPayload(message.payload);
    await integrationDatabase.passwordResetToken.updateMany({
      data: { expiresAt: new Date(Date.now() - 1_000) },
    });
    const expired = await request(createApp())
      .post('/api/v1/auth/reset-password')
      .set('Origin', integrationOrigin)
      .send({ token: payload.resetToken, password: 'new-secure-pass-456' })
      .expect(400);
    expect(expired.body.error.code).toBe('INVALID_RESET_TOKEN');
  });
});
