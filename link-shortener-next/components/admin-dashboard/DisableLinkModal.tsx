'use client';

import { useEffect, useState } from 'react';
import type { LinkDetailsForAdmin } from '@/types/api';
import { getFullShortUrl } from '@/lib/link-utils';

interface DisableLinkModalProps {
  open: boolean;
  link: LinkDetailsForAdmin | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void> | void;
}

export default function DisableLinkModal({
  open,
  link,
  loading = false,
  onClose,
  onConfirm,
}: DisableLinkModalProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      setReason(link?.deactivation_reason || '');
    }
  }, [open, link]);

  if (!open || !link) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-extrabold text-slate-900">غیرفعال‌سازی لینک</h3>
          <p className="mt-1 text-sm text-slate-500">
            لطفاً دلیل غیرفعال‌سازی را برای ثبت در پنل مدیریت وارد کنید.
          </p>
        </div>

        <div className="space-y-4 px-5 py-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="mb-2 text-slate-700">
              <span className="font-bold text-slate-900">شناسه:</span> #{link.id}
            </div>

            <div className="mb-2 text-slate-700">
              <span className="font-bold text-slate-900">کد کوتاه:</span> {link.short_code}
            </div>

            <div className="mb-2 break-all text-slate-700" dir="ltr">
              <span className="font-bold text-slate-900">آدرس کوتاه:</span> {getFullShortUrl(link)}
            </div>

            <div className="break-all text-slate-600" dir="ltr">
              <span className="font-bold text-slate-900">لینک مقصد:</span> {link.long_url}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-800">
              دلیل غیرفعال‌سازی
            </label>
            <textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثلاً: این لینک نیاز به بررسی دارد، گزارش تخلف ثبت شده، محتوای مقصد نامعتبر است و ..."
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            انصراف
          </button>

          <button
            disabled={loading}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'در حال انجام...' : 'غیرفعال کردن لینک'}
          </button>
        </div>
      </div>
    </div>
  );
}
