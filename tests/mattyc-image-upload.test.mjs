import assert from "node:assert/strict";
import test from "node:test";
import {
  createImageStoragePath,
  hasExpectedImageSignature,
  isCloseToPortraitRatio,
  isMattycImageFolder,
  MATTYC_IMAGE_MAX_BYTES,
  validateImageFile,
} from "../lib/mattyc-image-upload.ts";

test("accepts only supported image MIME types at no more than 5 MB", () => {
  for (const type of ["image/jpeg", "image/png", "image/webp"]) {
    assert.equal(validateImageFile({ name: `image.${type.split("/")[1]}`, type, size: 1024 }).ok, true);
  }
  assert.equal(validateImageFile({ name: "clip.mp4", type: "video/mp4", size: 1024 }).ok, false);
  assert.equal(validateImageFile({ name: "fake.jpg", type: "application/pdf", size: 1024 }).ok, false);
  assert.equal(validateImageFile({ name: "large.png", type: "image/png", size: MATTYC_IMAGE_MAX_BYTES + 1 }).ok, false);
});

test("checks image signatures instead of trusting the supplied MIME type alone", () => {
  assert.equal(hasExpectedImageSignature(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0]), "image/jpeg"), true);
  assert.equal(hasExpectedImageSignature(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), "image/png"), true);
  assert.equal(hasExpectedImageSignature(Uint8Array.from([82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80]), "image/webp"), true);
  assert.equal(hasExpectedImageSignature(Uint8Array.from([0x25, 0x50, 0x44, 0x46]), "image/jpeg"), false);
});

test("builds unique, prefixed paths with an extension derived from MIME type", () => {
  const path = createImageStoragePath("episodes", "Hanon A-Day / Episode 01", "image/jpeg", "fixed-id");
  assert.equal(path, "episodes/hanon-a-day-episode-01/fixed-id.jpg");
  assert.equal(isMattycImageFolder("originals"), true);
  assert.equal(isMattycImageFolder("videos"), false);
});

test("treats 9:16 and nearby portraits as recommended without making it a constraint", () => {
  assert.equal(isCloseToPortraitRatio(1080, 1920), true);
  assert.equal(isCloseToPortraitRatio(720, 1280), true);
  assert.equal(isCloseToPortraitRatio(1920, 1080), false);
});
