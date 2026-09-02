import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Tabs } from '@/src/components/ui/Tabs';

const items = [{ value: 'all', label: 'All' }, { value: 'unread', label: 'Unread', count: 2 }, { value: 'archived', label: 'Archived' }];

function ExampleTabs() {
  const [value, setValue] = useState('all');
  return <Tabs items={items} value={value} onValueChange={setValue} label="Message filter" />;
}

describe('Tabs', () => {
  it('moves selection with arrow keys and wraps at the end', async () => {
    render(<ExampleTabs />);
    const allTab = screen.getByRole('tab', { name: 'All' });
    allTab.focus();

    await userEvent.keyboard('{ArrowLeft}');

    expect(screen.getByRole('tab', { name: 'Archived' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Archived' })).toHaveFocus();
  });

  it('supports Home and End navigation', async () => {
    render(<ExampleTabs />);
    const allTab = screen.getByRole('tab', { name: 'All' });
    allTab.focus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('tab', { name: 'Archived' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(allTab).toHaveFocus();
  });
});
