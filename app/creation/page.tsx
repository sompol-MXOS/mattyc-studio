import type { Metadata } from "next";
import Link from "next/link";
import { getStudioSnapshot } from "../../lib/studio-content";
import { creationAreas } from "../data";

export const metadata: Metadata = {
  title: "Creation | MattYC.studio",
  description:
    "What Matt creates, explores, documents, and shares beyond interpreting existing repertoire.",
};

export const revalidate = 60;

export default async function CreationPage() {
  const { data } = await getStudioSnapshot();
  const seriesTitle = data.featuredSeries?.title ?? "Hanon A-Day";

  return (
    <>
      <section className="page-photo-hero creation-hero">
        <img className="page-hero-image" src="/images/matt-creation.jpg" alt="Matt creating music at a keyboard" />
        <div className="page-hero-overlay">
          <p className="eyebrow">Creation</p>
          <h1>Creation is where I want to keep exploring.</h1>
          <p>
            I am interested in the space after practice: original music, voice, production, band
            ideas, AI tools, sound for games, and the next experiment that does not have a name yet.
          </p>
        </div>
      </section>

      <section className="page-shell creation-page after-photo-hero">
        <div className="split-note">
          <p>Classical piano gives me the discipline. Creation gives me the questions.</p>
          <ul>
            {creationAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
        <div className="signal-strip" aria-label="Abstract studio signal placeholder" />

        <section className="creation-hub" aria-labelledby="creation-hub-title">
          <div className="creation-hub-intro">
            <p className="eyebrow">Inside creation</p>
            <h2 id="creation-hub-title">What I make, explore, document, and share.</h2>
          </div>

          <div className="creation-hub-list">
            <article className="creation-hub-row">
              <span>01</span>
              <div>
                <p className="eyebrow">Learn / test / share</p>
                <h3>Educational Series by MattYC</h3>
                <p>
                  Ideas from my practice room—explored, tested, and shared as part
                  of my own learning process.
                </p>
                <p className="creation-hub-current">
                  Currently featuring: {seriesTitle}
                  {data.episodeCount !== null ? ` / ${data.episodeCount} episodes` : ""}
                </p>
                <Link className="text-link" href="/creation/educational-series">
                  Explore educational series
                </Link>
              </div>
            </article>

            <article className="creation-hub-row">
              <span>02</span>
              <div>
                <p className="eyebrow">Compose / experiment / discover</p>
                <h3>Originals &amp; Experiments</h3>
                <p>
                  From playing music to making music through small original ideas,
                  sound, and technology.
                </p>
                <p className="creation-hub-current">
                  Including experiments made with Chrome Music Lab
                  {data.originalWorkCount !== null ? ` / ${data.originalWorkCount} works` : ""}
                </p>
                <Link className="text-link" href="/creation/originals">
                  Explore originals
                </Link>
              </div>
            </article>
          </div>
        </section>
      </section>
    </>
  );
}
