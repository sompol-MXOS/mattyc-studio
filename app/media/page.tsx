import { SectionHeader } from "../components/SectionHeader";
import { mediaPlaceholders } from "../data";

export default function MediaPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Media"
        title="Photos, videos, and fragments from the work."
        copy="For now this is a quiet archive map. Real images can live in public/images/matt/ and videos can live in public/videos/ when they are ready."
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
