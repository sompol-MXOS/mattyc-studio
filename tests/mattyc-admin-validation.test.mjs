import assert from "node:assert/strict";
import test from "node:test";
import {
  nextEpisodeDraft,
  validateCreativeWork,
  validateEpisode,
  validateSeries,
} from "../lib/mattyc-admin-validation.ts";

test("creates an incomplete Hanon draft with a safe placeholder title", () => {
  const result = validateEpisode({
    series_id: "series-1",
    episode_number: "1",
    slug: "hanon-a-day-01",
    title: "",
    status: "draft",
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.title, "Untitled Episode 01");
  assert.equal(result.data.slug, "hanon-a-day-01");
});

test("preserves a manually edited episode slug during edit and publication", () => {
  const result = validateEpisode({
    series_id: "series-1",
    episode_number: 7,
    slug: "my-manual-hanon-slug",
    title: "A real episode title",
    youtube_url: "https://youtube.com/watch?v=example",
    tiktok_url: "https://www.tiktok.com/@example/video/123",
    status: "published",
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.slug, "my-manual-hanon-slug");
  assert.equal(typeof result.data.published_at, "string");
});

test("Save & Add Next increments the number, creates the default slug, and clears episode content", () => {
  const next = nextEpisodeDraft(
    {
      series_id: "series-1",
      episode_number: "9",
      status: "draft",
      title: "Previous title",
      youtube_url: "https://youtube.com/example",
    },
    "hanon-a-day",
  );

  assert.equal(next.series_id, "series-1");
  assert.equal(next.episode_number, "10");
  assert.equal(next.slug, "hanon-a-day-10");
  assert.equal(next.title, "");
  assert.equal(next.youtube_url, "");
  assert.equal(next.status, "draft");
});

test("creates and edits a Chrome Music Lab creative work payload", () => {
  const created = validateCreativeWork({
    project_id: "project-1",
    title: "Small music experiment",
    slug: "small-music-experiment",
    work_type: "experiment",
    tool_used: "Chrome Music Lab",
    external_url: "https://musiclab.chromeexperiments.com/Song-Maker/song/example",
    status: "draft",
  });
  assert.equal(created.ok, true);
  assert.equal(created.data.tool_used, "Chrome Music Lab");

  const edited = validateCreativeWork({
    ...created.data,
    description: "Updated description",
    status: "published",
  });
  assert.equal(edited.ok, true);
  assert.equal(edited.data.description, "Updated description");
  assert.equal(typeof edited.data.published_at, "string");
});

test("creates a Hanon child series under the educational project", () => {
  const result = validateSeries({
    project_id: "educational-project",
    title: "Hanon A-Day",
    slug: "hanon-a-day",
    status: "published",
    display_order: 1,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.project_id, "educational-project");
  assert.equal(result.data.slug, "hanon-a-day");
});
