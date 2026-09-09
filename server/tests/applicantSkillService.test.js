import { describe, expect, it, vi } from 'vitest';
import { replaceApplicantSkills } from '../src/modules/profiles/profile.service.js';

describe('applicant skill service', () => {
  it('atomically replaces skills with normalized shared records', async () => {
    const database = { marker: 'transaction-client' };
    const input = [
      { name: 'React', proficiency: 'ADVANCED', yearsExperience: 2.5 },
      { name: 'Node.js', proficiency: null, yearsExperience: 1 },
    ];
    const upsertSkill = vi.fn()
      .mockResolvedValueOnce({ id: 'skill-react', name: 'React', normalizedName: 'react' })
      .mockResolvedValueOnce({ id: 'skill-node', name: 'Node.js', normalizedName: 'node.js' });
    const deleteSkills = vi.fn().mockResolvedValue({ count: 2 });
    const createSkills = vi.fn().mockResolvedValue({ count: 2 });
    const findSkills = vi.fn().mockResolvedValue([
      {
        skill: { id: 'skill-node', name: 'Node.js', normalizedName: 'node.js' },
        proficiency: null,
        yearsExperience: 1,
      },
      {
        skill: { id: 'skill-react', name: 'React', normalizedName: 'react' },
        proficiency: 'ADVANCED',
        yearsExperience: 2.5,
      },
    ]);

    const result = await replaceApplicantSkills('applicant-1', input, {
      runTransaction: (operation) => operation(database),
      findProfile: vi.fn().mockResolvedValue({ id: 'profile-1' }),
      upsertSkill,
      deleteSkills,
      createSkills,
      findSkills,
    });

    expect(upsertSkill).toHaveBeenNthCalledWith(
      1,
      { name: 'React', normalizedName: 'react' },
      database,
    );
    expect(deleteSkills).toHaveBeenCalledWith('profile-1', database);
    expect(createSkills).toHaveBeenCalledWith(
      'profile-1',
      [
        { skillId: 'skill-react', proficiency: 'ADVANCED', yearsExperience: 2.5 },
        { skillId: 'skill-node', proficiency: null, yearsExperience: 1 },
      ],
      database,
    );
    expect(result).toMatchObject({
      skills: ['Node.js', 'React'],
      skillRecords: [
        { id: 'skill-node', name: 'Node.js', yearsExperience: 1 },
        { id: 'skill-react', name: 'React', proficiency: 'ADVANCED' },
      ],
    });
  });

  it('supports clearing every skill idempotently', async () => {
    const createSkills = vi.fn();

    await replaceApplicantSkills('applicant-1', [], {
      runTransaction: (operation) => operation({}),
      findProfile: vi.fn().mockResolvedValue({ id: 'profile-1' }),
      deleteSkills: vi.fn().mockResolvedValue({ count: 0 }),
      createSkills,
      findSkills: vi.fn().mockResolvedValue([]),
    });

    expect(createSkills).toHaveBeenCalledWith('profile-1', [], {});
  });

  it('does not reveal whether another applicant profile exists', async () => {
    await expect(
      replaceApplicantSkills('missing-applicant', [], {
        runTransaction: (operation) => operation({}),
        findProfile: vi.fn().mockResolvedValue(null),
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND', status: 404 });
  });
});
