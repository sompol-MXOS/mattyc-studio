import Image from "next/image";
import Link from "next/link";
import { getStudioSnapshot } from "../../lib/studio-content";

function CountLabel({ count, singular }: { count: number | null; singular: string }) {
  if (count === null) {
    return null;
  }

  return (
    <span className="studio-card-count">
      {count} {count === 1 ? singular : `${singular}s`}
    </span>
  );
}

export function CurrentlyAtStudioLoading() {
  return (
    <section className="studio-now page-shell" aria-busy="true">
      <div className="studio-now-heading">
        <p className="eyebrow">Currently at the studio</p>
        <h2>What I am working on now.</h2>
      </div>
      <div className="studio-now-grid">
        <div className="studio-card studio-card-skeleton" aria-hidden="true">
          <div className="studio-card-image" />
          <div className="studio-card-copy" />
        </div>
        <div className="studio-card studio-card-skeleton" aria-hidden="true">
          <div className="studio-card-image" />
          <div className="studio-card-copy" />
        </div>
      </div>
    </section>
  );
}

export async function CurrentlyAtStudio() {
  const { data } = await getStudioSnapshot();
  const seriesTitle = data.featuredSeries?.title ?? "Hanon A-Day";

  return (
    <section className="studio-now page-shell" aria-labelledby="studio-now-title">
      <div className="studio-now-heading">
        <p className="eyebrow">Currently at the studio</p>
        <h2 id="studio-now-title">What I am working on now.</h2>
        <p>A small live view of the ideas being practised, tested, and made.</p>
      </div>

      <div className="studio-now-grid">
        <article className="studio-card">
          <div className="studio-card-image studio-card-image-practice">
            <Image
              src="/images/studio/practice-room.jpg"
              alt="Matt practising on a Steinway grand piano"
              fill
              sizes="(max-width: 900px) calc(100vw - 40px), 50vw"
            />
            <span className="studio-card-number" aria-hidden="true">01</span>
          </div>
          <div className="studio-card-copy">
            <p className="eyebrow">Educational Series by MattYC</p>
            <h3>Ideas from my practice room.</h3>
            <p>
              I share exercises, questions, and discoveries from my own piano
              practice as I work through them.
            </p>
            <div className="studio-card-meta">
              <span>Currently featuring: {seriesTitle}</span>
              <CountLabel count={data.episodeCount} singular="episode" />
            </div>
            <Link className="text-link" href="/creation/educational-series">
              Explore the series
            </Link>
          </div>
        </article>

        <article className="studio-card">
          <div className="studio-card-image studio-card-image-creation">
            <Image
              src="/images/studio/music-creation.jpg"
              alt="Matt exploring music creation in the studio"
              fill
              sizes="(max-width: 900px) calc(100vw - 40px), 50vw"
            />
            <span className="studio-card-number" aria-hidden="true">02</span>
          </div>
          <div className="studio-card-copy">
            <p className="eyebrow">Originals &amp; Experiments</p>
            <h3>From playing music to making music.</h3>
            <p>
              Small experiments with melody, harmony, rhythm, structure, sound,
              and technology—including Chrome Music Lab.
            </p>
            <div className="studio-card-meta">
              <span>Original and technology-led work</span>
              <CountLabel count={data.originalWorkCount} singular="work" />
            </div>
            <Link className="text-link" href="/creation/originals">
              Explore originals
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
