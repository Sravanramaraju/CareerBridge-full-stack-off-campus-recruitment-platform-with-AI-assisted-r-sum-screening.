import { describe, expect, it } from 'vitest';
import { settingsUpdateSchema } from '../src/modules/settings/settings.schemas.js';

describe('settings request schema', () => {
  it('accepts applicant and recruiter notification booleans', () => {
    expect(settingsUpdateSchema.parse({ applicationUpdates: false })).toEqual({
      applicationUpdates: false,
    });
    expect(settingsUpdateSchema.parse({ weeklySummary: true })).toEqual({
      weeklySummary: true,
    });
  });

  it('rejects empty, unknown, and non-boolean settings', () => {
    expect(settingsUpdateSchema.safeParse({}).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ theme: 'dark' }).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ careerResources: 'yes' }).success).toBe(false);
  });
});
