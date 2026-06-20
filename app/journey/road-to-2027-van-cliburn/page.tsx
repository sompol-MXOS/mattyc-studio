import { supabase, type VanCliburnStoryEntry } from "../../../lib/supabase";

export const revalidate = 60;

async function getStoryEntries() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("van_cliburn_story_entries")
    .select(
      "id,title,chapter_label,entry_date,category,excerpt,body,image_url,is_published,display_order,created_at,updated_at",
    )
    .eq("is_published", true)
    .order("display_order", { ascending: true })
    .order("entry_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Unable to load Van Cliburn story entries", error);
    return [];
  }

  return (data ?? []) as VanCliburnStoryEntry[];
}

function formatEntryDate(date: string | null) {
  if (!date) {
    return null;
  }

  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatCategory(category: string | null) {
  return category?.replaceAll("_", " ");
}

export default async function RoadToVanCliburnPage() {
  const storyEntries = await getStoryEntries();

  return (
    <>
      <section className="cliburn-mission-hero" aria-labelledby="cliburn-mission-title">
        <p className="eyebrow">Journey</p>
        <h1 id="cliburn-mission-title">
          ROAD TO
          <br />
          2027 VAN CLIBURN
        </h1>
        <video
          src="/videos/penguin_anime_opt.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="van-cliburn-hero-video"
        />
        <p className="cliburn-mission-statement">
          I know this is an impossible mission.
          <br />
          But I will,
          <br />
          because I believe.
        </p>
      </section>

      <section className="cliburn-story page-shell" aria-labelledby="cliburn-story-title">
        <div className="cliburn-story-intro">
          <div>
            <p className="eyebrow">Archive</p>
            <h2 id="cliburn-story-title">THE STORY BEHIND</h2>
          </div>
          <div className="cliburn-story-copy">
            <p>This is the story behind the road.</p>
            <p>
              From the day I decided I wanted to try, until the online screening submission in
              November 2026, this page records what I builds, studies, prepares, performs, fails,
              fixes, and learns along the way.
            </p>
            <p>Whether I qualify or not is not the only question.</p>
            <p>
              Because this road is already teaching me something bigger: how to prepare seriously,
              how to listen deeper, how to stand under pressure, how to keep improving, and how to
              become more honest with the work.
            </p>
            <p>
              This is not only a competition page.
              <br />
              This is my storybook of becoming.
            </p>
          </div>
        </div>

        {storyEntries.length > 0 ? (
          <div className="cliburn-story-chapters">
            {storyEntries.map((entry, index) => {
              const entryDate = formatEntryDate(entry.entry_date);
              const category = formatCategory(entry.category);

              return (
                <article className="cliburn-story-chapter" key={entry.id}>
                  <span>{entry.chapter_label ?? String(index + 1).padStart(2, "0")}</span>
                  <div className="cliburn-story-entry">
                    <div className="cliburn-story-entry-text">
                      <div className="cliburn-story-meta">
                        {entryDate ? (
                          <time dateTime={entry.entry_date ?? undefined}>{entryDate}</time>
                        ) : null}
                        {category ? <p>{category}</p> : null}
                      </div>
                      <h3>{entry.title}</h3>
                      {entry.excerpt ? <p>{entry.excerpt}</p> : null}
                    </div>
                    {entry.image_url ? (
                      <img
                        src={entry.image_url}
                        alt=""
                        className="cliburn-story-image"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="cliburn-story-empty">
            The story has started. My entries will be added as the road unfolds.
          </p>
        )}
      </section>
    </>
  );
}
