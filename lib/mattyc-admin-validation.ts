import type { PublicationStatus } from "./mattyc-content-types";

export const publicationStatuses: PublicationStatus[] = ["draft", "published", "archived"];
export const workTypes = [
  "composition",
  "experiment",
  "arrangement",
  "recording",
  "collaboration",
] as const;

export type AdminResource = "series" | "episode" | "creativeWork";
export type ValidationResult =
  | { ok: true; data: Record<string, string | number | boolean | null> }
  | { ok: false; errors: string[] };

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function episodeSlug(seriesSlug: string, episodeNumber: number) {
  return `${seriesSlug}-${String(episodeNumber).padStart(2, "0")}`;
}

export function nextEpisodeDraft(
  current: Record<string, string | number | boolean>,
  seriesSlug: string,
) {
  const nextNumber = Math.max(1, Number(current.episode_number) + 1 || 1);

  return {
    series_id: String(current.series_id ?? ""),
    episode_number: String(nextNumber),
    slug: episodeSlug(seriesSlug, nextNumber),
    title: "",
    exercise_number: "",
    topic: "",
    description: "",
    thumbnail_url: "",
    youtube_url: "",
    tiktok_url: "",
    published_at: "",
    status: String(current.status ?? "draft"),
  };
}

function text(input: Record<string, unknown>, key: string) {
  const value = input[key];
  return typeof value === "string" ? value.trim() : "";
}

function optionalText(input: Record<string, unknown>, key: string) {
  return text(input, key) || null;
}

function positiveInteger(input: Record<string, unknown>, key: string) {
  const value = Number(input[key]);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function nonNegativeInteger(input: Record<string, unknown>, key: string) {
  const raw = input[key];
  if (raw === "" || raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function validStatus(value: string): value is PublicationStatus {
  return publicationStatuses.includes(value as PublicationStatus);
}

function validateOptionalUrl(value: string | null, label: string, errors: string[]) {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      errors.push(`${label} must use http or https.`);
    }
  } catch {
    errors.push(`${label} must be a valid URL.`);
  }
}

function validateOptionalDate(value: string | null, label: string, errors: string[]) {
  if (value && Number.isNaN(Date.parse(value))) errors.push(`${label} is not a valid date.`);
}

function publicationDate(status: PublicationStatus, value: string | null) {
  if (value) return new Date(value).toISOString();
  return status === "published" ? new Date().toISOString() : null;
}

export function validateSeries(input: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const statusValue = text(input, "status") || "draft";
  const status = validStatus(statusValue) ? statusValue : "draft";
  const projectId = text(input, "project_id");
  const title = text(input, "title");
  const slug = text(input, "slug") || slugify(title);
  const coverImageUrl = optionalText(input, "cover_image_url");
  const publishedAt = optionalText(input, "published_at");

  if (!projectId) errors.push("Project is required.");
  if (!title) errors.push("Title is required.");
  if (!slugPattern.test(slug)) errors.push("Slug must contain lowercase letters, numbers, and hyphens only.");
  if (!validStatus(statusValue)) errors.push("Status is invalid.");
  validateOptionalUrl(coverImageUrl, "Cover image URL", errors);
  validateOptionalDate(publishedAt, "Published date", errors);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      project_id: projectId,
      title,
      slug,
      subtitle: optionalText(input, "subtitle"),
      description: optionalText(input, "description"),
      cover_image_url: coverImageUrl,
      featured: Boolean(input.featured),
      display_order: nonNegativeInteger(input, "display_order") ?? 0,
      status,
      started_at: optionalText(input, "started_at"),
      published_at: publicationDate(status, publishedAt),
    },
  };
}

export function validateEpisode(input: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const statusValue = text(input, "status") || "draft";
  const status = validStatus(statusValue) ? statusValue : "draft";
  const seriesId = text(input, "series_id");
  const episodeNumber = positiveInteger(input, "episode_number");
  const suppliedTitle = text(input, "title");
  const title = suppliedTitle || (status === "draft" && episodeNumber ? `Untitled Episode ${String(episodeNumber).padStart(2, "0")}` : "");
  const slug = text(input, "slug");
  const thumbnailUrl = optionalText(input, "thumbnail_url");
  const youtubeUrl = optionalText(input, "youtube_url");
  const tiktokUrl = optionalText(input, "tiktok_url");
  const publishedAt = optionalText(input, "published_at");

  if (!seriesId) errors.push("Series is required.");
  if (!episodeNumber) errors.push("Episode number must be a positive integer.");
  if (!title) errors.push("Title is required before publishing.");
  if (!slugPattern.test(slug)) errors.push("Slug must contain lowercase letters, numbers, and hyphens only.");
  if (!validStatus(statusValue)) errors.push("Status is invalid.");
  validateOptionalUrl(thumbnailUrl, "Thumbnail URL", errors);
  validateOptionalUrl(youtubeUrl, "YouTube URL", errors);
  validateOptionalUrl(tiktokUrl, "TikTok URL", errors);
  validateOptionalDate(publishedAt, "Published date", errors);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      series_id: seriesId,
      episode_number: episodeNumber,
      slug,
      title,
      exercise_number: positiveInteger(input, "exercise_number"),
      topic: optionalText(input, "topic"),
      description: optionalText(input, "description"),
      thumbnail_url: thumbnailUrl,
      youtube_url: youtubeUrl,
      tiktok_url: tiktokUrl,
      published_at: publicationDate(status, publishedAt),
      status,
    },
  };
}

export function validateCreativeWork(input: Record<string, unknown>): ValidationResult {
  const errors: string[] = [];
  const statusValue = text(input, "status") || "draft";
  const status = validStatus(statusValue) ? statusValue : "draft";
  const projectId = text(input, "project_id");
  const title = text(input, "title");
  const slug = text(input, "slug") || slugify(title);
  const workType = text(input, "work_type") || "experiment";
  const artworkUrl = optionalText(input, "artwork_url");
  const audioUrl = optionalText(input, "audio_url");
  const videoUrl = optionalText(input, "video_url");
  const externalUrl = optionalText(input, "external_url");
  const publishedAt = optionalText(input, "published_at");

  if (!projectId) errors.push("Project is required.");
  if (!title) errors.push("Title is required.");
  if (!slugPattern.test(slug)) errors.push("Slug must contain lowercase letters, numbers, and hyphens only.");
  if (!workTypes.includes(workType as (typeof workTypes)[number])) errors.push("Work type is invalid.");
  if (!validStatus(statusValue)) errors.push("Status is invalid.");
  validateOptionalUrl(artworkUrl, "Artwork URL", errors);
  validateOptionalUrl(audioUrl, "Audio URL", errors);
  validateOptionalUrl(videoUrl, "YouTube demo URL", errors);
  validateOptionalUrl(externalUrl, "External project URL", errors);
  validateOptionalDate(publishedAt, "Published date", errors);

  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    data: {
      project_id: projectId,
      title,
      slug,
      subtitle: optionalText(input, "subtitle"),
      description: optionalText(input, "description"),
      work_type: workType,
      tool_used: optionalText(input, "tool_used"),
      artwork_url: artworkUrl,
      audio_url: audioUrl,
      video_url: videoUrl,
      external_url: externalUrl,
      composition_date: optionalText(input, "composition_date"),
      published_at: publicationDate(status, publishedAt),
      featured: Boolean(input.featured),
      featured_order: nonNegativeInteger(input, "featured_order"),
      status,
    },
  };
}

export function validateResource(resource: AdminResource, input: Record<string, unknown>) {
  if (resource === "series") return validateSeries(input);
  if (resource === "episode") return validateEpisode(input);
  return validateCreativeWork(input);
}
