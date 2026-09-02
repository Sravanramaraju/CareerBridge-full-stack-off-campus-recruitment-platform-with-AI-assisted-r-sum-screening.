import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '@/src/components/ui/Button';

describe('Button', () => {
  it('renders an accessible native button with its requested variant', () => {
    render(<Button variant="danger">Remove draft</Button>);

    const button = screen.getByRole('button', { name: 'Remove draft' });
    expect(button).toBeEnabled();
    expect(button).toHaveClass('bg-[var(--cb-danger)]');
  });

  it('prevents interaction when disabled', () => {
    render(<Button disabled>Publishing</Button>);

    expect(screen.getByRole('button', { name: 'Publishing' })).toBeDisabled();
  });
});
