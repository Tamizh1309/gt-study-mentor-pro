/**
 * middleware.js
 * Production-Ready Middleware: Security Headers, Token Bucket Rate Limiter, In-Memory Caching, Input Sanitizer, & Structured Logging
 */

// ── 1. In-Memory Cache Store ──
const cacheStore = new Map();

function cacheMiddleware(durationSec = 180) {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const key = '__cache__' + req.originalUrl;
    const cached = cacheStore.get(key);

    if (cached && Date.now() < cached.expiry) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    // Intercept res.json
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      res.setHeader('X-Cache', 'MISS');
      cacheStore.set(key, {
        data: body,
        expiry: Date.now() + durationSec * 1000
      });
      return originalJson(body);
    };

    next();
  };
}

// ── 2. Token Bucket Rate Limiter ──
const clientBuckets = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 120;

function rateLimiterMiddleware(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let client = clientBuckets.get(ip);
  if (!client || now > client.resetTime) {
    client = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS
    };
    clientBuckets.set(ip, client);
  } else {
    client.count++;
  }

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - client.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(client.resetTime / 1000));

  if (client.count > MAX_REQUESTS_PER_WINDOW) {
    res.setHeader('Retry-After', Math.ceil((client.resetTime - now) / 1000));
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please retry after ' + Math.ceil((client.resetTime - now) / 1000) + ' seconds.',
      statusCode: 429
    });
  }

  next();
}

// ── 3. Security Headers Middleware ──
function securityHeadersMiddleware(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(self), geolocation=()');
  next();
}

// ── 4. Structured Request Logging & Telemetry ──
function loggingMiddleware(req, res, next) {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | Duration: ${duration}ms | IP: ${req.ip || 'local'}`);
  });
  next();
}

// ── 5. Input Sanitizer ──
function sanitizeInput(val) {
  if (typeof val === 'string') {
    return val.replace(/<[^>]*>?/gm, '')
              .replace(/['"<>]/g, (tag) => {
                const map = { "'": '&#39;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
                return map[tag] || tag;
              }).trim();
  }
  if (typeof val === 'object' && val !== null) {
    for (let k of Object.keys(val)) {
      val[k] = sanitizeInput(val[k]);
    }
  }
  return val;
}

module.exports = {
  cacheMiddleware,
  rateLimiterMiddleware,
  securityHeadersMiddleware,
  loggingMiddleware,
  sanitizeInput,
  clearCache: () => cacheStore.clear()
};
