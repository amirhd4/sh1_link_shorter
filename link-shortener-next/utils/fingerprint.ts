import { createHash } from 'crypto';

export function getBrowserFingerprint(): Promise<string> {
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('::');

  // استفاده از Web Crypto برای hash
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  return crypto.subtle.digest('SHA-256', dataBuffer).then(hashBuffer => {
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  });
}
