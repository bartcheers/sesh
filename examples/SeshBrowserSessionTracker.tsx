'use client';

import { useBrowserSessionId } from 'sesh-cache-helper';

export function SeshBrowserSessionTracker({
  hasDisabledCookies,
}: {
  hasDisabledCookies?: boolean;
}) {
  // Just call the hook - the side effects handle everything
  useBrowserSessionId({ hasDisabledCookies });

  return null;
}
