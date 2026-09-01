type SoftRateLimitOptions = {
  limit: number;
  windowMs: number;
};

export type SoftRateLimitResult = {
  allowed: boolean;
  retryAfterMs: number;
};

const memoryBuckets = new Map<string, number[]>();
const STORAGE_PREFIX = 'p-english:soft-rate:';

function nowMs() {
  return Date.now();
}

function getSessionStorage() {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage ?? null;
  } catch {
    return null;
  }
}

function readBucket(scope: string) {
  const storage = getSessionStorage();
  if (!storage) return memoryBuckets.get(scope) ?? [];

  try {
    const parsed = JSON.parse(storage.getItem(`${STORAGE_PREFIX}${scope}`) ?? '[]');
    return Array.isArray(parsed) ? parsed.map(Number).filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

function writeBucket(scope: string, bucket: number[]) {
  const storage = getSessionStorage();
  memoryBuckets.set(scope, bucket);
  if (!storage) return;

  try {
    storage.setItem(`${STORAGE_PREFIX}${scope}`, JSON.stringify(bucket));
  } catch {
    // Session storage can be unavailable in privacy modes; the in-memory bucket still protects this tab.
  }
}

export function consumeSoftRateLimit(scope: string, options: SoftRateLimitOptions): SoftRateLimitResult {
  const current = nowMs();
  const windowStart = current - options.windowMs;
  const recent = readBucket(scope).filter((timestamp) => timestamp > windowStart);

  if (recent.length >= options.limit) {
    const oldest = Math.min(...recent);
    return { allowed: false, retryAfterMs: Math.max(oldest + options.windowMs - current, 0) };
  }

  writeBucket(scope, [...recent, current]);
  return { allowed: true, retryAfterMs: 0 };
}

export function isSoftRateLimited(scope: string, options: SoftRateLimitOptions) {
  return !consumeSoftRateLimit(scope, options).allowed;
}
