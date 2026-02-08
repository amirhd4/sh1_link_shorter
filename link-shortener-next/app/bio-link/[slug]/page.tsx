"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type { BioPageResponse, BioLinkResponse } from "@/types/api";
import { bioPageService } from "@/services/bioPageService";
import config from "@/config";
import { iconOptions } from "@/types/iconList";

/* ---------------------------------------
   Icon Map
--------------------------------------- */
const iconMap = Object.fromEntries(
  iconOptions.map((i) => [i.value, i.component])
);

/* ---------------------------------------
   Helpers
--------------------------------------- */
function getDomain(url: string) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

function normalizeUrl(url: string) {
  if (!/^https?:\/\//i.test(url)) {
    return "https://" + url;
  }
  return url;
}


function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

/* ---------------------------------------
   Link Renderers
--------------------------------------- */

function UrlLink({ link }: { link: BioLinkResponse }) {
  return (
    <a
  href={`${config.backendBaseUrl}/bio-pages/link/${link.id}`}
  target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl bg-neutral-800 px-4 py-3 hover:bg-neutral-700 transition"
    >
      <div className="text-xl">
        {link.icon && iconMap[link.icon]}
      </div>

      <div className="flex-1 text-left">
        <div className="font-medium">{link.title}</div>
        <div className="text-xs text-neutral-400">
          {getDomain(normalizeUrl(link.value))}
        </div>
      </div>

      <span className="text-xs text-neutral-500 group-hover:text-neutral-300">
        ↗
      </span>
    </a>
  );
}

function EmailLink({ link }: { link: BioLinkResponse }) {
  return (
    <button
      onClick={() => copyToClipboard(link.value)}
      className="w-full flex items-center gap-3 rounded-2xl bg-neutral-800 px-4 py-3 hover:bg-neutral-700 transition text-left"
    >
      <div className="text-xl">
        {link.icon && iconMap[link.icon]}
      </div>

      <div className="flex-1">
        <div className="font-medium">{link.title}</div>
        <div className="text-xs text-neutral-400">
          کلیک برای کپی ایمیل
        </div>
      </div>

      <span className="text-xs text-neutral-500">Copy</span>
    </button>
  );
}

function PhoneLink({ link }: { link: BioLinkResponse }) {
  return (
    <a
      href={`tel:${link.value}`}
      dir="ltr"
      className="flex items-center gap-3 rounded-2xl bg-neutral-800 px-4 py-3 hover:bg-neutral-700 transition"
    >
      <div className="text-xl">
        {link.icon && iconMap[link.icon]}
      </div>

      <div className="flex-1 text-left">
        <div className="font-medium">{link.title}</div>
        <div className="text-xs text-neutral-400 tracking-wider">
          {link.value}
        </div>
      </div>

      <span className="text-xs text-neutral-400">📞</span>
    </a>
  );
}


function TextBlock({ link }: { link: BioLinkResponse }) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-4 text-sm text-neutral-200 leading-relaxed">
      <div className="flex items-start gap-3">
        <div className="text-xl">
          {link.icon && iconMap[link.icon]}
        </div>
        <p>{link.value}</p>
      </div>
    </div>
  );
}


function PaymentLink({ link }: { link: BioLinkResponse }) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-emerald-500/20 to-green-500/10 border border-emerald-400/30 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="text-xl">
          {link.icon && iconMap[link.icon]}
        </div>
        <div className="font-semibold">{link.title}</div>
      </div>

      <div
        dir="ltr"
        className="rounded-xl bg-black/40 px-3 py-2 text-sm tracking-wider select-all"
      >
        {link.value}
      </div>

      <button
        onClick={() => copyToClipboard(link.value)}
        className="mt-3 w-full rounded-xl bg-emerald-500 text-black py-2 text-sm font-medium hover:opacity-90 transition"
      >
        کپی اطلاعات پرداخت
      </button>
    </div>
  );
}


/* ---------------------------------------
   Main Page
--------------------------------------- */

export default function PublicBioPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<BioPageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchPage() {
      try {
        const data = await bioPageService.getPublicBioPage(slug);

        if (!data.is_active || !data.is_public) {
          setError(true);
          return;
        }

        setPage(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchPage().then(r => null);
  }, [slug]);

  if (loading) return <p className="text-center mt-10">در حال بارگذاری…</p>;
  if (error || !page)
    return <p className="text-center mt-10">صفحه یافت نشد</p>;

  return (
<main className="min-h-screen bg-gradient-to-br from-zinc-900 via-neutral-900 to-black text-white flex justify-center">
<div className="w-full max-w-md px-4 py-10 text-center">
  <div className="rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 shadow-2xl">

        {/* Avatar */}
        {page.avatar_url && (
          <div className="mb-4 flex justify-center">
            <Image
              alt={page.title ?? "avatar"}
              width={96}
              height={96}
              className="rounded-full object-cover"
              src={`${config.backendBaseUrl}${page.avatar_url}`}
            />
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl font-bold tracking-tight">
  {page.title}
</h1>

<p className="mt-2 text-sm text-neutral-300 leading-relaxed">
  {page.description}
</p>


        {/* Links */}
        <div className="mt-6 space-y-3">
          {page.links
            .filter((l) => l.is_active)
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map((link) => {
              switch (link.link_type) {
                case "url":
                  return <UrlLink key={link.id} link={link} />;
                case "email":
                  return <EmailLink key={link.id} link={link} />;
                case "phone":
                  return <PhoneLink key={link.id} link={link} />;
                case "text":
                  return <TextBlock key={link.id} link={link} />;
                case "payment":
                  return <PaymentLink key={link.id} link={link} />;
                default:
                  return null;
              }
            })}
        </div>
  </div>
      </div>
    </main>
  );
}
