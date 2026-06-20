"use client";

import { ChangeEvent, DragEvent, FormEvent, useEffect, useRef, useState } from "react";
import { supabase, type VanCliburnStoryEntry } from "../../../lib/supabase";

const categories = [
  "decision",
  "preparation",
  "repertoire",
  "technique",
  "performance",
  "recording",
  "reflection",
  "submission",
  "lesson",
];

const initialForm = {
  title: "",
  chapter_label: "",
  entry_date: "",
  category: "preparation",
  excerpt: "",
  body: "",
  image_url: "",
  display_order: "0",
  is_published: true,
};

type StoryForm = typeof initialForm;

const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const storageBucket = "van-cliburn-story-images";

function cleanOptional(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function safeFileName(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  const extension = dotIndex >= 0 ? fileName.slice(dotIndex).toLowerCase() : "";
  const baseName = dotIndex >= 0 ? fileName.slice(0, dotIndex) : fileName;

  return `${baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}${extension}`;
}

export default function VanCliburnStoryAdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [gateMessage, setGateMessage] = useState("");
  const [form, setForm] = useState<StoryForm>(initialForm);
  const [entries, setEntries] = useState<VanCliburnStoryEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const configuredPasscode = process.env.NEXT_PUBLIC_ADMIN_PASSCODE;
  const hasSupabaseUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseAnonKey = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  useEffect(() => {
    if (window.sessionStorage.getItem("van-cliburn-story-admin") === "unlocked") {
      setIsUnlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isUnlocked) {
      void loadEntries();
    }
  }, [isUnlocked]);

  async function loadEntries() {
    if (!supabase) {
      setErrorMessage("Supabase is not configured yet. Add the public Supabase env variables.");
      return;
    }

    setIsLoadingEntries(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("van_cliburn_story_entries")
      .select(
        "id,title,chapter_label,entry_date,category,excerpt,body,image_url,is_published,display_order,created_at,updated_at",
      )
      .order("display_order", { ascending: true })
      .order("entry_date", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setEntries((data ?? []) as VanCliburnStoryEntry[]);
    }

    setIsLoadingEntries(false);
  }

  function unlockAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!configuredPasscode) {
      setGateMessage("NEXT_PUBLIC_ADMIN_PASSCODE is not configured yet.");
      return;
    }

    if (passcode === configuredPasscode) {
      window.sessionStorage.setItem("van-cliburn-story-admin", "unlocked");
      setIsUnlocked(true);
      setGateMessage("");
      return;
    }

    setGateMessage("Passcode is not correct.");
  }

  function updateForm<K extends keyof StoryForm>(key: K, value: StoryForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function uploadImage(file: File) {
    if (!supabase) {
      setUploadError("Supabase is not configured yet. Add the public Supabase env variables.");
      return;
    }

    if (!acceptedImageTypes.includes(file.type)) {
      setUploadError("Please upload a JPG, PNG, or WebP image.");
      return;
    }

    setIsUploadingImage(true);
    setUploadMessage("Uploading image...");
    setUploadError("");

    const filePath = `story-images/${Date.now()}-${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(storageBucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

    if (error) {
      setUploadError(error.message);
      setUploadMessage("");
      setIsUploadingImage(false);
      return;
    }

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(filePath);

    updateForm("image_url", data.publicUrl);
    setUploadMessage("Image uploaded");
    setIsUploadingImage(false);
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      void uploadImage(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];

    if (file) {
      void uploadImage(file);
    }
  }

  async function submitEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage("Supabase is not configured yet. Add the public Supabase env variables.");
      return;
    }

    if (!form.title.trim()) {
      setErrorMessage("Title is required.");
      return;
    }

    setIsSaving(true);
    setStatusMessage("");
    setErrorMessage("");

    const { error } = await supabase.from("van_cliburn_story_entries").insert({
      title: form.title.trim(),
      chapter_label: cleanOptional(form.chapter_label),
      entry_date: cleanOptional(form.entry_date),
      category: cleanOptional(form.category),
      excerpt: cleanOptional(form.excerpt),
      body: cleanOptional(form.body),
      image_url: cleanOptional(form.image_url),
      display_order: Number(form.display_order) || 0,
      is_published: form.is_published,
    });

    if (error) {
      setErrorMessage(error.message);
    } else {
      setStatusMessage("Story entry added.");
      setForm(initialForm);
      setUploadMessage("");
      setUploadError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      await loadEntries();
    }

    setIsSaving(false);
  }

  if (!isUnlocked) {
    return (
      <section className="admin-story-page">
        <div className="admin-story-gate">
          <p className="eyebrow">Internal</p>
          <h1>Van Cliburn Story Admin</h1>
          <form onSubmit={unlockAdmin} className="admin-story-passcode">
            <label htmlFor="admin-passcode">Passcode</label>
            <input
              id="admin-passcode"
              type="password"
              value={passcode}
              onChange={(event) => setPasscode(event.target.value)}
              autoComplete="current-password"
            />
            <button type="submit">Enter</button>
            {gateMessage ? <p className="admin-story-error">{gateMessage}</p> : null}
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-story-page">
      <div className="admin-story-shell">
        <div className="admin-story-heading">
          <p className="eyebrow">Internal</p>
          <h1>Van Cliburn Story Entries</h1>
          <p>Add new storybook entries for the Road to 2027 Van Cliburn archive.</p>
          {!supabase ? (
            <p className="admin-story-debug">
              has NEXT_PUBLIC_SUPABASE_URL: {hasSupabaseUrl ? "yes" : "no"} / has
              NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasSupabaseAnonKey ? "yes" : "no"}
            </p>
          ) : null}
        </div>

        <form onSubmit={submitEntry} className="admin-story-form">
          <label>
            Title
            <input
              required
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />
          </label>

          <div className="admin-story-form-grid">
            <label>
              Chapter label
              <input
                placeholder="Chapter 01"
                value={form.chapter_label}
                onChange={(event) => updateForm("chapter_label", event.target.value)}
              />
            </label>
            <label>
              Entry date
              <input
                type="date"
                value={form.entry_date}
                onChange={(event) => updateForm("entry_date", event.target.value)}
              />
            </label>
          </div>

          <div className="admin-story-form-grid">
            <label>
              Category
              <select
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
              >
                {categories.map((category) => (
                  <option value={category} key={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Display order
              <input
                type="number"
                value={form.display_order}
                onChange={(event) => updateForm("display_order", event.target.value)}
              />
            </label>
          </div>

          <label>
            Excerpt
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(event) => updateForm("excerpt", event.target.value)}
            />
          </label>

          <label>
            Body
            <textarea
              rows={8}
              value={form.body}
              onChange={(event) => updateForm("body", event.target.value)}
            />
          </label>

          <div className="admin-story-upload-group">
            <p>Image</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="admin-story-file-input"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="admin-story-upload"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              disabled={isUploadingImage}
            >
              {isUploadingImage ? "Uploading image..." : "Drop image here or click to upload"}
            </button>
            {uploadMessage ? <p className="admin-story-success">{uploadMessage}</p> : null}
            {uploadError ? <p className="admin-story-error">{uploadError}</p> : null}
            {form.image_url ? (
              <img src={form.image_url} alt="" className="admin-story-upload-preview" />
            ) : null}
          </div>

          <label>
            Image URL fallback
            <input
              value={form.image_url}
              onChange={(event) => updateForm("image_url", event.target.value)}
            />
          </label>

          <label className="admin-story-checkbox">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(event) => updateForm("is_published", event.target.checked)}
            />
            Published
          </label>

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Adding..." : "Add Story Entry"}
          </button>
          {statusMessage ? <p className="admin-story-success">{statusMessage}</p> : null}
          {errorMessage ? <p className="admin-story-error">{errorMessage}</p> : null}
        </form>

        <div className="admin-story-list">
          <div className="admin-story-list-heading">
            <h2>Existing Entries</h2>
            <button type="button" onClick={() => void loadEntries()} disabled={isLoadingEntries}>
              {isLoadingEntries ? "Loading..." : "Refresh"}
            </button>
          </div>

          {entries.length > 0 ? (
            <div className="admin-story-table">
              {entries.map((entry) => (
                <article className="admin-story-row" key={entry.id}>
                  <div>
                    <h3>{entry.title}</h3>
                    <p>
                      {[entry.chapter_label, entry.entry_date, entry.category]
                        .filter(Boolean)
                        .join(" / ")}
                    </p>
                  </div>
                  <span>{entry.is_published ? "Published" : "Draft"}</span>
                </article>
              ))}
            </div>
          ) : (
            <p className="admin-story-muted">No entries found yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
