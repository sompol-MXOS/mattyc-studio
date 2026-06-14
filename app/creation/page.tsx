import { SectionHeader } from "../components/SectionHeader";
import { creationAreas } from "../data";

export default function CreationPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Creation"
        title="From performance into authorship, production, and future media."
        copy="Creation is the forward path: original music, band work, voice, production, AI-assisted exploration, and soundtrack direction for games and media."
      />
      <div className="feature-list">
        {creationAreas.map((area) => (
          <article className="feature-row" key={area}>
            <span />
            <h2>{area}</h2>
          </article>
        ))}
      </div>
      <div className="studio-visual" aria-label="Abstract creation studio placeholder">
        <div />
        <p>Future uploads: demos, sessions, process clips, scoring experiments, and finished releases.</p>
      </div>
    </section>
  );
}
