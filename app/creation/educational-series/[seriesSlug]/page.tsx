import type { Metadata } from "next";
import Link from "next/link";
import { getSeriesWithEpisodes } from "../../../../lib/studio-content";

export const revalidate = 60;

type SeriesPageProps = {
  params: Promise<{ seriesSlug: string }>;
};

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata(
  props: SeriesPageProps,
): Promise<Metadata> {
  const { seriesSlug } = await props.params;
  const result = await getSeriesWithEpisodes(seriesSlug);
  const title = result.data.series?.title ?? titleFromSlug(seriesSlug);

  return {
    title: `${title} | Educational Series by MattYC`,
    description:
      result.data.series?.description ??
      `${title}, an Educational Series by MattYC based on discoveries from piano practice.`,
  };
}

export default async function SeriesPage(
  props: SeriesPageProps,
) {
  const { seriesSlug } = await props.params;
  const result = await getSeriesWithEpisodes(seriesSlug);
  const { series, episodes } = result.data;
  const title = series?.title ?? titleFromSlug(seriesSlug);

  return (
    <section className="page-shell studio-archive">
      <nav className="studio-breadcrumb" aria-label="Breadcrumb">
        <Link href="/creation">Creation</Link>
        <span>/</span>
        <Link href="/creation/educational-series">Educational Series by MattYC</Link>
        <span>/</span>
        <span>{title}</span>
      </nav>

      <header className="series-detail-header">
        <div>
          <p className="eyebrow">Educational Series by MattYC</p>
          <h1>{title}</h1>
          {series?.subtitle ? <p className="series-detail-subtitle">{series.subtitle}</p> : null}
          {series?.description ? <p>{series.description}</p> : null}
          {series ? (
            <p className="series-detail-count">
              {episodes.length} published {episodes.length === 1 ? "episode" : "episodes"}
            </p>
          ) : null}
        </div>
        {series?.cover_image_url ? (
          <img
            className="series-detail-cover"
            src={series.cover_image_url}
            alt={`${series.title} series cover`}
          />
        ) : (
          <div className="series-detail-cover series-cover-placeholder" aria-hidden="true" />
        )}
      </header>

      <div className="episode-heading">
        <p className="eyebrow">The series</p>
        <h2>Episode archive</h2>
      </div>

      {episodes.length > 0 ? (
        <div className="episode-grid">
          {episodes.map((episode) => (
            <article className="episode-item" key={episode.id}>
              <div className="episode-thumbnail-frame">
                {episode.thumbnail_url ? (
                  <img
                    className="episode-thumbnail"
                    src={episode.thumbnail_url}
                    alt={`${episode.title} thumbnail`}
                    loading="lazy"
                  />
                ) : (
                  <div className="episode-thumbnail episode-thumbnail-placeholder" aria-hidden="true" />
                )}
              </div>
              <div className="episode-copy">
                <div className="episode-labels">
                  <span>EP. {String(episode.episode_number).padStart(2, "0")}</span>
                  {episode.exercise_number !== null ? (
                    <span>Hanon No. {episode.exercise_number}</span>
                  ) : null}
                </div>
                <h3>{episode.title}</h3>
                {episode.topic ? <p className="episode-topic">{episode.topic}</p> : null}
                {episode.description ? <p>{episode.description}</p> : null}
                <div className="episode-links">
                  {episode.youtube_url ? (
                    <a href={episode.youtube_url} target="_blank" rel="noreferrer">YouTube</a>
                  ) : null}
                  {episode.tiktok_url ? (
                    <a href={episode.tiktok_url} target="_blank" rel="noreferrer">TikTok</a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="studio-empty">
          <p className="eyebrow">Archive in progress</p>
          <h2>{series ? "No published episodes yet." : "This series is not available yet."}</h2>
          <p>
            {series
              ? "Episodes will appear here when they are published."
              : "The studio archive may still be connecting, or this series has not been published."}
          </p>
        </div>
      )}
    </section>
  );
}
