import { sponsors } from "../data";

export default function SponsorsPage() {
  return (
    <>
      <section className="page-photo-hero sponsors-hero">
        <img className="page-hero-image sponsors-hero-image" src="/images/matt-wai2.jpg" alt="Matt with piano" />
        <div className="page-hero-overlay sponsors-hero-overlay">
          <p className="eyebrow">Sponsors</p>
          <h1>Thank you for supporting my journey.</h1>
          <p>
            Thank you very much to all the sponsors who support my journey, my music, and the work
            I am still building.
          </p>
        </div>
      </section>

      <section className="page-shell sponsors-page after-photo-hero">
        <div className="sponsor-list">
          {sponsors.map((sponsor) => (
            <a
              className="sponsor-card"
              key={sponsor.name}
              href={sponsor.href}
              target={sponsor.href === "#" ? undefined : "_blank"}
              rel={sponsor.href === "#" ? undefined : "noreferrer"}
              aria-label={sponsor.href === "#" ? sponsor.name : `Visit ${sponsor.name}`}
            >
              <div className="sponsor-identity">
                <img className="sponsor-logo" src={sponsor.logo} alt={`${sponsor.name} logo`} />
                <p>{sponsor.name}</p>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
