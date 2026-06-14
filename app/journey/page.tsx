import { SectionHeader } from "../components/SectionHeader";
import { journeyLines } from "../data";

export default function JourneyPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Journey"
        title="This is not a perfect story. It is a record of getting better."
        copy="I want this page to hold the practice, the competitions, the pressure, the mistakes, and the moments that make the next step possible."
      />
      <div className="editorial-list">
        {journeyLines.map((item, index) => (
          <article className="editorial-row" key={item.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.copy}</p>
            </div>
          </article>
        ))}
      </div>
      <p className="large-note">
        I am building this slowly. Not as a final resume, but as an archive of becoming more serious,
        more curious, and more honest with the work.
      </p>
    </section>
  );
}
