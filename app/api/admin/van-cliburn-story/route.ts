import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../../../lib/admin-auth";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";
import type { VanCliburnStoryEntry } from "../../../../lib/supabase";
import {
  validateVanCliburnStory,
  VAN_CLIBURN_STORY_TABLE,
} from "../../../../lib/van-cliburn-story";

const storyColumns =
  "id,title,chapter_label,entry_date,category,excerpt,body,image_url,is_published,is_archived,display_order,created_at,updated_at";

function authenticated(request: NextRequest) {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || origin === request.nextUrl.origin;
}

function unauthorized() {
  return NextResponse.json({ error: "Admin session required." }, { status: 401 });
}

function adminUnavailable() {
  return NextResponse.json(
    { error: "Server-side Supabase admin access is not configured." },
    { status: 503 },
  );
}

function revalidateStory() {
  revalidatePath("/journey/road-to-2027-van-cliburn");
}

export async function GET(request: NextRequest) {
  if (!authenticated(request)) return unauthorized();
  const supabase = getSupabaseAdmin();
  if (!supabase) return adminUnavailable();

  const { data, error } = await supabase
    .from(VAN_CLIBURN_STORY_TABLE)
    .select(storyColumns)
    .order("display_order", { ascending: true })
    .order("entry_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error?.code === "42703" && error.message.includes("is_archived")) {
    const fallback = await supabase
      .from(VAN_CLIBURN_STORY_TABLE)
      .select(
        "id,title,chapter_label,entry_date,category,excerpt,body,image_url,is_published,display_order,created_at,updated_at",
      )
      .order("display_order", { ascending: true })
      .order("entry_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    if (fallback.error) {
      return NextResponse.json({ error: fallback.error.message }, { status: 500 });
    }
    const entries = (fallback.data ?? []).map((entry) => ({
      ...entry,
      is_archived: false,
    })) as VanCliburnStoryEntry[];
    return NextResponse.json({ entries, migrationRequired: true });
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    entries: (data ?? []) as VanCliburnStoryEntry[],
    migrationRequired: false,
  });
}

type MutationBody = {
  id?: unknown;
  data?: unknown;
};

function parseMutation(body: MutationBody | null) {
  if (!body?.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return { error: "Story data is required." } as const;
  }
  const validation = validateVanCliburnStory(body.data as Record<string, unknown>);
  if (!validation.ok) return { error: validation.errors.join(" ") } as const;
  return { data: validation.data } as const;
}

export async function POST(request: NextRequest) {
  if (!authenticated(request)) return unauthorized();
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return adminUnavailable();

  const body = (await request.json().catch(() => null)) as MutationBody | null;
  const parsed = parseMutation(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(VAN_CLIBURN_STORY_TABLE)
    .insert(parsed.data)
    .select(storyColumns)
    .single();
  if (error?.code === "42703" && error.message.includes("is_archived")) {
    return NextResponse.json(
      { error: "The reviewed Van Cliburn archive migration must be applied before saving." },
      { status: 503 },
    );
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidateStory();
  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  if (!authenticated(request)) return unauthorized();
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return adminUnavailable();

  const body = (await request.json().catch(() => null)) as MutationBody | null;
  const id = typeof body?.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "Story ID is required." }, { status: 400 });
  const parsed = parseMutation(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(VAN_CLIBURN_STORY_TABLE)
    .update(parsed.data)
    .eq("id", id)
    .select(storyColumns)
    .single();
  if (error?.code === "42703" && error.message.includes("is_archived")) {
    return NextResponse.json(
      { error: "The reviewed Van Cliburn archive migration must be applied before saving." },
      { status: 503 },
    );
  }
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidateStory();
  return NextResponse.json({ data });
}
