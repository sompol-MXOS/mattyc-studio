import { SectionHeader } from "../components/SectionHeader";
import { sponsorNames } from "../data";

export default function SponsorsPage() {
  return (
    <section className="page-shell">
      <SectionHeader
        eyebrow="Sponsors"
        title="Sponsors and creative ecosystem."
        copy="Logo-ready sponsor cards for the v1 site. Real marks can be added later with approval and proper asset files."
      />
      <div className="sponsor-grid">
        {sponsorNames.map((name) => (
          <article className="sponsor-card" key={name}>
            <span>Partner</span>
            <h2>{name}</h2>
          </article>
        ))}
      </div>
    </section>
  );
}
