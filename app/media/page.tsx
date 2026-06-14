import { SectionHeader } from "../components/SectionHeader";
import { mediaPlaceholders } from "../data";

export default function MediaPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Media"
        title="A refined archive for photos, videos, performances, and press."
        copy="This v1 uses visual placeholders until real assets are placed in public/images/matt/ and public/videos/."
      />
      <div className="media-grid">
        {mediaPlaceholders.map((item, index) => (
          <article className="media-tile" key={item}>
            <div className="media-placeholder">{String(index + 1).padStart(2, "0")}</div>
            <h2>{item}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}
