export const VAN_CLIBURN_STORY_TABLE = "van_cliburn_story_entries";
export const VAN_CLIBURN_IMAGE_BUCKET = "van-cliburn-story-images";
export const VAN_CLIBURN_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const vanCliburnCategories = [
  "decision",
  "preparation",
  "repertoire",
  "technique",
  "performance",
  "recording",
  "reflection",
  "submission",
  "lesson",
] as const;

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export function validateImageFile(file: { type: string; size: number }) {
  if (!(file.type in extensionByMimeType)) {
    return { ok: false, error: "Please upload a JPG, PNG, or WebP image." } as const;
  }
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "The selected image is empty." } as const;
  }
  if (file.size > VAN_CLIBURN_IMAGE_MAX_BYTES) {
    return { ok: false, error: "Images must be 5 MB or smaller." } as const;
  }
  return { ok: true } as const;
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

function safeImageSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "untitled";
}

function text(input: Record<string, unknown>, key: string) {
  return typeof input[key] === "string" ? input[key].trim() : "";
}

function optionalText(input: Record<string, unknown>, key: string) {
  return text(input, key) || null;
}

export function validateVanCliburnStory(input: Record<string, unknown>) {
  const errors: string[] = [];
  const title = text(input, "title");
  const entryDate = optionalText(input, "entry_date");
  const imageUrl = optionalText(input, "image_url");
  const rawOrder = Number(input.display_order);
  const displayOrder = Number.isInteger(rawOrder) && rawOrder >= 0 ? rawOrder : null;
  const isArchived = input.is_archived === true;

  if (!title) errors.push("Title is required.");
  if (entryDate && !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
    errors.push("Entry date must use YYYY-MM-DD format.");
  }
  if (displayOrder === null) errors.push("Display order must be a non-negative integer.");
  if (imageUrl) {
    try {
      const parsed = new URL(imageUrl);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
        errors.push("Image URL must use http or https.");
      }
    } catch {
      errors.push("Image URL must be a valid URL.");
    }
  }

  if (errors.length) return { ok: false, errors } as const;

  return {
    ok: true,
    data: {
      title,
      chapter_label: optionalText(input, "chapter_label"),
      entry_date: entryDate,
      category: optionalText(input, "category"),
      excerpt: optionalText(input, "excerpt"),
      body: optionalText(input, "body"),
      image_url: imageUrl,
      display_order: displayOrder,
      is_published: isArchived ? false : input.is_published === true,
      is_archived: isArchived,
    },
  } as const;
}

export function createVanCliburnImagePath(
  title: string,
  mimeType: string,
  uniqueId = crypto.randomUUID(),
) {
  const extension = extensionByMimeType[mimeType as keyof typeof extensionByMimeType];
  if (!extension) throw new Error("Unsupported image type.");
  return `story-images/${safeImageSlug(title)}/${uniqueId}.${extension}`;
}
