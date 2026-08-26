"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  episodeSlug,
  nextEpisodeDraft,
  publicationStatuses,
  slugify,
  workTypes,
  type AdminResource,
} from "../../../lib/mattyc-admin-validation";
import type {
  AdminContentData,
  CreativeWork,
  EducationalSeries,
  PublicationStatus,
  SeriesEpisode,
} from "../../../lib/mattyc-content-types";
import { AdminImageUpload } from "./AdminImageUpload";

type AdminTab = "overview" | "series" | "episodes" | "works";

type SeriesForm = {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  cover_image_url: string;
  featured: boolean;
  display_order: string;
  status: PublicationStatus;
  started_at: string;
  published_at: string;
};

type EpisodeForm = {
  id: string;
  series_id: string;
  episode_number: string;
  slug: string;
  title: string;
  exercise_number: string;
  topic: string;
  description: string;
  thumbnail_url: string;
  youtube_url: string;
  tiktok_url: string;
  published_at: string;
  status: PublicationStatus;
};

type WorkForm = {
  id: string;
  project_id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  work_type: string;
  tool_used: string;
  artwork_url: string;
  audio_url: string;
  video_url: string;
  external_url: string;
  composition_date: string;
  published_at: string;
  featured: boolean;
  featured_order: string;
  status: PublicationStatus;
};

const emptyData: AdminContentData = {
  projects: [],
  series: [],
  episodes: [],
  creativeWorks: [],
};

function toDateTimeInput(value: string | null) {
  return value ? value.slice(0, 16) : "";
}

function newSeriesForm(projectId = ""): SeriesForm {
  return {
    id: "",
    project_id: projectId,
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    cover_image_url: "",
    featured: false,
    display_order: "0",
    status: "draft",
    started_at: "",
    published_at: "",
  };
}

function newEpisodeForm(series?: EducationalSeries): EpisodeForm {
  return {
    id: "",
    series_id: series?.id ?? "",
    episode_number: "1",
    slug: series ? episodeSlug(series.slug, 1) : "",
    title: "",
    exercise_number: "",
    topic: "",
    description: "",
    thumbnail_url: "",
    youtube_url: "",
    tiktok_url: "",
    published_at: "",
    status: "draft",
  };
}

function newWorkForm(projectId = ""): WorkForm {
  return {
    id: "",
    project_id: projectId,
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    work_type: "experiment",
    tool_used: "Chrome Music Lab",
    artwork_url: "",
    audio_url: "",
    video_url: "",
    external_url: "",
    composition_date: "",
    published_at: "",
    featured: false,
    featured_order: "",
    status: "draft",
  };
}

function statusClass(status: PublicationStatus) {
  return `admin-status admin-status-${status}`;
}

function FormMessage({ success, error }: { success: string; error: string }) {
  return (
    <div className="admin-content-messages" aria-live="polite">
      {success ? <p className="admin-story-success">{success}</p> : null}
      {error ? <p className="admin-story-error">{error}</p> : null}
    </div>
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload;
}

export function AdminContentClient({
  initialAuthenticated,
  configured,
}: {
  initialAuthenticated: boolean;
  configured: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [passcode, setPasscode] = useState("");
  const [gateError, setGateError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [data, setData] = useState<AdminContentData>(emptyData);
  const [loading, setLoading] = useState(initialAuthenticated);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [seriesForm, setSeriesForm] = useState<SeriesForm>(newSeriesForm());
  const [episodeForm, setEpisodeForm] = useState<EpisodeForm>(newEpisodeForm());
  const [workForm, setWorkForm] = useState<WorkForm>(newWorkForm());
  const [episodeSlugEdited, setEpisodeSlugEdited] = useState(false);
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [episodeSort, setEpisodeSort] = useState("episode");

  const educationProject = data.projects.find((project) => project.slug === "educational-series");
  const originalsProject = data.projects.find((project) => project.slug === "originals-experiments");
  const hanonSeries = data.series.find((series) => series.slug === "hanon-a-day");

  const loadContent = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/mattyc-content", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      const nextData = await parseResponse<AdminContentData>(response);
      setData(nextData);
      const education = nextData.projects.find((project) => project.slug === "educational-series");
      const originals = nextData.projects.find((project) => project.slug === "originals-experiments");
      const hanon = nextData.series.find((series) => series.slug === "hanon-a-day") ?? nextData.series[0];
      setSeriesForm((current) => current.project_id ? current : newSeriesForm(education?.id));
      setEpisodeForm((current) => current.series_id ? current : newEpisodeForm(hanon));
      setWorkForm((current) => current.project_id ? current : newWorkForm(originals?.id));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const frameId = window.requestAnimationFrame(() => void loadContent());
    return () => window.cancelAnimationFrame(frameId);
  }, [authenticated, loadContent]);

  async function unlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGateError("");
    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      await parseResponse(response);
      setPasscode("");
      setAuthenticated(true);
    } catch (loginError) {
      setGateError(loginError instanceof Error ? loginError.message : "Unable to sign in.");
    }
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthenticated(false);
    setData(emptyData);
  }

  async function saveResource(
    resource: AdminResource,
    id: string,
    formData: Record<string, unknown>,
    message: string,
  ) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/mattyc-content", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource, id: id || undefined, data: formData }),
      });
      await parseResponse(response);
      setSuccess(message);
      await loadContent();
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save content.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  function startNewSeries() {
    setSeriesForm(newSeriesForm(educationProject?.id));
    setActiveTab("series");
    setSuccess("");
    setError("");
  }

  function startNewEpisode(series = hanonSeries ?? data.series[0]) {
    setEpisodeForm(newEpisodeForm(series));
    setEpisodeSlugEdited(false);
    setActiveTab("episodes");
    setSuccess("");
    setError("");
  }

  function startNewWork() {
    setWorkForm(newWorkForm(originalsProject?.id));
    setActiveTab("works");
    setSuccess("");
    setError("");
  }

  function editSeries(series: EducationalSeries) {
    setSeriesForm({
      id: series.id,
      project_id: series.project_id,
      title: series.title,
      slug: series.slug,
      subtitle: series.subtitle ?? "",
      description: series.description ?? "",
      cover_image_url: series.cover_image_url ?? "",
      featured: series.featured,
      display_order: String(series.display_order),
      status: series.status,
      started_at: series.started_at ?? "",
      published_at: toDateTimeInput(series.published_at),
    });
    setActiveTab("series");
  }

  function editEpisode(episode: SeriesEpisode) {
    setEpisodeForm({
      id: episode.id,
      series_id: episode.series_id,
      episode_number: String(episode.episode_number),
      slug: episode.slug,
      title: episode.title,
      exercise_number: episode.exercise_number === null ? "" : String(episode.exercise_number),
      topic: episode.topic ?? "",
      description: episode.description ?? "",
      thumbnail_url: episode.thumbnail_url ?? "",
      youtube_url: episode.youtube_url ?? "",
      tiktok_url: episode.tiktok_url ?? "",
      published_at: toDateTimeInput(episode.published_at),
      status: episode.status,
    });
    setEpisodeSlugEdited(true);
    setActiveTab("episodes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function editWork(work: CreativeWork) {
    setWorkForm({
      id: work.id,
      project_id: work.project_id,
      title: work.title,
      slug: work.slug,
      subtitle: work.subtitle ?? "",
      description: work.description ?? "",
      work_type: work.work_type,
      tool_used: work.tool_used ?? "",
      artwork_url: work.artwork_url ?? "",
      audio_url: work.audio_url ?? "",
      video_url: work.video_url ?? "",
      external_url: work.external_url ?? "",
      composition_date: work.composition_date ?? "",
      published_at: toDateTimeInput(work.published_at),
      featured: work.featured,
      featured_order: work.featured_order === null ? "" : String(work.featured_order),
      status: work.status,
    });
    setActiveTab("works");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function changeEpisodeSeries(seriesId: string) {
    const selected = data.series.find((series) => series.id === seriesId);
    setEpisodeForm((current) => ({
      ...current,
      series_id: seriesId,
      slug: episodeSlugEdited || !selected
        ? current.slug
        : episodeSlug(selected.slug, Number(current.episode_number) || 1),
    }));
  }

  function changeEpisodeNumber(value: string) {
    const selected = data.series.find((series) => series.id === episodeForm.series_id);
    setEpisodeForm((current) => ({
      ...current,
      episode_number: value,
      slug: episodeSlugEdited || !selected || !Number(value)
        ? current.slug
        : episodeSlug(selected.slug, Number(value)),
    }));
  }

  async function submitSeries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await saveResource(
      "series",
      seriesForm.id,
      seriesForm,
      seriesForm.id ? "Series updated." : "Series created.",
    );
    if (saved && !seriesForm.id) setSeriesForm(newSeriesForm(educationProject?.id));
  }

  async function submitEpisode(event: FormEvent<HTMLFormElement> | null, addNext = false) {
    event?.preventDefault();
    const currentSeries = data.series.find((series) => series.id === episodeForm.series_id);
    const saved = await saveResource(
      "episode",
      episodeForm.id,
      episodeForm,
      addNext ? "Episode saved. Ready for the next one." : episodeForm.id ? "Episode updated." : "Episode created.",
    );
    if (!saved) return;
    if (addNext && currentSeries) {
      const next = nextEpisodeDraft(episodeForm, currentSeries.slug);
      setEpisodeForm({ id: "", ...next, status: next.status as PublicationStatus });
      setEpisodeSlugEdited(false);
    } else if (!episodeForm.id) {
      setEpisodeForm(newEpisodeForm(currentSeries));
      setEpisodeSlugEdited(false);
    }
  }

  async function submitWork(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const saved = await saveResource(
      "creativeWork",
      workForm.id,
      workForm,
      workForm.id ? "Creative work updated." : "Creative work created.",
    );
    if (saved && !workForm.id) setWorkForm(newWorkForm(originalsProject?.id));
  }

  const filteredEpisodes = useMemo(() => {
    const filtered = data.episodes.filter((episode) =>
      (seriesFilter === "all" || episode.series_id === seriesFilter) &&
      (statusFilter === "all" || episode.status === statusFilter),
    );
    return [...filtered].sort((left, right) => {
      if (episodeSort === "newest") {
        return new Date(right.published_at ?? right.created_at).getTime() - new Date(left.published_at ?? left.created_at).getTime();
      }
      if (episodeSort === "oldest") {
        return new Date(left.published_at ?? left.created_at).getTime() - new Date(right.published_at ?? right.created_at).getTime();
      }
      return left.episode_number - right.episode_number;
    });
  }, [data.episodes, episodeSort, seriesFilter, statusFilter]);

  if (!authenticated) {
    return (
      <section className="admin-story-page admin-content-page">
        <div className="admin-story-gate">
          <p className="eyebrow">Internal</p>
          <h1>MattYC Content Admin</h1>
          <p className="admin-gate-copy">
            Manage educational series, episodes, and original work.
          </p>
          {!configured ? (
            <p className="admin-story-error">
              Server-side admin environment variables must be configured before sign-in.
            </p>
          ) : null}
          <form onSubmit={unlock} className="admin-story-passcode">
            <label htmlFor="mattyc-admin-passcode">Passcode</label>
            <input
              id="mattyc-admin-passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              autoComplete="current-password"
            />
            <button type="submit">Enter</button>
            {gateError ? <p className="admin-story-error">{gateError}</p> : null}
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-content-page">
      <header className="admin-content-header">
        <div>
          <p className="eyebrow">Internal / MattYC Studio</p>
          <h1>Content Archive</h1>
          <p>Educational Series by MattYC, episodes, originals, and experiments.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={signOut}>Sign out</button>
      </header>

      <nav className="admin-content-nav" aria-label="Admin sections">
        {([
          ["overview", "Overview"],
          ["series", "Educational Series"],
          ["episodes", "Episodes"],
          ["works", "Originals & Experiments"],
        ] as const).map(([tab, label]) => (
          <button
            type="button"
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            key={tab}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="admin-content-shell">
        <FormMessage success={success} error={error} />
        {loading ? <p className="admin-content-loading">Loading the studio archive…</p> : null}

        {!loading && activeTab === "overview" ? (
          <Overview
            data={data}
            onAddEpisode={() => startNewEpisode()}
            onAddSeries={startNewSeries}
            onAddWork={startNewWork}
          />
        ) : null}

        {!loading && activeTab === "series" ? (
          <div className="admin-content-workspace">
            <form className="admin-content-form" onSubmit={submitSeries}>
              <AdminFormHeading title={seriesForm.id ? "Edit series" : "Add series"} onReset={startNewSeries} />
              <label>Project<select required value={seriesForm.project_id} onChange={(event) => setSeriesForm({ ...seriesForm, project_id: event.target.value })}><option value="">Select project</option>{data.projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label>
              <div className="admin-form-grid"><label>Title<input required value={seriesForm.title} onChange={(event) => setSeriesForm({ ...seriesForm, title: event.target.value, slug: seriesForm.slug || slugify(event.target.value) })} /></label><label>Slug<input required value={seriesForm.slug} onChange={(event) => setSeriesForm({ ...seriesForm, slug: event.target.value })} /></label></div>
              <label>Subtitle<input value={seriesForm.subtitle} onChange={(event) => setSeriesForm({ ...seriesForm, subtitle: event.target.value })} /></label>
              <label>Description<textarea rows={5} value={seriesForm.description} onChange={(event) => setSeriesForm({ ...seriesForm, description: event.target.value })} /></label>
              <AdminImageUpload label="Series Cover" helper="Upload a JPG, PNG, or WebP cover image." folder="series" slug={seriesForm.slug || seriesForm.title} value={seriesForm.cover_image_url} onChange={(cover_image_url) => setSeriesForm((current) => ({ ...current, cover_image_url }))} />
              <label>Cover image URL<input type="url" value={seriesForm.cover_image_url} onChange={(event) => setSeriesForm({ ...seriesForm, cover_image_url: event.target.value })} /></label>
              <div className="admin-form-grid"><label>Display order<input type="number" min="0" value={seriesForm.display_order} onChange={(event) => setSeriesForm({ ...seriesForm, display_order: event.target.value })} /></label><label>Status<select value={seriesForm.status} onChange={(event) => setSeriesForm({ ...seriesForm, status: event.target.value as PublicationStatus })}>{publicationStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div>
              <div className="admin-form-grid"><label>Started date<input type="date" value={seriesForm.started_at} onChange={(event) => setSeriesForm({ ...seriesForm, started_at: event.target.value })} /></label><label>Published date<input type="datetime-local" value={seriesForm.published_at} onChange={(event) => setSeriesForm({ ...seriesForm, published_at: event.target.value })} /></label></div>
              <label className="admin-checkbox"><input type="checkbox" checked={seriesForm.featured} onChange={(event) => setSeriesForm({ ...seriesForm, featured: event.target.checked })} />Featured series</label>
              <button type="submit" disabled={saving}>{saving ? "Saving…" : seriesForm.id ? "Update series" : "Create series"}</button>
            </form>
            <SeriesList series={data.series} episodes={data.episodes} onEdit={editSeries} />
          </div>
        ) : null}

        {!loading && activeTab === "episodes" ? (
          <div className="admin-content-stack">
            <form className="admin-content-form" onSubmit={(event) => void submitEpisode(event)}>
              <AdminFormHeading title={episodeForm.id ? "Edit episode" : "Add episode"} onReset={() => startNewEpisode()} />
              <div className="admin-form-grid"><label>Series<select required value={episodeForm.series_id} onChange={(event) => changeEpisodeSeries(event.target.value)}><option value="">Select series</option>{data.series.map((series) => <option value={series.id} key={series.id}>{series.title}</option>)}</select></label><label>Episode number<input required type="number" min="1" value={episodeForm.episode_number} onChange={(event) => changeEpisodeNumber(event.target.value)} /></label></div>
              <div className="admin-form-grid"><label>Slug<input required value={episodeForm.slug} onChange={(event) => { setEpisodeSlugEdited(true); setEpisodeForm({ ...episodeForm, slug: event.target.value }); }} /></label><label>Title<input value={episodeForm.title} onChange={(event) => setEpisodeForm({ ...episodeForm, title: event.target.value })} placeholder="Drafts may remain untitled" /></label></div>
              <div className="admin-form-grid"><label>Hanon exercise number<input type="number" min="1" value={episodeForm.exercise_number} onChange={(event) => setEpisodeForm({ ...episodeForm, exercise_number: event.target.value })} /></label><label>Topic<input value={episodeForm.topic} onChange={(event) => setEpisodeForm({ ...episodeForm, topic: event.target.value })} /></label></div>
              <label>Description<textarea rows={5} value={episodeForm.description} onChange={(event) => setEpisodeForm({ ...episodeForm, description: event.target.value })} /></label>
              <AdminImageUpload label="Portrait Thumbnail" helper="Recommended 9:16 · 1080 × 1920 px" folder="episodes" slug={episodeForm.slug || episodeForm.title} value={episodeForm.thumbnail_url} onChange={(thumbnail_url) => setEpisodeForm((current) => ({ ...current, thumbnail_url }))} portrait />
              <label>Thumbnail URL<input type="url" value={episodeForm.thumbnail_url} onChange={(event) => setEpisodeForm({ ...episodeForm, thumbnail_url: event.target.value })} /></label>
              <div className="admin-form-grid"><label>YouTube URL<input type="url" value={episodeForm.youtube_url} onChange={(event) => setEpisodeForm({ ...episodeForm, youtube_url: event.target.value })} /></label><label>TikTok URL<input type="url" value={episodeForm.tiktok_url} onChange={(event) => setEpisodeForm({ ...episodeForm, tiktok_url: event.target.value })} /></label></div>
              <div className="admin-form-grid"><label>Published date<input type="datetime-local" value={episodeForm.published_at} onChange={(event) => setEpisodeForm({ ...episodeForm, published_at: event.target.value })} /></label><label>Status<select value={episodeForm.status} onChange={(event) => setEpisodeForm({ ...episodeForm, status: event.target.value as PublicationStatus })}>{publicationStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div>
              <div className="admin-form-actions"><button type="submit" disabled={saving}>{saving ? "Saving…" : episodeForm.id ? "Update episode" : "Save episode"}</button>{!episodeForm.id ? <button type="button" className="admin-secondary-button" disabled={saving} onClick={() => void submitEpisode(null, true)}>Save &amp; Add Next Episode</button> : null}</div>
            </form>
            <EpisodeList data={data} episodes={filteredEpisodes} seriesFilter={seriesFilter} statusFilter={statusFilter} sort={episodeSort} setSeriesFilter={setSeriesFilter} setStatusFilter={setStatusFilter} setSort={setEpisodeSort} onEdit={editEpisode} />
          </div>
        ) : null}

        {!loading && activeTab === "works" ? (
          <div className="admin-content-workspace">
            <form className="admin-content-form" onSubmit={submitWork}>
              <AdminFormHeading title={workForm.id ? "Edit creative work" : "Add creative work"} onReset={startNewWork} />
              <label>Project<select required value={workForm.project_id} onChange={(event) => setWorkForm({ ...workForm, project_id: event.target.value })}><option value="">Select project</option>{data.projects.map((project) => <option value={project.id} key={project.id}>{project.title}</option>)}</select></label>
              <div className="admin-form-grid"><label>Title<input required value={workForm.title} onChange={(event) => setWorkForm({ ...workForm, title: event.target.value, slug: workForm.slug || slugify(event.target.value) })} /></label><label>Slug<input required value={workForm.slug} onChange={(event) => setWorkForm({ ...workForm, slug: event.target.value })} /></label></div>
              <label>Subtitle<input value={workForm.subtitle} onChange={(event) => setWorkForm({ ...workForm, subtitle: event.target.value })} /></label>
              <label>Description<textarea rows={5} value={workForm.description} onChange={(event) => setWorkForm({ ...workForm, description: event.target.value })} /></label>
              <div className="admin-form-grid"><label>Work type<select value={workForm.work_type} onChange={(event) => setWorkForm({ ...workForm, work_type: event.target.value })}>{workTypes.map((type) => <option value={type} key={type}>{type}</option>)}</select></label><label>Tool used<input value={workForm.tool_used} onChange={(event) => setWorkForm({ ...workForm, tool_used: event.target.value })} /></label></div>
              <label>Chrome Music Lab / External Project URL<input type="url" value={workForm.external_url} onChange={(event) => setWorkForm({ ...workForm, external_url: event.target.value })} /></label>
              <div className="admin-form-grid"><label>YouTube Demo URL<input type="url" value={workForm.video_url} onChange={(event) => setWorkForm({ ...workForm, video_url: event.target.value })} /></label><label>Audio URL<input type="url" value={workForm.audio_url} onChange={(event) => setWorkForm({ ...workForm, audio_url: event.target.value })} /></label></div>
              <AdminImageUpload label="Portrait Artwork" helper="Recommended 9:16 · 1080 × 1920 px" folder="originals" slug={workForm.slug || workForm.title} value={workForm.artwork_url} onChange={(artwork_url) => setWorkForm((current) => ({ ...current, artwork_url }))} portrait />
              <label>Artwork URL<input type="url" value={workForm.artwork_url} onChange={(event) => setWorkForm({ ...workForm, artwork_url: event.target.value })} /></label>
              <div className="admin-form-grid"><label>Composition / creation date<input type="date" value={workForm.composition_date} onChange={(event) => setWorkForm({ ...workForm, composition_date: event.target.value })} /></label><label>Published date<input type="datetime-local" value={workForm.published_at} onChange={(event) => setWorkForm({ ...workForm, published_at: event.target.value })} /></label></div>
              <div className="admin-form-grid"><label>Featured order<input type="number" min="0" value={workForm.featured_order} onChange={(event) => setWorkForm({ ...workForm, featured_order: event.target.value })} /></label><label>Status<select value={workForm.status} onChange={(event) => setWorkForm({ ...workForm, status: event.target.value as PublicationStatus })}>{publicationStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label></div>
              <label className="admin-checkbox"><input type="checkbox" checked={workForm.featured} onChange={(event) => setWorkForm({ ...workForm, featured: event.target.checked })} />Featured work</label>
              <button type="submit" disabled={saving}>{saving ? "Saving…" : workForm.id ? "Update creative work" : "Create creative work"}</button>
            </form>
            <WorkList works={data.creativeWorks} onEdit={editWork} />
          </div>
        ) : null}
      </main>
    </section>
  );
}

function AdminFormHeading({ title, onReset }: { title: string; onReset: () => void }) {
  return <div className="admin-form-heading"><div><p className="eyebrow">Editor</p><h2>{title}</h2></div><button type="button" className="admin-text-button" onClick={onReset}>Clear / new</button></div>;
}

function Overview({ data, onAddEpisode, onAddSeries, onAddWork }: { data: AdminContentData; onAddEpisode: () => void; onAddSeries: () => void; onAddWork: () => void }) {
  const counts = [
    ["Published series", data.series.filter((item) => item.status === "published").length],
    ["Published episodes", data.episodes.filter((item) => item.status === "published").length],
    ["Draft episodes", data.episodes.filter((item) => item.status === "draft").length],
    ["Creative works", data.creativeWorks.filter((item) => item.status !== "archived").length],
    ["Draft creative works", data.creativeWorks.filter((item) => item.status === "draft").length],
  ] as const;
  return <div className="admin-overview"><div className="admin-overview-heading"><p className="eyebrow">Overview</p><h2>Studio content at a glance.</h2></div><div className="admin-count-grid">{counts.map(([label, count], index) => <article key={label}><span>{String(index + 1).padStart(2, "0")}</span><strong>{count}</strong><p>{label}</p></article>)}</div><div className="admin-quick-actions"><button type="button" onClick={onAddEpisode}>Add Episode</button><button type="button" onClick={onAddWork}>Add Creative Work</button><button type="button" onClick={onAddSeries}>Add Series</button></div></div>;
}

function SeriesList({ series, episodes, onEdit }: { series: EducationalSeries[]; episodes: SeriesEpisode[]; onEdit: (series: EducationalSeries) => void }) {
  return <section className="admin-content-list"><div className="admin-list-heading"><p className="eyebrow">Educational Series by MattYC</p><h2>Series</h2></div>{series.length ? series.map((item) => <article className="admin-list-row" key={item.id}><div><span className={statusClass(item.status)}>{item.status}</span><h3>{item.title}</h3><p>{episodes.filter((episode) => episode.series_id === item.id).length} episodes / order {item.display_order}</p></div><div className="admin-row-actions"><Link href={`/creation/educational-series/${item.slug}`} target="_blank">Public page</Link><button type="button" onClick={() => onEdit(item)}>Edit</button></div></article>) : <p className="admin-empty">No educational series found.</p>}</section>;
}

function EpisodeList({ data, episodes, seriesFilter, statusFilter, sort, setSeriesFilter, setStatusFilter, setSort, onEdit }: { data: AdminContentData; episodes: SeriesEpisode[]; seriesFilter: string; statusFilter: string; sort: string; setSeriesFilter: (value: string) => void; setStatusFilter: (value: string) => void; setSort: (value: string) => void; onEdit: (episode: SeriesEpisode) => void }) {
  return <section className="admin-content-list admin-episode-list"><div className="admin-list-heading"><p className="eyebrow">Archive</p><h2>Episodes</h2></div><div className="admin-list-filters"><label>Series<select value={seriesFilter} onChange={(event) => setSeriesFilter(event.target.value)}><option value="all">All series</option>{data.series.map((series) => <option value={series.id} key={series.id}>{series.title}</option>)}</select></label><label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{publicationStatuses.map((status) => <option value={status} key={status}>{status}</option>)}</select></label><label>Sort<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="episode">Episode number</option><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label></div>{episodes.length ? <div className="admin-episode-table">{episodes.map((episode) => { const series = data.series.find((item) => item.id === episode.series_id); return <article className="admin-episode-row" key={episode.id}><div className="admin-episode-number">{String(episode.episode_number).padStart(2, "0")}</div><div><span className={statusClass(episode.status)}>{episode.status}</span><h3>{episode.title}</h3><p>{series?.title ?? "Unknown series"}{episode.exercise_number ? ` / Hanon No. ${episode.exercise_number}` : ""}{episode.topic ? ` / ${episode.topic}` : ""}</p></div><div className="admin-row-actions">{episode.youtube_url ? <a href={episode.youtube_url} target="_blank" rel="noreferrer">YouTube</a> : null}{episode.tiktok_url ? <a href={episode.tiktok_url} target="_blank" rel="noreferrer">TikTok</a> : null}{series ? <Link href={`/creation/educational-series/${series.slug}`} target="_blank">Public page</Link> : null}<button type="button" onClick={() => onEdit(episode)}>Edit</button></div></article>; })}</div> : <p className="admin-empty">No episodes match these filters.</p>}</section>;
}

function WorkList({ works, onEdit }: { works: CreativeWork[]; onEdit: (work: CreativeWork) => void }) {
  return <section className="admin-content-list"><div className="admin-list-heading"><p className="eyebrow">Originals &amp; Experiments</p><h2>Creative works</h2></div>{works.length ? works.map((work) => <article className="admin-list-row" key={work.id}><div><span className={statusClass(work.status)}>{work.status}</span><h3>{work.title}</h3><p>{work.work_type.replaceAll("_", " ")}{work.tool_used ? ` / ${work.tool_used}` : ""}</p></div><div className="admin-row-actions">{work.external_url ? <a href={work.external_url} target="_blank" rel="noreferrer">External project</a> : null}<Link href="/creation/originals" target="_blank">Public page</Link><button type="button" onClick={() => onEdit(work)}>Edit</button></div></article>) : <p className="admin-empty">No creative works found.</p>}</section>;
}
