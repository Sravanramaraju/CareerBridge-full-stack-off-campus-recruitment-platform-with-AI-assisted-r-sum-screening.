import { describe, expect, it, vi } from 'vitest';
import { createReplaceApplicantSkillsHandler } from '../src/modules/profiles/skill.controller.js';

describe('applicant skill controller', () => {
  it('replaces skills for the authenticated applicant', async () => {
    const skills = [{ name: 'React', proficiency: 'ADVANCED' }];
    const result = { skills: ['React'], skillRecords: [{ id: 'skill-react', name: 'React' }] };
    const replaceSkills = vi.fn().mockResolvedValue(result);
    const response = { json: vi.fn() };

    await createReplaceApplicantSkillsHandler({ replaceSkills })(
      { auth: { user: { id: 'applicant-1' } }, validated: { body: { skills } } },
      response,
      vi.fn(),
    );

    expect(replaceSkills).toHaveBeenCalledWith('applicant-1', skills);
    expect(response.json).toHaveBeenCalledWith({ data: result });
  });

  it('forwards service failures to centralized error handling', async () => {
    const error = new Error('database unavailable');
    const next = vi.fn();

    await createReplaceApplicantSkillsHandler({
      replaceSkills: vi.fn().mockRejectedValue(error),
    })(
      { auth: { user: { id: 'applicant-1' } }, validated: { body: { skills: [] } } },
      { json: vi.fn() },
      next,
    );

    expect(next).toHaveBeenCalledWith(error);
  });
});
