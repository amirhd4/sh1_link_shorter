"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import config from "@/config";
import { bioPageService } from "@/services/bioPageService";

export default function AvatarEditor({
  pageId,
  avatarUrl,
}: {
  pageId?: number | null;
  avatarUrl?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(avatarUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (file: File) => {
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  setLoading(true);
  setError(null);

  try {
    const newAvatarUrl =
      await bioPageService.updateBioPageAvatar(pageId || 0, formData);

    setCurrentAvatar(`${newAvatarUrl}?v=${Date.now()}`);
    setPreview(null);
  } catch (err) {
    console.error(err);
    setError("آپلود عکس ناموفق بود، دوباره تلاش کن");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative w-24 h-24 rounded-full overflow-hidden border border-white/20 cursor-pointer group"
        onClick={() => inputRef.current?.click()}
      >
        <img
  src={
    preview
      ? preview
      : currentAvatar
      ? config.backendBaseUrl + currentAvatar
      : "/avatar-placeholder.png"
  }
  alt="Avatar"
  className="w-full h-full object-cover"
/>


        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs transition">
          تغییر عکس
        </div>
      </div>

      {preview && (
        <button
          onClick={() => inputRef.current?.files && handleUpload(inputRef.current.files[0])}
          disabled={loading}
          className="px-4 py-1 rounded-full bg-emerald-500 text-black text-sm font-medium"
        >
          {loading ? "در حال ذخیره..." : "ذخیره"}
        </button>
      )}
        {error && (
          <p className="text-xs text-red-400 mt-1">
            {error}
          </p>
        )}


      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(e) => e.target.files && handleSelect(e.target.files[0])}
      />
    </div>
  );
}
