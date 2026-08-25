export type PublicationStatus = "draft" | "published" | "archived";

export type StudioProject = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  project_type: string;
  cover_image_url: string | null;
  featured: boolean;
  featured_order: number | null;
  status: PublicationStatus;
  start_date: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type EducationalSeries = {
  id: string;
  project_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  cover_image_url: string | null;
  featured: boolean;
  display_order: number;
  status: PublicationStatus;
  started_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SeriesEpisode = {
  id: string;
  series_id: string;
  episode_number: number;
  slug: string;
  title: string;
  exercise_number: number | null;
  topic: string | null;
  description: string | null;
  thumbnail_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  published_at: string | null;
  status: PublicationStatus;
  created_at: string;
  updated_at: string;
};

export type CreativeWork = {
  id: string;
  project_id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  work_type: string;
  tool_used: string | null;
  artwork_url: string | null;
  audio_url: string | null;
  video_url: string | null;
  external_url: string | null;
  composition_date: string | null;
  published_at: string | null;
  featured: boolean;
  featured_order: number | null;
  status: PublicationStatus;
  created_at: string;
  updated_at: string;
};

export const MATTYC_CONTENT_TABLES = {
  projects: "mattyc_projects",
  series: "mattyc_series",
  episodes: "mattyc_episodes",
  creativeWorks: "mattyc_creative_works",
} as const;

export type MattYCContentTableName =
  (typeof MATTYC_CONTENT_TABLES)[keyof typeof MATTYC_CONTENT_TABLES];

export type AdminContentData = {
  projects: StudioProject[];
  series: EducationalSeries[];
  episodes: SeriesEpisode[];
  creativeWorks: CreativeWork[];
};
