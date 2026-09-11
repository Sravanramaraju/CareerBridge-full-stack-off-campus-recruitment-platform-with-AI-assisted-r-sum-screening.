import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProfileRecordModal } from '@/src/components/profile/ProfileRecordModal';
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

  it('opens a new record with editable résumé evidence', () => {
    const onSave = vi.fn();
    render(<ProfileRecordModal editor={{ type: 'projects', initialValues: { description: 'Detected project evidence' } }} onClose={vi.fn()} onSave={onSave} />);

    expect(screen.getByLabelText('Description')).toHaveValue('Detected project evidence');
    fireEvent.change(screen.getByLabelText('Project name'), { target: { value: 'CareerBridge' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save project' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
      name: 'CareerBridge', description: 'Detected project evidence',
    }));
  });
});
