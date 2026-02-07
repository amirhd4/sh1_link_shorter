"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { bioPageService } from "@/services/bioPageService";
import type { BioPageResponse } from "@/types/api";
import config from "@/config";
import {getDaysRemaining} from "@/utils/dateUtils";
import {useUserStore} from "@/store/userStore";
import {Alert, Button} from "@mui/material";
import { useRouter } from "next/navigation";

export default function BioPagesDashboard() {
  const router = useRouter();

  const [pages, setPages] = useState<BioPageResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const { user } = useUserStore();

  const daysRemaining = getDaysRemaining(user?.subscription_end_date);
  const isExpired = daysRemaining !== null && daysRemaining <= 0;

  const maxPages =
    user?.plan?.name === "pro" ? 3 :
    user?.plan?.name === "free" ? 1 :
    0;

  const canCreatePage = !isExpired && pages.length < maxPages;

  const handleCopy = async (id: number, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  useEffect(() => {
    bioPageService.getMyBioPages().then((res) => {
      setPages(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-gray-500">
          در حال بارگذاری صفحه اصلی bio
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">صفحات bio</h1>
          <p className="text-sm text-gray-500">
            پیوند های bio خود را مدیریت و سفارشی سازی کنید
          </p>
        </div>

        {canCreatePage ? (
  <Link
    href="/bio-pages/create"
    className="w-full sm:w-auto text-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium shadow hover:opacity-90 transition"
  >
    + صفحه جدید
  </Link>
) : (
  <button
    disabled
    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-300 text-gray-600 text-sm font-medium cursor-not-allowed"
  >
    {isExpired
      ? "اشتراک شما منقضی شده"
      : "محدودیت پلن"}
  </button>
)}

      </div>
        {user?.plan && (isExpired) && (
                  <Alert
                    severity={isExpired ? "error" : "warning"}
                    sx={{ mb: 2 }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => router.push("/plans")}
                      >
                        مشاهده پلن‌ها
                      </Button>
                    }
                  >
                    {isExpired
                      ? "اشتراک شما به پایان رسیده است. برای ادامه استفاده، لطفاً پلن خود را تمدید کنید."
                      : "امروز آخرین روز اشتراک شماست. برای جلوگیری از محدود شدن امکانات، پلن خود را تمدید کنید."}
                  </Alert>
                )}


      {/* Empty state */}
      {pages.length === 0 && (
  <div className="border rounded-2xl p-8 sm:p-12 text-center text-gray-500">
    <p className="text-lg font-medium mb-2">صفحه bio وجود ندارد</p>

    {canCreatePage ? (
      <>
        <p className="text-sm mb-4">
          اولین صفحه bio خود را بسازید
        </p>
        <Link
          href="/bio-pages/create"
          className="inline-block w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 text-white text-sm"
        >
          اولین صفحه bio خودت رو بساز
        </Link>
      </>
    ) : (
      <p className="text-sm text-red-500">
        {isExpired
          ? "اشتراک شما منقضی شده است"
          : "به سقف مجاز پلن خود رسیده‌اید"}
      </p>
    )}
  </div>
)}


      {/* Pages list */}
      <div className="space-y-4 mt-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="p-5 rounded-2xl border bg-white/70 backdrop-blur flex flex-col sm:flex-row sm:justify-between sm:items-center hover:shadow-md transition gap-4"
          >
            {/* Page info */}
            <div className="flex flex-col gap-3 flex-1">
              {/* Title + Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold text-gray-900 break-all">
                  {page.title ?? page.slug}
                </p>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    page.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {page.is_active ? "فعال" : "غیر فعال"}
                </span>
              </div>

              {/* URL + Copy */}
              <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      page.id,
                      `${config.frontBaseUrl}/bio-link/${page.slug}`
                    )
                  }
                  className="w-full text-left text-sm text-gray-600 font-mono truncate px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition"
                >
                  {config.frontBaseUrl}/bio-link/{page.slug}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      page.id,
                      `${config.frontBaseUrl}/bio-link/${page.slug}`
                    )
                  }
                  className="px-3 py-2 rounded-lg border text-xs text-gray-600 hover:bg-gray-100 transition whitespace-nowrap"
                >
                  {copiedId === page.id ? "کپی شد ✅" : "📋"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 items-center text-sm justify-end">
              <Link
                href={`/bio-pages/${page.id}`}
                className="text-blue-600 hover:underline"
              >
                مدیریت
              </Link>

              <button
                onClick={async () => {
                  await bioPageService.updateBioPage(page.id, {
                    is_active: !page.is_active,
                  });
                  setPages((prev) =>
                    prev.map((p) =>
                      p.id === page.id ? { ...p, is_active: !p.is_active } : p
                    )
                  );
                }}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                {page.is_active ? "غیر فعال" : "فعال"}
              </button>

              <button
                onClick={async () => {
                  await bioPageService.deleteBioPage(page.id);
                  setPages((prev) => prev.filter((p) => p.id !== page.id));
                }}
                className="text-red-500 hover:text-red-600 transition"
              >
                پاک کردن
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
