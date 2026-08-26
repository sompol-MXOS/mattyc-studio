import "server-only";

import { cache } from "react";
import { getSupabaseAdmin } from "./supabase-admin";
import {
  MATTYC_CONTENT_TABLES,
  type CreativeWork,
  type EducationalSeries,
  type SeriesEpisode,
  type StudioProject,
} from "./mattyc-content-types";

export type ContentState = "ready" | "unconfigured" | "error";

export type ContentResult<T> = {
  data: T;
  state: ContentState;
  error: string | null;
};

export type StudioSnapshot = {
  educationalProject: StudioProject | null;
  originalsProject: StudioProject | null;
  featuredSeries: EducationalSeries | null;
  episodeCount: number | null;
  originalWorkCount: number | null;
};

const projectColumns =
  "id,slug,title,subtitle,description,project_type,cover_image_url,featured,featured_order,status,start_date,published_at,created_at,updated_at";
const seriesColumns =
  "id,project_id,slug,title,subtitle,description,cover_image_url,featured,display_order,status,started_at,published_at,created_at,updated_at";
const episodeColumns =
  "id,series_id,episode_number,slug,title,exercise_number,topic,description,thumbnail_url,youtube_url,tiktok_url,published_at,status,created_at,updated_at";
const workColumns =
  "id,project_id,slug,title,subtitle,description,work_type,tool_used,artwork_url,audio_url,video_url,external_url,composition_date,published_at,featured,featured_order,status,created_at,updated_at";

function getStudioContentClient() {
  return getSupabaseAdmin();
}

function unavailable<T>(data: T): ContentResult<T> {
  return { data, state: "unconfigured", error: null };
}

export const getStudioSnapshot = cache(async (): Promise<ContentResult<StudioSnapshot>> => {
  const empty: StudioSnapshot = {
    educationalProject: null,
    originalsProject: null,
    featuredSeries: null,
    episodeCount: null,
    originalWorkCount: null,
  };

  const supabase = getStudioContentClient();
  if (!supabase) {
    return unavailable(empty);
  }

  const { data: projects, error: projectError } = await supabase
    .from(MATTYC_CONTENT_TABLES.projects)
    .select(projectColumns)
    .in("slug", ["educational-series", "originals-experiments"])
    .eq("status", "published");

  if (projectError) {
    return { data: empty, state: "error", error: projectError.message };
  }

  const typedProjects = (projects ?? []) as StudioProject[];
  const educationalProject =
    typedProjects.find((project) => project.slug === "educational-series") ?? null;
  const originalsProject =
    typedProjects.find((project) => project.slug === "originals-experiments") ?? null;

  let featuredSeries: EducationalSeries | null = null;
  let episodeCount: number | null = null;
  let originalWorkCount: number | null = null;

  if (educationalProject) {
    const { data: series } = await supabase
      .from(MATTYC_CONTENT_TABLES.series)
      .select(seriesColumns)
      .eq("project_id", educationalProject.id)
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    featuredSeries = (series as EducationalSeries | null) ?? null;

    if (featuredSeries) {
      const { count } = await supabase
        .from(MATTYC_CONTENT_TABLES.episodes)
        .select("id", { count: "exact", head: true })
        .eq("series_id", featuredSeries.id)
        .eq("status", "published");
      episodeCount = count;
    }
  }

  if (originalsProject) {
    const { count } = await supabase
      .from(MATTYC_CONTENT_TABLES.creativeWorks)
      .select("id", { count: "exact", head: true })
      .eq("project_id", originalsProject.id)
      .eq("status", "published");
    originalWorkCount = count;
  }

  return {
    data: {
      educationalProject,
      originalsProject,
      featuredSeries,
      episodeCount,
      originalWorkCount,
    },
    state: "ready",
    error: null,
  };
});

export const getEducationalSeries = cache(
  async (): Promise<ContentResult<EducationalSeries[]>> => {
    const supabase = getStudioContentClient();
    if (!supabase) {
      return unavailable([]);
    }

    const { data: project, error: projectError } = await supabase
      .from(MATTYC_CONTENT_TABLES.projects)
      .select("id")
      .eq("slug", "educational-series")
      .eq("status", "published")
      .maybeSingle();

    if (projectError) {
      return { data: [], state: "error", error: projectError.message };
    }

    if (!project) {
      return { data: [], state: "ready", error: null };
    }

    const { data, error } = await supabase
      .from(MATTYC_CONTENT_TABLES.series)
      .select(seriesColumns)
      .eq("project_id", project.id)
      .eq("status", "published")
      .order("display_order", { ascending: true });

    return {
      data: (data ?? []) as EducationalSeries[],
      state: error ? "error" : "ready",
      error: error?.message ?? null,
    };
  },
);

export const getSeriesWithEpisodes = cache(
  async (
    slug: string,
  ): Promise<ContentResult<{ series: EducationalSeries | null; episodes: SeriesEpisode[] }>> => {
    const empty = { series: null, episodes: [] };

    const supabase = getStudioContentClient();
    if (!supabase) {
      return unavailable(empty);
    }

    const { data: project, error: projectError } = await supabase
      .from(MATTYC_CONTENT_TABLES.projects)
      .select("id")
      .eq("slug", "educational-series")
      .eq("status", "published")
      .maybeSingle();

    if (projectError) {
      return { data: empty, state: "error", error: projectError.message };
    }

    if (!project) {
      return { data: empty, state: "ready", error: null };
    }

    const { data: series, error: seriesError } = await supabase
      .from(MATTYC_CONTENT_TABLES.series)
      .select(seriesColumns)
      .eq("project_id", project.id)
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (seriesError) {
      return { data: empty, state: "error", error: seriesError.message };
    }

    if (!series) {
      return { data: empty, state: "ready", error: null };
    }

    const typedSeries = series as EducationalSeries;
    const { data: episodes, error } = await supabase
      .from(MATTYC_CONTENT_TABLES.episodes)
      .select(episodeColumns)
      .eq("series_id", typedSeries.id)
      .eq("status", "published")
      .order("episode_number", { ascending: true });

    return {
      data: {
        series: typedSeries,
        episodes: (episodes ?? []) as SeriesEpisode[],
      },
      state: error ? "error" : "ready",
      error: error?.message ?? null,
    };
  },
);

export const getCreativeWorks = cache(async (): Promise<ContentResult<CreativeWork[]>> => {
  const supabase = getStudioContentClient();
  if (!supabase) {
    return unavailable([]);
  }

  const { data: project, error: projectError } = await supabase
    .from(MATTYC_CONTENT_TABLES.projects)
    .select("id")
    .eq("slug", "originals-experiments")
    .eq("status", "published")
    .maybeSingle();

  if (projectError) {
    return { data: [], state: "error", error: projectError.message };
  }

  if (!project) {
    return { data: [], state: "ready", error: null };
  }

  const { data, error } = await supabase
    .from(MATTYC_CONTENT_TABLES.creativeWorks)
    .select(workColumns)
    .eq("project_id", project.id)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("featured_order", { ascending: true, nullsFirst: false })
    .order("published_at", { ascending: false, nullsFirst: false });

  return {
    data: (data ?? []) as CreativeWork[],
    state: error ? "error" : "ready",
    error: error?.message ?? null,
  };
});
