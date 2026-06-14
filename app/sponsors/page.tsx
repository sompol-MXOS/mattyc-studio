import { SectionHeader } from "../components/SectionHeader";
import { sponsorNames } from "../data";

export default function SponsorsPage() {
  return (
    <section className="page-shell sponsors-page">
      <SectionHeader
        eyebrow="Sponsors"
        title="Tools and people supporting the journey."
        copy="This page is not a corporate deck. It is a place to recognize the sound, gear, and creative ecosystem helping the work become real."
      />
      <div className="sponsor-list">
        {sponsorNames.map((name, index) => (
          <div className="sponsor-line" key={name}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
