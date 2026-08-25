import type { Metadata } from "next";
import Link from "next/link";
import { getEducationalSeries } from "../../../lib/studio-content";

export const metadata: Metadata = {
  title: "Educational Series by MattYC | MattYC.studio",
  description:
    "Ideas, exercises, and discoveries from Matt's own piano practice, explored one series at a time.",
};

export const revalidate = 60;

export default async function EducationalSeriesPage() {
  const result = await getEducationalSeries();

  return (
    <section className="page-shell studio-archive">
      <nav className="studio-breadcrumb" aria-label="Breadcrumb">
        <Link href="/creation">Creation</Link>
        <span>/</span>
        <span>Educational Series</span>
      </nav>

      <header className="studio-archive-header">
        <p className="eyebrow">Ideas from the practice room</p>
        <h1>Educational Series by MattYC</h1>
        <p>
          I explore exercises, questions, and discoveries from my own learning,
          then share what I notice one series at a time.
        </p>
      </header>

      {result.data.length > 0 ? (
        <div className="series-list">
          {result.data.map((series, index) => (
            <article className="series-list-row" key={series.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {series.cover_image_url ? (
                <img
                  className="series-cover"
                  src={series.cover_image_url}
                  alt={`${series.title} series cover`}
                  loading="lazy"
                />
              ) : (
                <div className="series-cover series-cover-placeholder" aria-hidden="true" />
              )}
              <div>
                <p className="eyebrow">Educational Series by MattYC</p>
                <h2>{series.title}</h2>
                {series.subtitle ? <p className="series-subtitle">{series.subtitle}</p> : null}
                {series.description ? <p>{series.description}</p> : null}
                <Link
                  className="text-link"
                  href={`/creation/educational-series/${series.slug}`}
                >
                  View the series
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="studio-empty">
          <p className="eyebrow">Archive in progress</p>
          <h2>The first series is being catalogued.</h2>
          <p>
            Hanon A-Day will appear here when its real episode information has
            been added and published.
          </p>
        </div>
      )}
    </section>
  );
}
