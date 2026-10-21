"use client";

import * as React from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { apiClient, mediaSrc, type ApiError } from "@/lib/apiClient";
import { errMessage } from "@/components/admin/ui";

export interface MediaRef {
  id: string;
  url: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  altText: string;
}

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

/**
 * Uploads a figure to POST /lecturer/media and hands back the MediaAsset view.
 * The question editor sends only `mediaId`, so the same file is stored once and
 * served from the API's immutable /media/:id route.
 */
export function MediaUpload({
  value,
  onChange,
  label = "Add photo",
  hint = "PNG, JPEG, WebP or GIF · up to 10 MB",
  compact = false,
}: {
  value: MediaRef | null;
  onChange: (media: MediaRef | null) => void;
  label?: string;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const pick = () => inputRef.current?.click();

  const upload = async (file: File) => {
    setError(null);
    if (!ACCEPT.split(",").includes(file.type)) {
      setError("Choose a PNG, JPEG, WebP or GIF image.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 10 MB.");
      return;
    }

    setPending(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await apiClient<{ data: MediaRef }>("/lecturer/media", {
        method: "POST",
        body: form,
      });
      onChange(res.data);
    } catch (e) {
      setError((e as ApiError).code === "NO_FILE" ? "Choose an image to upload." : errMessage(e));
    } finally {
      setPending(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={compact ? "" : "space-y-1.5"}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      {value ? (
        <div className="relative inline-block group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaSrc(value.url) ?? ""}
            alt={value.altText || "Question figure"}
            className="max-h-40 rounded-lg border border-gray-200 bg-gray-50 object-contain"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg bg-gray-900/40 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={pick}
              disabled={pending}
              className="rounded-md bg-white px-2 py-1 text-[12px] font-medium text-gray-800 shadow disabled:opacity-60"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              disabled={pending}
              className="rounded-md bg-red-600 px-2 py-1 text-[12px] font-medium text-white shadow disabled:opacity-60"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-[13px] font-medium text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
          {pending ? "Uploading..." : label}
        </button>
      )}

      {pending && value && (
        <span className="ml-2 text-[12px] text-gray-500 inline-flex items-center gap-1">
          <Loader2 size={12} className="animate-spin" /> Uploading...
        </span>
      )}
      {!pending && !value && hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
      {error && (
        <p role="alert" className="text-[12px] text-red-600 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}
    </div>
  );
}
