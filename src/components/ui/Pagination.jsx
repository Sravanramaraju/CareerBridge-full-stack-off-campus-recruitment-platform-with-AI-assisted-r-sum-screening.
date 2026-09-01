import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function Pagination({ currentPage, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Job result pages">
      <Button
        variant="secondary"
        size="iconSm"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft aria-hidden="true" />
      </Button>
      {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? 'primary' : 'ghost'}
          size="iconSm"
          onClick={() => onPageChange(page)}
          aria-label={`Page ${page}`}
          aria-current={page === currentPage ? 'page' : undefined}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="secondary"
        size="iconSm"
        disabled={currentPage === pageCount}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight aria-hidden="true" />
      </Button>
    </nav>
  );
}
