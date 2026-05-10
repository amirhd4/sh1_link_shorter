'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LinkDetailsForAdmin } from '@/types/api';
import { adminService } from '@/services/adminService';
import DisableLinkModal from '@/components/admin-dashboard/DisableLinkModal';
import {
  copyText,
  formatDateTime,
  getFullShortUrl,
  getLinkBaseDomain,
  getOwnerDisplayName,
  hasAnyUTM,
  truncateText,
} from '@/lib/link-utils';

type StatusFilter =
  | 'all'
  | 'active'
  | 'inactive'
  | 'protected'
  | 'ads'
  | 'admin_disabled'
  | 'has_utm'
  | 'no_utm'
  | 'custom_domain'
  | 'no_domain';

type SortField =
  | 'id'
  | 'created_at'
  | 'updated_at'
  | 'deactivated_at'
  | 'clicks'
  | 'short_code'
  | 'is_active';

type SortDirection = 'asc' | 'desc';

function Badge({
  children,
  color = 'slate',
}: {
  children: React.ReactNode;
  color?: 'green' | 'red' | 'amber' | 'blue' | 'slate' | 'violet';
}) {
  const styles = {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    red: 'border-rose-200 bg-rose-50 text-rose-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-700',
    violet: 'border-violet-200 bg-violet-50 text-violet-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${styles[color]}`}
    >
      {children}
    </span>
  );
}

function UTMInline({ link }: { link: LinkDetailsForAdmin }) {
  const utmItems = [
    { label: 'source', value: link.utm_source },
    { label: 'medium', value: link.utm_medium },
    { label: 'campaign', value: link.utm_campaign },
    { label: 'term', value: link.utm_term },
    { label: 'content', value: link.utm_content },
  ].filter((item) => item.value);

  if (!utmItems.length) {
    return <span className="text-xs text-slate-400">فاقد UTM</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {utmItems.map((item) => (
        <span
          key={item.label}
          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700"
        >
          <span className="font-bold">{item.label}:</span>
          <span dir="ltr">{item.value}</span>
        </span>
      ))}
    </div>
  );
}

function ExpandedDetails({ link }: { link: LinkDetailsForAdmin }) {
  const shortUrl = getFullShortUrl(link);
  const baseDomain = getLinkBaseDomain(link);

  return (
    <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-extrabold text-slate-900">اطلاعات اصلی</div>
          <div className="space-y-2 text-sm text-slate-600">
            <div><span className="font-bold text-slate-900">شناسه لینک:</span> #{link.id}</div>
            <div><span className="font-bold text-slate-900">کد کوتاه:</span> {link.short_code}</div>
            <div><span className="font-bold text-slate-900">دامنه:</span> {baseDomain}</div>
            <div><span className="font-bold text-slate-900">شناسه دامنه:</span> {link.domain?.id ?? '—'}</div>
            <div><span className="font-bold text-slate-900">نمایش تبلیغات:</span> {link.show_ads ? 'بله' : 'خیر'}</div>
            <div><span className="font-bold text-slate-900">تعداد کلیک:</span> {link.clicks.toLocaleString('fa-IR')}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-extrabold text-slate-900">وضعیت لینک</div>
          <div className="flex flex-wrap gap-2">
            <Badge color={link.is_active ? 'green' : 'red'}>
              {link.is_active ? 'فعال' : 'غیرفعال'}
            </Badge>

            <Badge color={link.is_protected ? 'violet' : 'slate'}>
              {link.is_protected ? 'رمزدار' : 'بدون رمز'}
            </Badge>

            <Badge color={link.show_ads ? 'blue' : 'slate'}>
              {link.show_ads ? 'هدایت به صفحه تبلیغات' : 'هدایت مستقیم'}
            </Badge>

            {link.deactivated_by_admin && (
              <Badge color="amber">غیرفعال‌شده توسط ادمین</Badge>
            )}
          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-600">
            <div>
              <span className="font-bold text-slate-900">دلیل غیرفعال‌سازی:</span>{' '}
              {link.deactivation_reason || '—'}
            </div>
            <div>
              <span className="font-bold text-slate-900">تاریخ غیرفعال‌سازی:</span>{' '}
              {formatDateTime(link.deactivated_at)}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 text-sm font-extrabold text-slate-900">زمان‌ها</div>
          <div className="space-y-2 text-sm text-slate-600">
            <div>
              <span className="font-bold text-slate-900">ایجاد:</span>{' '}
              {formatDateTime(link.created_at)}
            </div>
            <div>
              <span className="font-bold text-slate-900">آخرین بروزرسانی:</span>{' '}
              {formatDateTime(link.updated_at)}
            </div>
            <div>
              <span className="font-bold text-slate-900">غیرفعال‌سازی:</span>{' '}
              {formatDateTime(link.deactivated_at)}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-extrabold text-slate-900">آدرس کوتاه</div>
        <div className="flex flex-col gap-2">
          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="break-all text-sm text-blue-600 hover:underline"
          >
            {shortUrl}
          </a>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyText(shortUrl)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              کپی لینک کوتاه
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-extrabold text-slate-900">لینک مقصد</div>
        <div className="flex flex-col gap-2">
          <a
            href={link.long_url}
            target="_blank"
            rel="noreferrer"
            dir="ltr"
            className="break-all text-sm text-blue-600 hover:underline"
          >
            {link.long_url}
          </a>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => copyText(link.long_url)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              کپی لینک مقصد
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-extrabold text-slate-900">پارامترهای UTM</div>
        <UTMInline link={link} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 text-sm font-extrabold text-slate-900">مالک لینک</div>
        <div className="space-y-2 text-sm text-slate-600">
          <div><span className="font-bold text-slate-900">شناسه کاربر:</span> {link.owner?.id ?? '—'}</div>
          <div><span className="font-bold text-slate-900">شماره موبایل:</span> {link.owner?.phone_number || '—'}</div>
        </div>
      </div>
    </div>
  );
}

function getTimestamp(value?: string | null) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function compareValues(a: LinkDetailsForAdmin, b: LinkDetailsForAdmin, field: SortField) {
  switch (field) {
    case 'id':
      return a.id - b.id;
    case 'clicks':
      return a.clicks - b.clicks;
    case 'short_code':
      return a.short_code.localeCompare(b.short_code);
    case 'is_active':
      return Number(a.is_active) - Number(b.is_active);
    case 'created_at':
      return getTimestamp(a.created_at) - getTimestamp(b.created_at);
    case 'updated_at':
      return getTimestamp(a.updated_at) - getTimestamp(b.updated_at);
    case 'deactivated_at':
      return getTimestamp(a.deactivated_at) - getTimestamp(b.deactivated_at);
    default:
      return 0;
  }
}

function buildPageNumbers(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, '...', totalPages] as const;
  }

  if (currentPage >= totalPages - 3) {
    return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages] as const;
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages] as const;
}

export default function AdminLinksPage() {
  const [links, setLinks] = useState<LinkDetailsForAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [expandedRows, setExpandedRows] = useState<number[]>([]);
  const [selectedLink, setSelectedLink] = useState<LinkDetailsForAdmin | null>(null);
  const [disableModalOpen, setDisableModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await adminService.getAllLinks();
      setLinks(data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'خطا در دریافت لیست لینک‌ها');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, sortField, sortDirection, pageSize]);

  const stats = useMemo(() => {
    return {
      total: links.length,
      active: links.filter((link) => link.is_active).length,
      inactive: links.filter((link) => !link.is_active).length,
      protected: links.filter((link) => link.is_protected).length,
      ads: links.filter((link) => link.show_ads).length,
      adminDisabled: links.filter((link) => link.deactivated_by_admin).length,
      withUTM: links.filter((link) => hasAnyUTM(link)).length,
      customDomain: links.filter((link) => Boolean(link.domain?.name)).length,
    };
  }, [links]);

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();

    return links.filter((link) => {
      const domainName = link.domain?.name || '';
      const shortUrl = getFullShortUrl(link).toLowerCase();
      const hasUTM = hasAnyUTM(link);
      const hasDomain = Boolean(link.domain?.name);

      const matchesSearch =
        !q ||
        String(link.id).includes(q) ||
        link.short_code.toLowerCase().includes(q) ||
        link.long_url.toLowerCase().includes(q) ||
        String(link.owner?.id ?? '').includes(q) ||
        (link.owner?.phone_number || '').toLowerCase().includes(q) ||
        domainName.toLowerCase().includes(q) ||
        shortUrl.includes(q) ||
        (link.utm_source || '').toLowerCase().includes(q) ||
        (link.utm_medium || '').toLowerCase().includes(q) ||
        (link.utm_campaign || '').toLowerCase().includes(q) ||
        (link.utm_term || '').toLowerCase().includes(q) ||
        (link.utm_content || '').toLowerCase().includes(q) ||
        (link.deactivation_reason || '').toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'all' ? true :
        statusFilter === 'active' ? link.is_active :
        statusFilter === 'inactive' ? !link.is_active :
        statusFilter === 'protected' ? link.is_protected :
        statusFilter === 'ads' ? link.show_ads :
        statusFilter === 'admin_disabled' ? link.deactivated_by_admin :
        statusFilter === 'has_utm' ? hasUTM :
        statusFilter === 'no_utm' ? !hasUTM :
        statusFilter === 'custom_domain' ? hasDomain :
        statusFilter === 'no_domain' ? !hasDomain :
        true;

      return matchesSearch && matchesStatus;
    });
  }, [links, search, statusFilter]);

  const sortedLinks = useMemo(() => {
    const result = [...filteredLinks].sort((a, b) => {
      const compared = compareValues(a, b, sortField);
      return sortDirection === 'asc' ? compared : -compared;
    });

    return result;
  }, [filteredLinks, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedLinks.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedLinks = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    const end = start + pageSize;
    return sortedLinks.slice(start, end);
  }, [sortedLinks, safeCurrentPage, pageSize]);

  const pageNumbers = useMemo(
    () => buildPageNumbers(safeCurrentPage, totalPages),
    [safeCurrentPage, totalPages]
  );

  const startItem = sortedLinks.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endItem = Math.min(safeCurrentPage * pageSize, sortedLinks.length);

  const toggleExpanded = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setSortField('created_at');
    setSortDirection('desc');
    setPageSize(20);
    setCurrentPage(1);
  };

  const handleDelete = async (link: LinkDetailsForAdmin) => {
    const confirmed = window.confirm(
      `آیا از حذف لینک #${link.id} با کد ${link.short_code} مطمئن هستید؟`
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(link.id);
      await adminService.deleteLink(link.short_code, link.domain?.id ?? null);
      setLinks((prev) => prev.filter((item) => item.id !== link.id));
      setExpandedRows((prev) => prev.filter((id) => id !== link.id));
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در حذف لینک');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEnable = async (link: LinkDetailsForAdmin) => {
    const confirmed = window.confirm(`آیا می‌خواهید لینک #${link.id} دوباره فعال شود؟`);
    if (!confirmed) return;

    try {
      setActionLoadingId(link.id);
      await adminService.enableLink(link);
      await fetchLinks();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در فعال‌سازی لینک');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDisableModal = (link: LinkDetailsForAdmin) => {
    setSelectedLink(link);
    setDisableModalOpen(true);
  };

  const handleDisableConfirm = async (reason: string) => {
    if (!selectedLink) return;

    try {
      setActionLoadingId(selectedLink.id);
      await adminService.disableLink(selectedLink, reason);
      setDisableModalOpen(false);
      setSelectedLink(null);
      await fetchLinks();
    } catch (err: any) {
      alert(err?.response?.data?.detail || 'خطا در غیرفعال‌سازی لینک');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6" dir="rtl">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">مدیریت کامل لینک‌ها</h1>
            <p className="mt-1 text-sm text-slate-500">
              مشاهده، فیلتر، مرتب‌سازی دقیق، صفحه‌بندی و مدیریت کامل لینک‌ها
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={resetFilters}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              ریست فیلترها
            </button>
            <button
              onClick={fetchLinks}
              className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              بروزرسانی لیست
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm text-slate-500">کل لینک‌ها</div>
            <div className="mt-1 text-2xl font-black text-slate-900">
              {stats.total.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="text-sm text-emerald-700">فعال</div>
            <div className="mt-1 text-2xl font-black text-emerald-800">
              {stats.active.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <div className="text-sm text-rose-700">غیرفعال</div>
            <div className="mt-1 text-2xl font-black text-rose-800">
              {stats.inactive.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
            <div className="text-sm text-violet-700">رمزدار</div>
            <div className="mt-1 text-2xl font-black text-violet-800">
              {stats.protected.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-700">تبلیغاتی</div>
            <div className="mt-1 text-2xl font-black text-blue-800">
              {stats.ads.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-700">غیرفعال‌شده توسط ادمین</div>
            <div className="mt-1 text-2xl font-black text-amber-800">
              {stats.adminDisabled.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <div className="text-sm text-cyan-700">دارای UTM</div>
            <div className="mt-1 text-2xl font-black text-cyan-800">
              {stats.withUTM.toLocaleString('fa-IR')}
            </div>
          </div>

          <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 p-4">
            <div className="text-sm text-fuchsia-700">دامنه اختصاصی</div>
            <div className="mt-1 text-2xl font-black text-fuchsia-800">
              {stats.customDomain.toLocaleString('fa-IR')}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو بر اساس آیدی، کد کوتاه، لینک مقصد، موبایل، دامنه، UTM و ..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="lg:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">همه وضعیت‌ها</option>
              <option value="active">فقط فعال</option>
              <option value="inactive">فقط غیرفعال</option>
              <option value="protected">فقط رمزدار</option>
              <option value="ads">فقط هدایت به تبلیغات</option>
              <option value="admin_disabled">فقط غیرفعال‌شده توسط ادمین</option>
              <option value="has_utm">فقط دارای UTM</option>
              <option value="no_utm">فقط بدون UTM</option>
              <option value="custom_domain">فقط دارای دامنه اختصاصی</option>
              <option value="no_domain">فقط بدون دامنه اختصاصی</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="created_at">مرتب‌سازی: تاریخ ایجاد</option>
              <option value="updated_at">مرتب‌سازی: تاریخ بروزرسانی</option>
              <option value="deactivated_at">مرتب‌سازی: تاریخ غیرفعال‌سازی</option>
              <option value="id">مرتب‌سازی: آیدی</option>
              <option value="clicks">مرتب‌سازی: کلیک</option>
              <option value="short_code">مرتب‌سازی: کد کوتاه</option>
              <option value="is_active">مرتب‌سازی: وضعیت</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <select
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as SortDirection)}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="desc">نزولی</option>
              <option value="asc">صعودی</option>
            </select>
          </div>

          <div className="lg:col-span-1">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <div>
            نمایش{' '}
            <span className="font-bold text-slate-800">{startItem.toLocaleString('fa-IR')}</span>{' '}
            تا{' '}
            <span className="font-bold text-slate-800">{endItem.toLocaleString('fa-IR')}</span>{' '}
            از{' '}
            <span className="font-bold text-slate-800">{sortedLinks.length.toLocaleString('fa-IR')}</span>{' '}
            لینک
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge color="slate">مرتب‌سازی: {sortField}</Badge>
            <Badge color="slate">{sortDirection === 'asc' ? 'صعودی' : 'نزولی'}</Badge>
            <Badge color="slate">هر صفحه: {pageSize}</Badge>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          در حال دریافت اطلاعات لینک‌ها...
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm xl:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-right text-slate-600">
                    <th className="px-4 py-4 font-black">آیدی</th>
                    <th className="px-4 py-4 font-black">لینک کوتاه</th>
                    <th className="px-4 py-4 font-black">مالک</th>
                    <th className="px-4 py-4 font-black">لینک مقصد</th>
                    <th className="px-4 py-4 font-black">وضعیت</th>
                    <th className="px-4 py-4 font-black">UTM</th>
                    <th className="px-4 py-4 font-black">کلیک</th>
                    <th className="px-4 py-4 font-black">زمان</th>
                    <th className="px-4 py-4 font-black">عملیات</th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedLinks.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center text-slate-500">
                        هیچ لینکی یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    paginatedLinks.map((link) => {
                      const expanded = expandedRows.includes(link.id);
                      const shortUrl = getFullShortUrl(link);

                      return (
                        <FragmentRow
                          key={link.id}
                          expanded={expanded}
                          link={link}
                          shortUrl={shortUrl}
                          actionLoadingId={actionLoadingId}
                          toggleExpanded={toggleExpanded}
                          openDisableModal={openDisableModal}
                          handleEnable={handleEnable}
                          handleDelete={handleDelete}
                        />
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 xl:hidden">
            {paginatedLinks.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500">
                هیچ لینکی یافت نشد.
              </div>
            ) : (
              paginatedLinks.map((link) => {
                const expanded = expandedRows.includes(link.id);
                const shortUrl = getFullShortUrl(link);

                return (
                  <div key={link.id} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-black text-slate-900">#{link.id}</span>
                          <span className="text-sm font-bold text-slate-700">{link.short_code}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge color={link.is_active ? 'green' : 'red'}>
                            {link.is_active ? 'فعال' : 'غیرفعال'}
                          </Badge>

                          <Badge color={link.is_protected ? 'violet' : 'slate'}>
                            {link.is_protected ? 'رمزدار' : 'بدون رمز'}
                          </Badge>

                          <Badge color={link.show_ads ? 'blue' : 'slate'}>
                            {link.show_ads ? 'تبلیغات' : 'مستقیم'}
                          </Badge>

                          {link.deactivated_by_admin && (
                            <Badge color="amber">ادمین</Badge>
                          )}
                        </div>
                      </div>

                      <div className="whitespace-nowrap text-left text-xs text-slate-400">
                        {formatDateTime(link.created_at)}
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div>
                        <div className="mb-1 text-xs font-bold text-slate-500">مالک</div>
                        <div className="text-sm text-slate-800">{getOwnerDisplayName(link)}</div>
                        <div className="text-xs text-slate-400">شناسه کاربر: {link.owner?.id ?? '—'}</div>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-bold text-slate-500">آدرس کوتاه</div>
                        <a
                          href={shortUrl}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="block break-all text-sm text-blue-600 hover:underline"
                        >
                          {truncateText(shortUrl, 90)}
                        </a>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-bold text-slate-500">لینک مقصد</div>
                        <a
                          href={link.long_url}
                          target="_blank"
                          rel="noreferrer"
                          dir="ltr"
                          className="block break-all text-sm text-blue-600 hover:underline"
                        >
                          {truncateText(link.long_url, 90)}
                        </a>
                      </div>

                      <div>
                        <div className="mb-1 text-xs font-bold text-slate-500">UTM</div>
                        <UTMInline link={link} />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">کلیک</div>
                          <div className="mt-1 text-sm font-black text-slate-900">
                            {link.clicks.toLocaleString('fa-IR')}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                          <div className="text-xs text-slate-500">دامنه</div>
                          <div className="mt-1 break-all text-sm font-bold text-slate-900">
                            {getLinkBaseDomain(link)}
                          </div>
                        </div>
                      </div>

                      {link.deactivation_reason && (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                          <span className="font-bold">دلیل غیرفعال‌سازی:</span> {link.deactivation_reason}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => toggleExpanded(link.id)}
                          className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                        >
                          {expanded ? 'بستن جزئیات' : 'جزئیات کامل'}
                        </button>

                        {link.is_active ? (
                          <button
                            onClick={() => openDisableModal(link)}
                            disabled={actionLoadingId === link.id}
                            className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                          >
                            غیرفعال کردن
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnable(link)}
                            disabled={actionLoadingId === link.id}
                            className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
                          >
                            فعال کردن
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(link)}
                          disabled={actionLoadingId === link.id}
                          className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                        >
                          حذف
                        </button>
                      </div>

                      {expanded && <ExpandedDetails link={link} />}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-slate-500">
                صفحه{' '}
                <span className="font-bold text-slate-900">{safeCurrentPage.toLocaleString('fa-IR')}</span>{' '}
                از{' '}
                <span className="font-bold text-slate-900">{totalPages.toLocaleString('fa-IR')}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={safeCurrentPage === 1}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  اول
                </button>

                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage === 1}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  قبلی
                </button>

                {pageNumbers.map((page, index) =>
                  page === '...' ? (
                    <span key={`dots-${index}`} className="px-2 text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`rounded-xl px-3 py-2 text-sm font-bold ${
                        page === safeCurrentPage
                          ? 'bg-slate-900 text-white'
                          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {page.toLocaleString('fa-IR')}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  بعدی
                </button>

                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={safeCurrentPage === totalPages}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  آخر
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <DisableLinkModal
        open={disableModalOpen}
        link={selectedLink}
        loading={selectedLink ? actionLoadingId === selectedLink.id : false}
        onClose={() => {
          if (actionLoadingId) return;
          setDisableModalOpen(false);
          setSelectedLink(null);
        }}
        onConfirm={handleDisableConfirm}
      />
    </div>
  );
}

function FragmentRow({
  link,
  expanded,
  shortUrl,
  actionLoadingId,
  toggleExpanded,
  openDisableModal,
  handleEnable,
  handleDelete,
}: {
  link: LinkDetailsForAdmin;
  expanded: boolean;
  shortUrl: string;
  actionLoadingId: number | null;
  toggleExpanded: (id: number) => void;
  openDisableModal: (link: LinkDetailsForAdmin) => void;
  handleEnable: (link: LinkDetailsForAdmin) => void;
  handleDelete: (link: LinkDetailsForAdmin) => void;
}) {
  return (
    <>
      <tr className="border-t border-slate-200 align-top hover:bg-slate-50/60">
        <td className="px-4 py-4">
          <div className="font-black text-slate-900">#{link.id}</div>
          <div className="mt-1 text-xs text-slate-400">
            بروزرسانی: {formatDateTime(link.updated_at)}
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="space-y-2">
            <div className="font-bold text-slate-900">{link.short_code}</div>
            <a
              href={shortUrl}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              className="block max-w-[220px] break-all text-xs text-blue-600 hover:underline"
            >
              {truncateText(shortUrl, 40)}
            </a>
            <div className="flex flex-wrap gap-2">
              <Badge color={link.is_active ? 'green' : 'red'}>
                {link.is_active ? 'فعال' : 'غیرفعال'}
              </Badge>

              <Badge color={link.is_protected ? 'violet' : 'slate'}>
                {link.is_protected ? 'رمزدار' : 'بدون رمز'}
              </Badge>

              <Badge color={link.show_ads ? 'blue' : 'slate'}>
                {link.show_ads ? 'تبلیغات' : 'مستقیم'}
              </Badge>

              {link.deactivated_by_admin && (
                <Badge color="amber">ادمین</Badge>
              )}
            </div>
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="space-y-1">
            <div className="font-bold text-slate-900">
  <a
    href={`/admin/users/${link.owner.id}`}
    className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 text-slate-800 transition hover:bg-slate-100 hover:text-blue-600"
  >
    <span>{getOwnerDisplayName(link)}</span>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4 opacity-60"
    >
      <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-8 8a1 1 0 01-.39.242l-4 1.5a1 1 0 01-1.285-1.285l1.5-4a1 1 0 01.242-.39l8-8z" />
    </svg>
  </a>
</div>
            <div className="text-xs text-slate-400">
              شناسه کاربر: {link.owner?.id ?? '—'}
            </div>
          </div>
        </td>

        <td className="max-w-[340px] px-4 py-4">
          <div className="space-y-2">
            <a
              href={link.long_url}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              className="block break-all text-blue-600 hover:underline"
            >
              {truncateText(link.long_url, 70)}
            </a>
            <div className="text-xs text-slate-400">
              دامنه: {getLinkBaseDomain(link)}
            </div>
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="space-y-2">
            <div className="text-xs text-slate-500">
              {link.deactivation_reason
                ? truncateText(link.deactivation_reason, 50)
                : 'بدون دلیل ثبت‌شده'}
            </div>
            <div className="text-xs text-slate-400">
              {formatDateTime(link.deactivated_at)}
            </div>
          </div>
        </td>

        <td className="max-w-[240px] px-4 py-4">
          <UTMInline link={link} />
        </td>

        <td className="px-4 py-4 font-bold text-slate-800">
          {link.clicks.toLocaleString('fa-IR')}
        </td>

        <td className="whitespace-nowrap px-4 py-4 text-slate-600">
          <div>{formatDateTime(link.created_at)}</div>
        </td>

        <td className="px-4 py-4">
          <div className="flex min-w-[150px] flex-col gap-2">
            <button
              onClick={() => toggleExpanded(link.id)}
              className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {expanded ? 'بستن جزئیات' : 'مشاهده جزئیات'}
            </button>

            {link.is_active ? (
              <button
                onClick={() => openDisableModal(link)}
                disabled={actionLoadingId === link.id}
                className="rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-white hover:bg-amber-600 disabled:opacity-60"
              >
                غیرفعال کردن
              </button>
            ) : (
              <button
                onClick={() => handleEnable(link)}
                disabled={actionLoadingId === link.id}
                className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                فعال کردن
              </button>
            )}

            <button
              onClick={() => handleDelete(link)}
              disabled={actionLoadingId === link.id}
              className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
            >
              حذف
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr className="border-t border-slate-100 bg-white">
          <td colSpan={9} className="px-4 pb-4">
            <ExpandedDetails link={link} />
          </td>
        </tr>
      )}
    </>
  );
}
