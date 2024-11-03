'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useBrowserSessionId({ hasDisabledCookies = false } = {}) {
  const [browserSessionId, setBrowserSessionId] = useState<string | null>(null);
  const router = useRouter();

  const generateAndSetSessionId = useCallback(() => {
    const sessionId = generateBrowserSessionId();

    if (!hasDisabledCookies && navigator.cookieEnabled) {
      setCookie('browser-session-id', sessionId, 1);
    } else {
      // Cookies are disabled; session ID remains only in memory
      console.warn('Cookies are disabled; session-scoped caching is limited.');
    }

    setBrowserSessionId(sessionId);
    console.log('New session ID generated:', sessionId);
  }, [hasDisabledCookies]);

  useEffect(() => {
    generateAndSetSessionId();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        generateAndSetSessionId();
        router.refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [generateAndSetSessionId, router]);

  return browserSessionId;
}

function generateBrowserSessionId(): string {
  const rawId = `${Date.now().toString(36)}-${Math.random().toString(36).substr(2)}`;
  return rawId.split('').reverse().join('');
}

function setCookie(name: string, value: string, days: number) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
}
