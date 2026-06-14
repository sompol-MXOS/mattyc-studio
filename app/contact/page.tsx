import { SectionHeader } from "../components/SectionHeader";

export default function ContactPage() {
  return (
    <section className="page-shell contact-page">
      <SectionHeader
        eyebrow="Contact"
        title="Collaboration, booking, and creative inquiries."
        copy="A static v1 placeholder for future contact handling. No form backend, email service, Supabase, or database connection is enabled."
      />
      <div className="contact-panel">
        <div>
          <h2>Inquiry areas</h2>
          <p>Performances, collaborations, recording, media, sponsorship, and creative projects.</p>
        </div>
        <a className="button primary" href="mailto:hello@mattyc.studio">hello@mattyc.studio</a>
      </div>
    </section>
  );
}
