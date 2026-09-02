import { Moon, Sun } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Tooltip } from '@/src/components/ui/Tooltip';
import { useTheme } from '@/src/features/theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Tooltip label={`Switch to ${isDark ? 'light' : 'dark'} mode`}>
      <Button
        type="button"
        variant="ghost"
        size="iconSm"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      </Button>
    </Tooltip>
  );
}
