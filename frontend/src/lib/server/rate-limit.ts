type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    pruneExpiredBuckets(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  bucket.count += 1;
  if (bucket.count <= limit) {
    return { allowed: true, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) };
}

export function clientIpFromRequest(request: Request) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    normalizeIp(forwardedFor?.at(-1)) ||
    normalizeIp(request.headers.get("x-real-ip")) ||
    "local"
  );
}

function pruneExpiredBuckets(now: number) {
  if (buckets.size < 1_000) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function normalizeIp(value: string | null | undefined) {
  if (!value) return null;

  const withoutBrackets = value.replace(/^\[/, "").replace(/\]$/, "");
  const withoutIpv4Port = withoutBrackets.replace(/:\d+$/, "");

  return /^[a-f0-9:.]{2,45}$/i.test(withoutIpv4Port) ? withoutIpv4Port : null;
}
