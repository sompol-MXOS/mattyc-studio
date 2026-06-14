import { SectionHeader } from "../components/SectionHeader";
import { creationAreas } from "../data";

export default function CreationPage() {
  return (
    <section className="page-shell creation-page">
      <SectionHeader
        eyebrow="Creation"
        title="Creation is where I want to keep exploring."
        copy="I am interested in the space after practice: original music, voice, production, band ideas, AI tools, sound for games, and the next experiment that does not have a name yet."
      />
      <div className="split-note">
        <p>
          Classical piano gives me the discipline. Creation gives me the questions.
        </p>
        <ul>
          {creationAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </div>
      <div className="signal-strip" aria-label="Abstract studio signal placeholder" />
    </section>
  );
}
