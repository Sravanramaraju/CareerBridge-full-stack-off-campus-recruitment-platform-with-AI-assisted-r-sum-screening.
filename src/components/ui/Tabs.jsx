import { cn } from '@/src/lib/utils';

export function Tabs({ items, value, onValueChange, label, className }) {
  return (
    <div className={cn('flex gap-1 overflow-x-auto pb-1', className)} role="tablist" aria-label={label}>
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          role="tab"
          aria-selected={value === item.value}
          onClick={() => onValueChange(item.value)}
          className={cn('shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-colors', value === item.value ? 'bg-[var(--cb-primary-soft)] text-[var(--cb-primary)]' : 'text-[var(--cb-text-secondary)] hover:bg-[var(--cb-bg-subtle)]')}
        >
          {item.label}
          {item.count !== undefined && <span className="ml-1.5 text-[10px] opacity-70">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}
