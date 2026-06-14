import Image from "next/image";
import Link from "next/link";
import { notes } from "./data";

export default function Home() {
  return (
    <>
      <section className="hero photo-hero">
        <div className="hero-image-wrap">
          <Image
            src="/images/matt/coverpage.png"
            alt="Matt.YC seated alone at a grand piano in a Steinway showroom"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 1180px"
            className="hero-image"
          />
          <div className="hero-overlay">
            <p className="eyebrow">Matt.YC / personal archive</p>
            <h1>Classical foundation. Creator future.</h1>
          </div>
        </div>
        <div className="hero-understory">
          <p>
            I am Matt.YC. Piano is where I learned discipline. This is where I collect the
            journey: performances, ideas, experiments, and the work still in progress.
          </p>
          <div className="button-row">
            <Link className="text-link" href="/journey">Read the journey</Link>
            <Link className="text-link" href="/creation">See what I am making</Link>
          </div>
        </div>
      </section>

      <section className="statement-band">
        <p>
          I do not want this to be only about winning. I want to keep getting better for life.
        </p>
      </section>

      <section className="notebook-list" aria-label="Matt's notes">
        {notes.map((note, index) => (
          <article className="notebook-line" key={note}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{note}</p>
          </article>
        ))}
      </section>
    </>
  );
}
