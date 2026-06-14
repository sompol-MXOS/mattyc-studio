import Link from "next/link";
import { SectionHeader } from "./components/SectionHeader";
import { milestones } from "./data";

export default function Home() {
  return (
    <>
      <section className="hero split-section">
        <div className="hero-copy">
          <p className="eyebrow">Matt.YC / Creator Portfolio</p>
          <h1>Classical foundation. Creator future.</h1>
          <p>
            Matt.YC is a young creator shaped by classical piano discipline and expanding into
            composition, performance, production, and new creative technologies.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/journey">Explore Journey</Link>
            <Link className="button secondary" href="/creation">Creation Work</Link>
          </div>
        </div>
        <div className="cinema-panel" aria-label="Abstract stage and piano visual placeholder">
          <div className="piano-line" />
          <div className="gold-orbit" />
          <div className="panel-caption">Images later: public/images/matt/</div>
        </div>
      </section>

      <section className="content-band">
        <SectionHeader
          eyebrow="Positioning"
          title="Self-made discipline with a wider creative horizon."
          copy="The studio avoids narrow prodigy language. It frames Matt as serious, disciplined, young, and building for the long term."
        />
        <div className="three-grid">
          {milestones.map((item) => (
            <article className="info-card" key={item.title}>
              <p className="card-eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="quote-band">
        <p>
          Piano stays at the highest level he can sustain for life, while the studio opens toward
          economics, business, media, and original creative work.
        </p>
      </section>
    </>
  );
}
