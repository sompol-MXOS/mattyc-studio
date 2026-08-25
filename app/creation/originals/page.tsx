import type { Metadata } from "next";
import Link from "next/link";
import { getCreativeWorks } from "../../../lib/studio-content";

export const metadata: Metadata = {
  title: "Originals & Experiments | MattYC.studio",
  description:
    "Small original explorations of melody, harmony, rhythm, structure, sound, and technology by MattYC.",
};

export const revalidate = 60;

export default async function OriginalsPage() {
  const result = await getCreativeWorks();

  return (
    <section className="page-shell studio-archive">
      <nav className="studio-breadcrumb" aria-label="Breadcrumb">
        <Link href="/creation">Creation</Link>
        <span>/</span>
        <span>Originals &amp; Experiments</span>
      </nav>

      <header className="studio-archive-header originals-header">
        <p className="eyebrow">From playing music to making music</p>
        <h1>Originals &amp; Experiments</h1>
        <p>
          I explore melody, harmony, rhythm, and structure through small original
          experiments—sometimes at the piano, sometimes through technology, and
          sometimes simply by following an idea.
        </p>
      </header>

      {result.data.length > 0 ? (
        <div className="works-grid">
          {result.data.map((work, index) => (
            <article className="work-item" key={work.id}>
              {work.artwork_url ? (
                <img
                  className="work-artwork"
                  src={work.artwork_url}
                  alt={`${work.title} artwork`}
                  loading="lazy"
                />
              ) : (
                <div className="work-artwork work-artwork-placeholder" aria-hidden="true" />
              )}
              <div className="work-copy">
                <div className="work-labels">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <span>{work.work_type.replaceAll("_", " ")}</span>
                </div>
                <h2>{work.title}</h2>
                {work.subtitle ? <p className="work-subtitle">{work.subtitle}</p> : null}
                {work.description ? <p>{work.description}</p> : null}
                {work.tool_used ? <p className="work-tool">Made using {work.tool_used}</p> : null}
                <div className="episode-links">
                  {work.external_url ? (
                    <a href={work.external_url} target="_blank" rel="noreferrer">Explore project</a>
                  ) : null}
                  {work.video_url ? (
                    <a href={work.video_url} target="_blank" rel="noreferrer">Watch</a>
                  ) : null}
                  {work.audio_url ? (
                    <a href={work.audio_url} target="_blank" rel="noreferrer">Listen</a>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="studio-empty">
          <p className="eyebrow">Archive in progress</p>
          <h2>The original work is being catalogued.</h2>
          <p>
            The two current experiments—including their Chrome Music Lab links—will
            appear here after their real titles and details are added.
          </p>
        </div>
      )}
    </section>
  );
}
