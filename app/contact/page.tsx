export default function ContactPage() {
  return (
    <>
      <section className="page-photo-hero contact-hero">
        <img className="page-hero-image" src="/images/matt-stage.jpg" alt="Matt on stage during a performance" />
        <div className="page-hero-overlay">
          <p className="eyebrow">Contact</p>
          <h1>Let&apos;s build the next stage.</h1>
          <p>
            For performance, media, sponsorship, or creative projects, please contact me at
            mattyc.studio@gmail.com.
          </p>
        </div>
      </section>

      <section className="page-shell contact-page after-photo-hero">
        <div className="quiet-contact">
          <p>
            If the conversation is about music, performance, recording, sponsors, or a creative
            idea, this is the place to start.
          </p>
          <a className="text-link" href="mailto:mattyc.studio@gmail.com">mattyc.studio@gmail.com</a>
        </div>
      </section>
    </>
  );
}
