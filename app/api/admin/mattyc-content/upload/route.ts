import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../../../../lib/admin-auth";
import {
  createImageStoragePath,
  hasExpectedImageSignature,
  isMattycImageFolder,
  MATTYC_CONTENT_BUCKET,
  validateImageFile,
} from "../../../../../lib/mattyc-image-upload";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  const authenticated = verifyAdminSessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
  );
  if (!authenticated) {
    return NextResponse.json({ error: "Admin session required." }, { status: 401 });
  }
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const folder = formData?.get("folder");
  const slug = formData?.get("slug");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  }
  if (!isMattycImageFolder(folder)) {
    return NextResponse.json({ error: "Unknown image destination." }, { status: 400 });
  }
  if (typeof slug !== "string" || !slug.trim()) {
    return NextResponse.json({ error: "Enter a title or slug before uploading." }, { status: 400 });
  }

  const validation = validateImageFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server-side Supabase admin access is not configured." },
      { status: 503 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!hasExpectedImageSignature(bytes, file.type)) {
    return NextResponse.json(
      { error: "The file contents do not match the selected image type." },
      { status: 400 },
    );
  }

  const path = createImageStoragePath(folder, slug, file.type, crypto.randomUUID());
  const { error } = await supabase.storage.from(MATTYC_CONTENT_BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = supabase.storage.from(MATTYC_CONTENT_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
}
