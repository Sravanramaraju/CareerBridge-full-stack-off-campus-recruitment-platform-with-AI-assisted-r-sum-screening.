import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { LoginPage } from './LoginPage';

describe('LoginPage demo accounts', () => {
  it('fills both credentials when a demo role is selected', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'applicant' }));

    expect(screen.getByLabelText(/email address/i)).toHaveValue(
      'applicant@careerbridge.demo',
    );
    expect(screen.getByLabelText(/^password/i)).toHaveValue('demo1234');
  });
});
