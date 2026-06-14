import { SectionHeader } from "../components/SectionHeader";

export default function ContactPage() {
  return (
    <section className="page-shell contact-page">
      <SectionHeader
        eyebrow="Contact"
        title="For performance, collaboration, media, or creative project conversations."
        copy="This is a simple v1 contact point. No backend, database, Supabase, or form storage is connected."
      />
      <div className="quiet-contact">
        <p>
          If the conversation is about music, performance, recording, sponsors, or a creative idea,
          this is the place to start.
        </p>
        <a className="text-link" href="mailto:hello@mattyc.studio">hello@mattyc.studio</a>
      </div>
    </section>
  );
}
