"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { bioPageService } from "@/services/bioPageService";
import { Button } from "@mui/material";
import config from "@/config";

export default function CreateBioPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // محدودیت حجم
    if (file.size > 3 * 1024 * 1024) {
      setError("حجم فایل نباید بیشتر از 3MB باشد");
      return;
    }

    // فقط فرمت‌های معتبر
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("فرمت فایل باید jpg, png یا webp باشد");
      return;
    }

    setError(null);
    setAvatarFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!slug.match(/^[a-z0-9-]+$/)) {
      setError("Slug فقط می‌تونه شامل حروف انگلیسی، عدد و - باشه");
      return;
    }

    try {
      setLoading(true);

      // ارسال فرم دیتا به جای json
      const formData = new FormData();
      formData.append("title", title);
      formData.append("slug", slug);
      formData.append("description", description);
      if (avatarFile) formData.append("avatar", avatarFile);

      const page = await bioPageService.createBioPage(formData);

      router.push(`/bio-pages/${page.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "خطا در ساخت لینک بیو");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-3xl border bg-white/70 backdrop-blur-xl shadow-lg p-8">
        <Button sx={{ mt: 2 }} onClick={() => router.push("/bio-pages")}>
          بازگشت به صفحه اصلی bio
        </Button>

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">ساخت لینک بیو جدید</h1>
          <p className="text-sm text-gray-500">
            لینک‌های مهمت رو در یک صفحه شیک جمع کن ✨
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm mb-1 font-medium">عنوان</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border px-4 py-2.5 bg-transparent focus:outline-none focus:ring-2 focus:ring-black/20 transition"
              placeholder="مثلاً لینک های من"
              required
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm mb-1 font-medium">
              Slug (لینک صفحه)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value.toLowerCase())}
              className="w-full rounded-xl border px-4 py-2.5 bg-transparent focus:outline-none focus:ring-2 focus:ring-black/20 transition"
              placeholder="my-links"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
                {config.frontBaseUrl}/
              <span className="font-medium text-gray-800">{slug || "your-[slug]"}</span>
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm mb-1 font-medium">توضیحات</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl border px-4 py-2.5 bg-transparent focus:outline-none focus:ring-2 focus:ring-black/20 transition resize-none"
              placeholder="توضیحات کوتاه درباره خودت"
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm mb-1 font-medium">آپلود آواتار</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarChange}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">حداکثر حجم: 3MB</p>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3 font-medium text-white bg-gradient-to-r from-black to-gray-800 hover:opacity-90 transition disabled:opacity-60"
          >
            {loading ? "در حال ساخت..." : "ساخت لینک بیو 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
}
