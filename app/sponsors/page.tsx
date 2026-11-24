import Image from "next/image";
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

      <div className="sponsors-page">
        <section className="page-shell sponsors-carry after-photo-hero">
          <div className="sponsors-carry-photo">
            <Image
              src="/images/updatedsponsor.jpg"
              alt="Matt wearing his black performance suit with sponsor patches displayed on his sleeve"
              width={874}
              height={1874}
              sizes="(max-width: 900px) calc(100vw - 32px), 48vw"
            />
          </div>
          <div className="sponsors-carry-copy">
            <p className="eyebrow">More Than a Logo</p>
            <h2>Proud to Carry Their Names</h2>
            <div className="sponsors-prose">
              <p>Every time I step onto the stage, I carry more than just my music.</p>
              <p>
                I feel incredibly proud to wear the names of the brands that believe in me and
                support my musical journey. Having their logos on my sleeve, visible to the
                audience while I perform, is something truly special to me.
              </p>
              <p>
                To me, these are more than just logos. They represent trust, encouragement and
                belief in what I am working towards.
              </p>
              <p>
                Their support inspires me to work harder, become a better musician and give my
                very best in every performance.
              </p>
              <p>It is an honour to carry their names wherever my music takes me.</p>
            </div>
          </div>
        </section>

        <section className="sponsors-community-section">
          <div className="page-shell sponsors-community">
            <div className="sponsors-community-intro">
              <p className="eyebrow">The People Behind the Brands</p>
              <h2>Beyond the Stage</h2>
              <div className="sponsors-prose">
                <p>Behind every performance, there are people who believe in my potential.</p>
                <p>
                  I am grateful not only for the support of these incredible brands, but also for
                  the opportunity to meet the people behind them and share my musical journey with
                  them.
                </p>
                <p>Their belief in me means more than they may realise.</p>
              </div>
            </div>

            <div className="sponsors-people-grid">
              <figure>
                <div className="sponsors-people-photo">
                  <Image
                    src="/images/matt_ideal8.jpg"
                    alt="Matt holding an IDEAL8 Studio shirt"
                    fill
                    sizes="(max-width: 700px) calc(100vw - 32px), 50vw"
                  />
                </div>
                <figcaption>IDEAL8 Studio</figcaption>
              </figure>
              <figure>
                <div className="sponsors-people-photo sponsors-people-photo-allen-heath">
                  <Image
                    src="/images/matt_alan&heath.jpg"
                    alt="Matt and a Sonos Libra representative displaying an Allen & Heath shirt"
                    fill
                    sizes="(max-width: 700px) calc(100vw - 32px), 50vw"
                  />
                </div>
                <figcaption>Allen &amp; Heath × Sonos Libra</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="page-shell sponsors-brands">
          <div className="sponsors-brands-heading">
            <h2>The Brands That Believe in Me</h2>
            <p>Thank you for believing in my potential and being part of my musical journey.</p>
          </div>
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

        <section className="sponsors-closing">
          <blockquote>
            <p>
              “I carry their names on my sleeve, their belief in my heart, and their support into
              every performance.”
            </p>
            <cite>— Matt</cite>
          </blockquote>
        </section>
      </div>
    </>
  );
}
