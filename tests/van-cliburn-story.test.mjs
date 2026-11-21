import assert from "node:assert/strict";
import test from "node:test";
import {
  createVanCliburnImagePath,
  validateVanCliburnStory,
} from "../lib/van-cliburn-story.ts";

test("normalizes a Van Cliburn draft without losing story content", () => {
  const result = validateVanCliburnStory({
    title: "  The first decision  ",
    chapter_label: " Chapter 01 ",
    entry_date: "2026-11-21",
    category: "decision",
    excerpt: "A short introduction.",
    body: "The complete story.\n\nA second paragraph.",
    display_order: "2",
    is_published: false,
    is_archived: false,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.title, "The first decision");
  assert.equal(result.data.display_order, 2);
  assert.equal(result.data.body, "The complete story.\n\nA second paragraph.");
});

test("forces archived stories to remain unpublished", () => {
  const result = validateVanCliburnStory({
    title: "Archived chapter",
    display_order: 0,
    is_published: true,
    is_archived: true,
  });

  assert.equal(result.ok, true);
  assert.equal(result.data.is_archived, true);
  assert.equal(result.data.is_published, false);
});

test("rejects unsafe URLs and invalid display order", () => {
  const result = validateVanCliburnStory({
    title: "Invalid story",
    image_url: "javascript:alert(1)",
    display_order: "1.5",
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join(" "), /Image URL/);
  assert.match(result.errors.join(" "), /Display order/);
});

test("creates stable Van Cliburn image paths", () => {
  assert.equal(
    createVanCliburnImagePath("Chapter 01 / First Steps", "image/webp", "fixed-id"),
    "story-images/chapter-01-first-steps/fixed-id.webp",
  );
});
