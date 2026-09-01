import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

export function ShareJobButton({ jobTitle }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title: `${jobTitle} · CareerBridge`, url: window.location.href });
      return;
    }

    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button type="button" variant="secondary" size="lg" className="w-full" onClick={handleShare}>
      {copied ? <Check aria-hidden="true" /> : <Share2 aria-hidden="true" />}
      {copied ? 'Link copied' : 'Share job'}
    </Button>
  );
}
