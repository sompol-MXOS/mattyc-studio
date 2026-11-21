import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../../../../lib/admin-auth";
import { getSupabaseAdmin } from "../../../../../lib/supabase-admin";
import {
  createVanCliburnImagePath,
  hasExpectedImageSignature,
  validateImageFile,
  VAN_CLIBURN_IMAGE_BUCKET,
} from "../../../../../lib/van-cliburn-story";

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
  const title = formData?.get("title");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "An image file is required." }, { status: 400 });
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Enter a story title before uploading." },
      { status: 400 },
    );
  }

  const validation = validateImageFile(file);
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!hasExpectedImageSignature(bytes, file.type)) {
    return NextResponse.json(
      { error: "The file contents do not match the selected image type." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Server-side Supabase admin access is not configured." },
      { status: 503 },
    );
  }

  const path = createVanCliburnImagePath(title, file.type);
  const { error } = await supabase.storage.from(VAN_CLIBURN_IMAGE_BUCKET).upload(path, bytes, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data } = supabase.storage.from(VAN_CLIBURN_IMAGE_BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
}
