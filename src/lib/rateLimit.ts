interface BucketEntry {
  count: number;
  resetAt: number;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

const buckets = new Map<string, BucketEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now >= entry.resetAt) buckets.delete(key);
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  cleanup();
  const now = Date.now();
  const entry = buckets.get(ip);

  if (!entry || now >= entry.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}
