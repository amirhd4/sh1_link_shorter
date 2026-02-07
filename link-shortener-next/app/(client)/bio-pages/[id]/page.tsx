"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { bioPageService } from "@/services/bioPageService";
import type { BioLinkResponse, BioPageResponse } from "@/types/api";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {Button} from "@mui/material";
import { useRouter } from 'next/navigation';
import AvatarEditor from "@/components/bio/AvatarEditorComponent";

export default function ManageBioLinks() {
  const { id } = useParams<{ id: string }>();
  const pageId = Number(id);
  const router = useRouter();

  const [page, setPage] = useState<BioPageResponse | null>(null);
  const [links, setLinks] = useState<BioLinkResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newType, setNewType] = useState<"url" | "email" | "phone">("url");

  useEffect(() => {
    async function fetchPage() {
      const res = await bioPageService.getBioPage(pageId);
      setPage(res);
      setLinks(res.links);
      setLoading(false);
    }
    fetchPage().then(r => null);
  }, [pageId]);

  if (loading) return <p>Loading...</p>;

  // -------------------------
  // Sortable Item
  // -------------------------
  function SortableItem({ link }: { link: BioLinkResponse }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(link.title);
  const [value, setValue] = useState(link.value);
  const [type, setType] = useState(link.link_type as any);
  const [saving, setSaving] = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all flex flex-col gap-4`}
    >

      {/* Top Row */}
      <div className="flex items-start justify-between gap-4">
        {!editing ? (
          <div className="flex-1">
            <p className="font-semibold text-gray-800">{link.title}</p>
            <p className="text-xs text-gray-400 mt-1">
              {link.link_type} · {link.value}
            </p>
          </div>
        ) : (
          <div className="flex-1 space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:ring-2 focus:ring-black"
            />
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="url">URL</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="payment">Payment</option>
              <option value="text">Text</option>
            </select>
          </div>
        )}

        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-300 hover:text-gray-600 transition text-lg"
          title="جابجایی"
        >
          ☰
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            link.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {link.is_active ? "فعال" : "غیرفعال"}
        </span>

        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const updated = await bioPageService.updateBioLink(link.id, {
                    title,
                    value,
                    link_type: type,
                  });
                  setLinks((prev) =>
                    prev.map((l) => (l.id === updated.id ? updated : l))
                  );
                  setEditing(false);
                  setSaving(false);
                }}
                className="px-4 py-1.5 text-sm rounded-lg bg-black text-white hover:opacity-90"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 text-sm rounded-lg bg-gray-200"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="px-4 py-1.5 text-sm rounded-lg bg-blue-600 text-white"
              >
                ویرایش
              </button>
              <button
                onClick={async () => {
                  const toggled = await bioPageService.toggleLinkActive(
                    link.id,
                    !link.is_active
                  );
                  setLinks((prev) =>
                    prev.map((l) => (l.id === toggled.id ? toggled : l))
                  );
                }}
                className="px-4 py-1.5 text-sm rounded-lg bg-yellow-100 text-yellow-700"
              >
                {link.is_active ? "غیرفعال" : "فعال"}
              </button>
              <button
                onClick={async () => {
                  await bioPageService.deleteBioLink(link.id);
                  setLinks((prev) => prev.filter((l) => l.id !== link.id));
                }}
                className="px-4 py-1.5 text-sm rounded-lg bg-red-100 text-red-600"
              >
                پاک کردن
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


  // -------------------------
  // Main Render
  // -------------------------
  return (
      <div>
          <AvatarEditor
            pageId={page?.id}
            avatarUrl={page?.avatar_url}
          />

    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">{page?.title || "Manage Links"}</h1>
<Button sx={{ mt: 2 }} onClick={() => router.push("/bio-pages")}>
          بازگشت به صفحه اصلی bio
        </Button>
      {/* Add New Link */}
  <form
  onSubmit={async (e) => {
    e.preventDefault();
    setAdding(true);
    const newLink = await bioPageService.addBioLink(pageId, {
      title: newTitle,
      value: newValue,
      link_type: newType,
    });
    setLinks((prev) => [...prev, newLink]);
    setNewTitle("");
    setNewValue("");
    setAdding(false);
  }}
  className="relative overflow-hidden bg-white border rounded-3xl p-6 md:p-8 shadow-sm mb-10"
>
  {/* subtle background glow */}
  <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent pointer-events-none" />

  <div className="relative space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-gray-900">
        افزودن آیتم جدید
      </h2>
      <span className="text-xs px-3 py-1 rounded-full bg-black text-white">
        جدید
      </span>
    </div>

    {/* Inputs */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Title */}
      <div className="relative">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
          className="peer w-full rounded-xl border px-4 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <label className="absolute right-4 top-2 text-xs text-gray-400 peer-focus:text-black transition">
          عنوان آیتم
        </label>
      </div>

      {/* Value */}
      <div className="relative">
        <input
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          required
          className="peer w-full rounded-xl border px-4 pt-5 pb-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <label className="absolute right-4 top-2 text-xs text-gray-400 peer-focus:text-black transition">
          لینک / ایمیل / شماره / متن / پرداخت
        </label>
      </div>
    </div>

    {/* Type Selector */}
    <div>
      <p className="text-xs text-gray-500 mb-2">نوع لینک</p>
      <div className="flex flex-wrap gap-2">
        {[
          { value: "url", label: "نشانی اینترنتی 🌐" },
          { value: "email", label: "پست الکترونیکی ✉️" },
          { value: "phone", label: "شماره تلفنی 📞" },
          { value: "payment", label: "پرداخت 💳" },
          { value: "text", label: "متن 📝" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setNewType(item.value as any)}
            className={`px-4 py-1.5 rounded-full text-sm border transition ${
              newType === item.value
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 hover:border-black"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>

    {/* Submit */}
    <button
      disabled={adding}
      className="w-full md:w-auto px-8 py-3 rounded-xl bg-black text-white font-medium hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-50"
    >
      {adding ? "در حال افزودن…" : "اضافه کردن آیتم"}
    </button>
  </div>
</form>



      {/* Sortable Links */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={async (event) => {
          const { active, over } = event;
          if (!over || active.id === over.id) return;
          const oldIndex = links.findIndex((l) => l.id === active.id);
          const newIndex = links.findIndex((l) => l.id === over.id);
          const newLinks = arrayMove(links, oldIndex, newIndex);
          setLinks(newLinks);

          await bioPageService.reorderLinks(
            pageId,
            newLinks.map((l, index) => ({ id: l.id, position: index }))
          );
        }}
      >
        <SortableContext
          items={links.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {links.map((link) => (
              <SortableItem key={link.id} link={link} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
      </div>
  );
}
