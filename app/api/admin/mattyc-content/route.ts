import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "../../../../lib/admin-auth";
import {
  MATTYC_CONTENT_TABLES,
  type AdminContentData,
  type CreativeWork,
  type EducationalSeries,
  type SeriesEpisode,
  type StudioProject,
} from "../../../../lib/mattyc-content-types";
import {
  type AdminResource,
  validateResource,
} from "../../../../lib/mattyc-admin-validation";
import { getSupabaseAdmin } from "../../../../lib/supabase-admin";

const resourceTables = {
  series: MATTYC_CONTENT_TABLES.series,
  episode: MATTYC_CONTENT_TABLES.episodes,
  creativeWork: MATTYC_CONTENT_TABLES.creativeWorks,
} as const;

function authenticated(request: NextRequest) {
  return verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

function sameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === request.nextUrl.origin;
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

function revalidatePublicContent() {
  revalidatePath("/");
  revalidatePath("/creation");
  revalidatePath("/creation/educational-series");
  revalidatePath("/creation/educational-series/[seriesSlug]", "page");
  revalidatePath("/creation/originals");
}

export async function GET(request: NextRequest) {
  if (!authenticated(request)) return unauthorized();
  const supabase = getSupabaseAdmin();
  if (!supabase) return adminUnavailable();

  const [projectsResult, seriesResult, episodesResult, worksResult] = await Promise.all([
    supabase.from(MATTYC_CONTENT_TABLES.projects).select("*").order("featured_order"),
    supabase.from(MATTYC_CONTENT_TABLES.series).select("*").order("display_order"),
    supabase.from(MATTYC_CONTENT_TABLES.episodes).select("*").order("episode_number"),
    supabase
      .from(MATTYC_CONTENT_TABLES.creativeWorks)
      .select("*")
      .order("featured", { ascending: false })
      .order("featured_order", { nullsFirst: false }),
  ]);

  const error =
    projectsResult.error ?? seriesResult.error ?? episodesResult.error ?? worksResult.error;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const data: AdminContentData = {
    projects: (projectsResult.data ?? []) as StudioProject[],
    series: (seriesResult.data ?? []) as EducationalSeries[],
    episodes: (episodesResult.data ?? []) as SeriesEpisode[],
    creativeWorks: (worksResult.data ?? []) as CreativeWork[],
  };
  return NextResponse.json(data);
}

type MutationBody = {
  resource?: unknown;
  id?: unknown;
  data?: unknown;
};

function parseMutation(body: MutationBody | null) {
  const resource = body?.resource;
  if (resource !== "series" && resource !== "episode" && resource !== "creativeWork") {
    return { error: "Unknown content type." } as const;
  }
  if (!body?.data || typeof body.data !== "object" || Array.isArray(body.data)) {
    return { error: "Content data is required." } as const;
  }
  const validation = validateResource(resource, body.data as Record<string, unknown>);
  if (!validation.ok) {
    return { error: validation.errors.join(" ") } as const;
  }
  return { resource: resource as AdminResource, data: validation.data } as const;
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
    .from(resourceTables[parsed.resource])
    .insert(parsed.data)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePublicContent();
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
  if (!id) return NextResponse.json({ error: "Content ID is required." }, { status: 400 });
  const parsed = parseMutation(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { data, error } = await supabase
    .from(resourceTables[parsed.resource])
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  revalidatePublicContent();
  return NextResponse.json({ data });
}
