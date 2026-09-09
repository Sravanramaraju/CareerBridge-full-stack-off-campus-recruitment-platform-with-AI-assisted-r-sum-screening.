import { replaceApplicantSkills } from './profile.service.js';

export function createReplaceApplicantSkillsHandler({ replaceSkills = replaceApplicantSkills } = {}) {
  return async (request, response, next) => {
    try {
      const result = await replaceSkills(
        request.auth.user.id,
        request.validated.body.skills,
      );
      return response.json({ data: result });
    } catch (error) {
      return next(error);
    }
  };
}

export const replaceApplicantSkillsHandler = createReplaceApplicantSkillsHandler();
