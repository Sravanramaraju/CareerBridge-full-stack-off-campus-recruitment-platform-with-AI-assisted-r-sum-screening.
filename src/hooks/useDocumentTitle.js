import { useEffect } from 'react';

const BRAND_NAME = 'CareerBridge';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND_NAME}` : `${BRAND_NAME} — Find Early-Career Jobs`;
  }, [title]);
}
