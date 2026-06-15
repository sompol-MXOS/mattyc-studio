import { SectionHeader } from "../components/SectionHeader";
import { mediaPlaceholders } from "../data";

export default function MediaPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Media"
        title="Photos, videos, and fragments from the work."
        copy="This is where I collect photos, videos, performances, practice moments, competitions, and ideas from the work I am building."
      />
      <div className="media-stream">
        {mediaPlaceholders.map((item, index) => (
          <article className="media-row" key={item}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{item}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}
