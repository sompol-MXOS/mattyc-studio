"use client";

import Link from "next/link";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { VanCliburnStoryEntry } from "../../../lib/supabase";
import { vanCliburnCategories } from "../../../lib/van-cliburn-story";

type StoryForm = {
  id: string;
  title: string;
  chapter_label: string;
  entry_date: string;
  category: string;
  excerpt: string;
  body: string;
  image_url: string;
  display_order: string;
  is_published: boolean;
  is_archived: boolean;
};

const emptyForm: StoryForm = {
  id: "",
  title: "",
  chapter_label: "",
  entry_date: "",
  category: "preparation",
  excerpt: "",
  body: "",
  image_url: "",
  display_order: "0",
  is_published: false,
  is_archived: false,
};

function formFromEntry(entry: VanCliburnStoryEntry): StoryForm {
  return {
    id: entry.id,
    title: entry.title,
    chapter_label: entry.chapter_label ?? "",
    entry_date: entry.entry_date ?? "",
    category: entry.category ?? "preparation",
    excerpt: entry.excerpt ?? "",
    body: entry.body ?? "",
    image_url: entry.image_url ?? "",
    display_order: String(entry.display_order),
    is_published: entry.is_published,
    is_archived: entry.is_archived,
  };
}

function entryPayload(entry: VanCliburnStoryEntry) {
  return {
    title: entry.title,
    chapter_label: entry.chapter_label,
    entry_date: entry.entry_date,
    category: entry.category,
    excerpt: entry.excerpt,
    body: entry.body,
    image_url: entry.image_url,
    display_order: entry.display_order,
    is_published: entry.is_published,
    is_archived: entry.is_archived,
  };
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "The request could not be completed.");
  return payload;
}

function storyStatus(entry: VanCliburnStoryEntry) {
  if (entry.is_archived) return "archived";
  return entry.is_published ? "published" : "draft";
}

export function VanCliburnStoryAdminClient({
  initialAuthenticated,
  configured,
}: {
  initialAuthenticated: boolean;
  configured: boolean;
}) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [passcode, setPasscode] = useState("");
  const [gateError, setGateError] = useState("");
  const [entries, setEntries] = useState<VanCliburnStoryEntry[]>([]);
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [loading, setLoading] = useState(initialAuthenticated);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [migrationRequired, setMigrationRequired] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/van-cliburn-story", { cache: "no-store" });
      if (response.status === 401) {
        setAuthenticated(false);
        return;
      }
      const payload = await parseResponse<{
        entries: VanCliburnStoryEntry[];
        migrationRequired?: boolean;
      }>(response);
      setEntries(payload.entries);
      setMigrationRequired(Boolean(payload.migrationRequired));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load stories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    const frameId = window.requestAnimationFrame(() => void loadEntries());
    return () => window.cancelAnimationFrame(frameId);
  }, [authenticated, loadEntries]);

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
    setEntries([]);
  }

  function updateForm<K extends keyof StoryForm>(key: K, value: StoryForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function startNew() {
    setForm(emptyForm);
    setError("");
    setSuccess("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function editEntry(entry: VanCliburnStoryEntry) {
    setForm(formFromEntry(entry));
    setError("");
    setSuccess("");
    window.scrollTo({ top: 280, behavior: "smooth" });
  }

  async function save(id: string, data: Record<string, unknown>, message: string) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("/api/admin/van-cliburn-story", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id || undefined, data }),
      });
      await parseResponse(response);
      setSuccess(message);
      await loadEntries();
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the story.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const wasSaved = await save(form.id, form, form.id ? "Story updated." : "Story created.");
    if (wasSaved && !form.id) {
      setForm(emptyForm);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function changePublication(entry: VanCliburnStoryEntry) {
    await save(
      entry.id,
      { ...entryPayload(entry), is_published: !entry.is_published, is_archived: false },
      entry.is_published ? "Story unpublished." : "Story published.",
    );
  }

  async function archiveEntry(entry: VanCliburnStoryEntry) {
    if (!window.confirm(`Archive “${entry.title}”? It will disappear from the public journey.`)) return;
    const archived = await save(
      entry.id,
      { ...entryPayload(entry), is_published: false, is_archived: true },
      "Story archived.",
    );
    if (archived && form.id === entry.id) startNew();
  }

  async function restoreEntry(entry: VanCliburnStoryEntry) {
    await save(
      entry.id,
      { ...entryPayload(entry), is_published: false, is_archived: false },
      "Story restored as a draft.",
    );
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const data = new FormData();
      data.set("file", file);
      data.set("title", form.title);
      const response = await fetch("/api/admin/van-cliburn-story/upload", {
        method: "POST",
        body: data,
      });
      const payload = await parseResponse<{ url: string }>(response);
      updateForm("image_url", payload.url);
      setSuccess("Photograph uploaded. Save the story to keep this URL.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void uploadImage(file);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) void uploadImage(file);
  }

  if (!authenticated) {
    return (
      <section className="admin-story-page admin-content-page">
        <div className="admin-story-gate">
          <p className="eyebrow">Internal</p>
          <h1>MattYC Content Admin</h1>
          <p className="admin-gate-copy">Sign in with the secure MattYC admin passcode to manage the Van Cliburn Journey.</p>
          {!configured ? <p className="admin-story-error">Server-side admin environment variables must be configured before sign-in.</p> : null}
          <form onSubmit={unlock} className="admin-story-passcode">
            <label htmlFor="van-cliburn-admin-passcode">Passcode</label>
            <input id="van-cliburn-admin-passcode" type="password" value={passcode} onChange={(event) => setPasscode(event.target.value)} autoComplete="current-password" />
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
          <h1>Van Cliburn Journey</h1>
          <p>Create, edit, publish, and archive the Road to 2027 story.</p>
        </div>
        <div className="admin-header-actions">
          <Link className="admin-secondary-button" href="/admin/mattyc-content">Content Archive</Link>
          <button type="button" className="admin-secondary-button" onClick={signOut}>Sign out</button>
        </div>
      </header>

      <nav className="admin-content-nav" aria-label="Admin sections">
        <Link href="/admin/mattyc-content">Overview</Link>
        <Link className="active" href="/admin/van-cliburn-story">Van Cliburn Journey</Link>
        <Link href="/journey/road-to-2027-van-cliburn" target="_blank">Public page</Link>
      </nav>

      <main className="admin-content-shell">
        <div className="admin-content-messages" aria-live="polite">
          {migrationRequired ? (
            <p className="admin-story-error">
              Review and apply the Van Cliburn archive migration before saving or uploading. Existing stories remain read-only.
            </p>
          ) : null}
          {success ? <p className="admin-story-success">{success}</p> : null}
          {error ? <p className="admin-story-error">{error}</p> : null}
        </div>
        {loading ? <p className="admin-content-loading">Loading journey stories…</p> : null}

        {!loading ? (
          <div className="admin-content-workspace admin-story-workspace">
            <form className="admin-content-form" onSubmit={submitEntry}>
              <div className="admin-form-heading">
                <div><p className="eyebrow">Editor</p><h2>{form.id ? "Edit story" : "Add story"}</h2></div>
                <button type="button" className="admin-text-button" onClick={startNew}>Clear / new</button>
              </div>
              <label>Title<input required value={form.title} onChange={(event) => updateForm("title", event.target.value)} /></label>
              <div className="admin-form-grid">
                <label>Chapter label<input placeholder="Chapter 01" value={form.chapter_label} onChange={(event) => updateForm("chapter_label", event.target.value)} /></label>
                <label>Entry date<input type="date" value={form.entry_date} onChange={(event) => updateForm("entry_date", event.target.value)} /></label>
              </div>
              <div className="admin-form-grid">
                <label>Category<select value={form.category} onChange={(event) => updateForm("category", event.target.value)}>{vanCliburnCategories.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
                <label>Display order<input type="number" min="0" step="1" value={form.display_order} onChange={(event) => updateForm("display_order", event.target.value)} /></label>
              </div>
              <label>Publication<select value={form.is_published ? "published" : "draft"} disabled={form.is_archived} onChange={(event) => updateForm("is_published", event.target.value === "published")}><option value="draft">Draft</option><option value="published">Published</option></select></label>
              <label>Excerpt<textarea rows={4} value={form.excerpt} onChange={(event) => updateForm("excerpt", event.target.value)} /></label>
              <label>Full story text<textarea rows={12} value={form.body} onChange={(event) => updateForm("body", event.target.value)} /></label>
              <div className="admin-story-upload-group">
                <p>Photograph</p>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="admin-story-file-input" onChange={handleFileChange} />
                <button type="button" className="admin-story-upload" onClick={() => fileInputRef.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} disabled={uploading || migrationRequired}>{uploading ? "Uploading photograph…" : "Drop a JPG, PNG, or WebP here, or click to upload"}</button>
                {form.image_url ? <img src={form.image_url} alt="Story preview" className="admin-story-upload-preview" /> : null}
              </div>
              <label>Image URL fallback<input value={form.image_url} onChange={(event) => updateForm("image_url", event.target.value)} /></label>
              {form.is_archived ? <p className="admin-story-muted">This story is archived. Restore it from the list before publishing.</p> : null}
              <button type="submit" disabled={saving || form.is_archived || migrationRequired}>{saving ? "Saving…" : form.id ? "Update story" : "Create story"}</button>
            </form>

            <section className="admin-content-list admin-story-admin-list">
              <div className="admin-list-heading">
                <div><p className="eyebrow">Archive</p><h2>Stories</h2></div>
                <button type="button" className="admin-text-button" onClick={() => void loadEntries()} disabled={loading}>Refresh</button>
              </div>
              {entries.length ? entries.map((entry) => (
                <article className="admin-story-admin-row" key={entry.id}>
                  {entry.image_url ? <img src={entry.image_url} alt="" /> : null}
                  <div className="admin-story-admin-copy">
                    <span className={`admin-status admin-status-${storyStatus(entry)}`}>{storyStatus(entry)}</span>
                    <h3>{entry.title}</h3>
                    <p>{[entry.chapter_label, entry.entry_date, entry.category, `order ${entry.display_order}`].filter(Boolean).join(" / ")}</p>
                    <div className="admin-row-actions">
                      <button type="button" onClick={() => editEntry(entry)}>Edit</button>
                      {!entry.is_archived ? <button type="button" onClick={() => void changePublication(entry)} disabled={saving || migrationRequired}>{entry.is_published ? "Unpublish" : "Publish"}</button> : null}
                      {!entry.is_archived ? <button type="button" className="admin-danger-button" onClick={() => void archiveEntry(entry)} disabled={saving || migrationRequired}>Archive</button> : <button type="button" onClick={() => void restoreEntry(entry)} disabled={saving || migrationRequired}>Restore as draft</button>}
                    </div>
                  </div>
                </article>
              )) : <p className="admin-empty">No Van Cliburn stories found.</p>}
            </section>
          </div>
        ) : null}
      </main>
    </section>
  );
}
