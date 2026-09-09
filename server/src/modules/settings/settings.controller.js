import { getSettings, updateSettings } from './settings.service.js';

export function createGetSettingsHandler({ readSettings = getSettings } = {}) {
  return async (request, response, next) => {
    try {
      const settings = await readSettings(request.auth.user.id, request.auth.user.role);
      return response.json({ data: settings });
    } catch (error) {
      return next(error);
    }
  };
}

export function createUpdateSettingsHandler({ saveSettings = updateSettings } = {}) {
  return async (request, response, next) => {
    try {
      const settings = await saveSettings(
        request.auth.user.id,
        request.auth.user.role,
        request.validated.body,
      );
      return response.json({ data: settings });
    } catch (error) {
      return next(error);
    }
  };
}

export const getSettingsHandler = createGetSettingsHandler();
export const updateSettingsHandler = createUpdateSettingsHandler();
