import { describe, expect, it } from 'vitest';
import { buildProfileRecordPayload } from '@/src/components/profile/ProfileRecordModal';

describe('buildProfileRecordPayload', () => {
  it('normalizes education years and current-study state', () => {
    expect(buildProfileRecordPayload('education', {
      institution: ' University ', qualification: ' Degree ', fieldOfStudy: '',
      startYear: '2022', endYear: '2026', isCurrent: true, grade: '', description: '',
    })).toMatchObject({ institution: 'University', startYear: 2022, endYear: null, isCurrent: true });
  });

  it('normalizes project technologies and optional links', () => {
    expect(buildProfileRecordPayload('projects', {
      name: ' Portal ', description: ' A useful project ', projectUrl: '', repositoryUrl: '',
      technologies: 'React, Node.js, React', startedAt: '', completedAt: '',
    })).toMatchObject({
      name: 'Portal', projectUrl: null, technologies: ['React', 'Node.js', 'React'],
    });
  });
});
