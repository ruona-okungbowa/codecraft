interface CacheEntry {
  content: string;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

const CACHE_TTL = 60 * 60 * 1000;

export function getCachedContent(key: string): string | null {
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.content;
}

export function setCachedContent(key: string, content: string): void {
  cache.set(key, {
    content,
    timestamp: Date.now(),
  });
}

export function generateCacheKey(
  type: string,
  projectId: string,
  ...extras: string[]
): string {
  return `${type}:${projectId}:${extras.join(":")}`;
}

export function clearCache(): void {
  cache.clear();
}

setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }
  },
  10 * 60 * 1000
);
