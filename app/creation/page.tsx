import { creationAreas } from "../data";

export default function CreationPage() {
  return (
    <>
      <section className="page-photo-hero creation-hero">
        <img className="page-hero-image" src="/images/matt-creation.jpg" alt="Matt creating music at a keyboard" />
        <div className="page-hero-overlay">
          <p className="eyebrow">Creation</p>
          <h1>Creation is where I want to keep exploring.</h1>
          <p>
            I am interested in the space after practice: original music, voice, production, band
            ideas, AI tools, sound for games, and the next experiment that does not have a name yet.
          </p>
        </div>
      </section>

      <section className="page-shell creation-page after-photo-hero">
        <div className="split-note">
          <p>Classical piano gives me the discipline. Creation gives me the questions.</p>
          <ul>
            {creationAreas.map((area) => (
              <li key={area}>{area}</li>
            ))}
          </ul>
        </div>
        <div className="signal-strip" aria-label="Abstract studio signal placeholder" />
      </section>
    </>
  );
}
