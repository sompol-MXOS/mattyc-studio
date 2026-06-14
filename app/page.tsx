import Link from "next/link";
import { notes } from "./data";

export default function Home() {
  return (
    <>
      <section className="hero home-hero">
        <div className="hero-copy">
          <p className="eyebrow">Matt.YC / personal archive</p>
          <h1>Classical foundation. Creator future.</h1>
          <p>
            I am Matt.YC, a young creator shaped by classical piano, practice, and curiosity.
            This site is where I collect the journey: performances, ideas, experiments,
            sponsors, and the work still in progress.
          </p>
          <div className="button-row">
            <Link className="text-link" href="/journey">Read the journey</Link>
            <Link className="text-link" href="/creation">See what I am making</Link>
          </div>
        </div>
        <div className="quiet-visual" aria-label="Abstract piano and studio light placeholder">
          <span className="visual-number">01</span>
          <span className="visual-caption">images later / public/images/matt</span>
        </div>
      </section>

      <section className="statement-band">
        <p>
          Piano is where I learned discipline. Creation is where I want to keep exploring.
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
