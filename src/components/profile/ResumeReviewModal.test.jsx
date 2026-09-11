import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResumeReviewModal } from '@/src/components/profile/ResumeReviewModal';

const resume = {
  originalFileName: 'resume.pdf',
  parsedData: {
    skills: [{ name: 'React' }, { name: 'Docker' }],
    educationEvidence: [{ sourceText: 'B.Tech, Example University' }],
    experienceEvidence: [],
    projectEvidence: [{ sourceText: 'CareerBridge portal' }],
    contactSuggestions: { email: 'person@example.com', phone: null },
  },
};

describe('ResumeReviewModal', () => {
  it('lets applicants deselect and edit skills before applying unique suggestions', () => {
    const onApplySkills = vi.fn();
    render(<ResumeReviewModal resume={resume} existingSkills={['JavaScript']} onApplySkills={onApplySkills} onCreateRecord={vi.fn()} onClose={vi.fn()} />);

    fireEvent.click(screen.getByLabelText('Select Docker'));
    fireEvent.change(screen.getByLabelText('Edit skill 1'), { target: { value: 'React.js' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply selected skills' }));

    expect(onApplySkills).toHaveBeenCalledWith([{ name: 'JavaScript' }, { name: 'React.js' }]);
  });

  it('hands edited evidence to the normal profile record editor', () => {
    const onCreateRecord = vi.fn();
    render(<ResumeReviewModal resume={resume} existingSkills={[]} onApplySkills={vi.fn()} onCreateRecord={onCreateRecord} onClose={vi.fn()} />);

    fireEvent.change(screen.getByLabelText('Detected education suggestion 1'), { target: { value: 'Verified B.Tech evidence' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Review and add' })[0]);

    expect(onCreateRecord).toHaveBeenCalledWith('education', {
      institution: '', qualification: '', description: 'Verified B.Tech evidence',
    });
  });
});
