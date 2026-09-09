import { describe, expect, it, vi } from 'vitest';
import { upsertSkillRecord } from '../src/modules/skills/skill.repository.js';

describe('shared skill repository', () => {
  it('upserts normalized skills without changing an existing display name', async () => {
    const upsert = vi.fn().mockResolvedValue({ id: 'skill-1' });

    await upsertSkillRecord(
      { name: 'React', normalizedName: 'react' },
      { skill: { upsert } },
    );

    expect(upsert).toHaveBeenCalledWith({
      where: { normalizedName: 'react' },
      create: { name: 'React', normalizedName: 'react' },
      update: {},
      select: { id: true, name: true, normalizedName: true },
    });
  });
});
