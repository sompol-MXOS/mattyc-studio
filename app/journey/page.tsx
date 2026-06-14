import Image from "next/image";
import { journeyLines } from "../data";

export default function JourneyPage() {
  return (
    <>
      <section className="page-photo-hero journey-hero">
        <Image
          src="/images/matt/journey.jpg"
          alt="Matt.YC on stage during a performance"
          fill
          priority
          sizes="100vw"
          className="page-hero-image"
        />
        <div className="page-hero-overlay">
          <p className="eyebrow">Journey</p>
          <h1>The journey is still being built.</h1>
          <p>
            I want this page to remember the work: the stages, the practice, the mistakes,
            and the moments that keep pushing me forward.
          </p>
        </div>
      </section>

      <section className="page-shell after-photo-hero">
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
          I am building this slowly. Not as a final resume, but as an archive of becoming more
          serious, more curious, and more honest with the work.
        </p>
      </section>
    </>
  );
}
