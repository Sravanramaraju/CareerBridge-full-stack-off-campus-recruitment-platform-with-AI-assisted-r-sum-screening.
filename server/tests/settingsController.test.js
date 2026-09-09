import { describe, expect, it, vi } from 'vitest';
import {
  createGetSettingsHandler,
  createUpdateSettingsHandler,
} from '../src/modules/settings/settings.controller.js';

describe('settings controller', () => {
  it('loads settings for the authenticated identity and role', async () => {
    const settings = { applicationUpdates: true };
    const readSettings = vi.fn().mockResolvedValue(settings);
    const response = { json: vi.fn() };

    await createGetSettingsHandler({ readSettings })(
      { auth: { user: { id: 'applicant-1', role: 'APPLICANT' } } },
      response,
      vi.fn(),
    );

    expect(readSettings).toHaveBeenCalledWith('applicant-1', 'APPLICANT');
    expect(response.json).toHaveBeenCalledWith({ data: settings });
  });

  it('saves validated settings for the authenticated role', async () => {
    const body = { weeklySummary: true };
    const saveSettings = vi.fn().mockResolvedValue(body);

    await createUpdateSettingsHandler({ saveSettings })(
      {
        auth: { user: { id: 'recruiter-1', role: 'RECRUITER' } },
        validated: { body },
      },
      { json: vi.fn() },
      vi.fn(),
    );

    expect(saveSettings).toHaveBeenCalledWith('recruiter-1', 'RECRUITER', body);
  });
});
