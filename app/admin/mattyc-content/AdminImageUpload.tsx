"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  isCloseToPortraitRatio,
  MATTYC_IMAGE_ACCEPT,
  type MattycImageFolder,
  validateImageFile,
} from "../../../lib/mattyc-image-upload";

type AdminImageUploadProps = {
  label: string;
  helper: string;
  folder: MattycImageFolder;
  slug: string;
  value: string;
  onChange: (url: string) => void;
  portrait?: boolean;
};

async function imageDimensions(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = url;
  });
}

export function AdminImageUpload({
  label,
  helper,
  folder,
  slug,
  value,
  onChange,
  portrait = false,
}: AdminImageUploadProps) {
  const [localPreview, setLocalPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [warning, setWarning] = useState("");

  useEffect(() => () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
  }, [localPreview]);

  async function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError("");
    setMessage("");
    setWarning("");
    const validation = validateImageFile(file);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    if (!slug.trim()) {
      setError("Enter a title or slug before uploading.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return previewUrl;
    });
    if (portrait) {
      try {
        const dimensions = await imageDimensions(previewUrl);
        if (!isCloseToPortraitRatio(dimensions.width, dimensions.height)) {
          setWarning("For best results, use a 9:16 portrait image.");
        }
      } catch {
        setWarning("The image dimensions could not be checked, but you can still upload it.");
      }
    }

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      body.append("slug", slug);
      const response = await fetch("/api/admin/mattyc-content/upload", {
        method: "POST",
        body,
      });
      const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !result.url) throw new Error(result.error || "Image upload failed.");
      onChange(result.url);
      setMessage("Image uploaded. Save the content item to keep this URL.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const preview = localPreview || value;
  return (
    <fieldset className="admin-image-upload">
      <legend>{label}</legend>
      <p className="admin-image-helper">{helper}</p>
      <label className="admin-image-picker">
        <span>{uploading ? "Uploading…" : "Choose image"}</span>
        <input
          type="file"
          accept={MATTYC_IMAGE_ACCEPT}
          disabled={uploading}
          onChange={(event) => void selectImage(event)}
        />
      </label>
      <p className="admin-image-limits">JPG, PNG, or WebP · maximum 5 MB</p>
      {warning ? <p className="admin-image-warning">{warning}</p> : null}
      {message ? <p className="admin-story-success">{message}</p> : null}
      {error ? <p className="admin-story-error">{error}</p> : null}
      {preview ? (
        <div className={`admin-image-preview${portrait ? " admin-image-preview-portrait" : ""}`}>
          {/* Blob previews and arbitrary Supabase/manual URLs are intentionally rendered directly. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt={`${label} preview`} />
        </div>
      ) : null}
    </fieldset>
  );
}
