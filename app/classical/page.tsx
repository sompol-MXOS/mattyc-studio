import Image from "next/image";
import { repertoire } from "../data";

export default function ClassicalPage() {
  return (
    <>
      <section className="page-photo-hero classical-hero">
        <Image
          src="/images/matt/classical.png"
          alt="Matt.YC seated at a grand piano in a classical performance pose"
          fill
          priority
          sizes="100vw"
          className="page-hero-image"
        />
        <div className="page-hero-overlay classical-overlay">
          <p className="eyebrow">Classical</p>
          <h1>Classical is where I learned discipline.</h1>
          <p>
            I do not play classical music because it is old. I play it because it teaches
            control, patience, courage, and honesty.
          </p>
        </div>
      </section>

      <section className="page-shell after-photo-hero">
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
    </>
  );
}
