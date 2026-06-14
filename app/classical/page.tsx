import { SectionHeader } from "../components/SectionHeader";
import { repertoire } from "../data";

export default function ClassicalPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Classical"
        title="The discipline underneath everything else."
        copy="Classical piano is the foundation: technical refinement, serious repertoire, competition standards, and the practice ethic that carries into every creative direction."
      />
      <div className="repertoire-grid">
        {repertoire.map((piece) => (
          <article className="repertoire-card" key={piece}>
            <span>Repertoire</span>
            <h2>{piece}</h2>
          </article>
        ))}
      </div>
      <div className="wide-panel classical-note">
        <h2>Foundation, not limitation</h2>
        <p>
          The classical track is presented as a lifelong standard and discipline, not a constraint on
          Matt's broader creator future.
        </p>
      </div>
    </section>
  );
}
