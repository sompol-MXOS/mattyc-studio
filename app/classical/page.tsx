import { SectionHeader } from "../components/SectionHeader";
import { repertoire } from "../data";

export default function ClassicalPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Classical"
        title="Classical music is my foundation."
        copy="Piano taught me how to stay with difficult things. Technique, sound, rhythm, memory, patience: I keep returning to these because they make everything else stronger."
      />
      <p className="large-note">
        I want to keep piano at the highest level I can for life, even while I build into other worlds.
      </p>
      <div className="repertoire-list" aria-label="Repertoire notes">
        {repertoire.map((piece, index) => (
          <div className="repertoire-line" key={piece}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{piece}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
