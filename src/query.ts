import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { cache } from 'react';

/**
 * Creates a cached query function.
 * Scopes cache by session ID if cookies are enabled.
 * Uses React cache for deduplication within render cycle.
 */
export function query<T, A extends any[]>(
  queryFn: (...args: A) => Promise<T>,
  getKeyParts: (...args: A) => string | string[] | Promise<string | string[]>,
) {
  return cache(async (...args: A): Promise<T> => {
    const start = Date.now();
    const sessionId = cookies().get('browser-session-id')?.value ?? null;

    const keyParts = await Promise.resolve(getKeyParts(...args));
    const tags = Array.isArray(keyParts) ? keyParts : [keyParts];

    let result: T;

    if (sessionId) {
      // Cookies are enabled; use unstable_cache for cross-request caching
      const cacheKey = [...tags, sessionId];

      // Wrap queryFn to match the expected Callback type
      const wrappedQueryFn = (...callbackArgs: any[]) => queryFn(...(callbackArgs as A));

      result = await unstable_cache(wrappedQueryFn, cacheKey, {
        tags: tags.map(String),
      })(...args);
    } else {
      // Cookies are disabled; use queryFn directly without cross-request caching
      console.warn(
        '⚠️ Cookies are disabled; skipping cross-request caching to prevent data leakage.',
      );
      result = await queryFn(...args);
    }

    const end = Date.now();
    const duration = (end - start).toString().padStart(3, ' ');

    console.log(`⏳${duration}ms ` + `S:${sessionId?.slice(0, 5) ?? 'no-session'} Q:${tags[0]}`);

    return result;
  });
}
