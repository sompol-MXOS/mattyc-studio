import { SectionHeader } from "../components/SectionHeader";
import { milestones } from "../data";

export default function JourneyPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Journey"
        title="A growth archive built around discipline, range, and momentum."
        copy="MattYC.studio tracks practice, competition preparation, milestones, and the wider creator path without reducing the story to one lane."
      />
      <div className="timeline">
        {milestones.map((item, index) => (
          <article className="timeline-item" key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <p className="card-eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </div>
          </article>
        ))}
      </div>
      <div className="wide-panel">
        <h2>Archive direction</h2>
        <p>
          Future entries can capture competitions, repertoire milestones, recording sessions,
          concerts, collaborations, essays, business experiments, and creative technology projects.
        </p>
      </div>
    </section>
  );
}
