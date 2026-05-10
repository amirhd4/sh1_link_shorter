import type { LinkDetailsForAdmin } from '@/types/api';
import config  from '@/config/index';

export function formatDateTime(value?: string | null) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

export function truncateText(text?: string | null, max = 60) {
  if (!text) return '—';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function getLinkBaseDomain(link: LinkDetailsForAdmin) {
  return link.domain?.name || config.backendBaseUrlOrigin;
}

export function getFullShortUrl(link: LinkDetailsForAdmin) {
  const baseDomain = getLinkBaseDomain(link).replace(/\/+$/, '');
  return `${baseDomain}/${link.short_code}`;
}

export function getOwnerDisplayName(link: LinkDetailsForAdmin) {
  return link.owner?.phone_number || `کاربر #${link.owner?.id ?? '—'}`;
}

export function hasAnyUTM(link: LinkDetailsForAdmin) {
  return Boolean(
    link.utm_source ||
    link.utm_medium ||
    link.utm_campaign ||
    link.utm_term ||
    link.utm_content
  );
}

export async function copyText(text: string) {
  await navigator.clipboard.writeText(text);
}
