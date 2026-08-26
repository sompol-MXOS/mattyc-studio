export const MATTYC_CONTENT_BUCKET = "mattyc-content";
export const MATTYC_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const MATTYC_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export const mattycImageFolders = ["episodes", "series", "originals"] as const;
export type MattycImageFolder = (typeof mattycImageFolders)[number];

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type ImageFileDetails = {
  name: string;
  type: string;
  size: number;
};

export function validateImageFile(file: ImageFileDetails) {
  if (!(file.type in extensionByMimeType)) {
    return { ok: false, error: "Please upload a JPG, PNG, or WebP image." } as const;
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "The selected image is empty." } as const;
  }
  if (file.size > MATTYC_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Images must be 5 MB or smaller." } as const;
  }
  return {
    ok: true,
    extension: extensionByMimeType[file.type as keyof typeof extensionByMimeType],
  } as const;
}

export function isMattycImageFolder(value: unknown): value is MattycImageFolder {
  return typeof value === "string" && mattycImageFolders.includes(value as MattycImageFolder);
}

export function safeImageSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

export function createImageStoragePath(
  folder: MattycImageFolder,
  slug: string,
  mimeType: string,
  uniqueId = crypto.randomUUID(),
) {
  const extension = extensionByMimeType[mimeType as keyof typeof extensionByMimeType];
  if (!extension) throw new Error("Unsupported image type.");
  return `${folder}/${safeImageSlug(slug)}/${uniqueId}.${extension}`;
}

export function hasExpectedImageSignature(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
    return signature.every((value, index) => bytes[index] === value);
  }
  if (mimeType === "image/webp") {
    return bytes.length >= 12 &&
      String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

export function isCloseToPortraitRatio(width: number, height: number) {
  if (width <= 0 || height <= 0) return false;
  const ratio = width / height;
  const target = 9 / 16;
  return Math.abs(ratio - target) / target <= 0.2;
}
