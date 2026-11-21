This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## MattYC Studio content archive

The Creation area reads published content from four MattYC-prefixed tables in the
shared Supabase project: `mattyc_projects`, `mattyc_series`, `mattyc_episodes`, and
`mattyc_creative_works`. If Supabase is unavailable or the content migration has
not been applied, the public site remains usable and shows intentional
archive-in-progress states instead of static counts.

Apply `supabase/migrations/20260824000000_add_mattyc_creation_content.sql` manually
in the existing Supabase project. The migration extends the current integration;
it does not alter `matt_drill_library`, `matt_weekly_drill_plan_items`,
`matt_weekly_drill_plans`, `van_cliburn_story_entries`, or any other existing table.
It does not deploy the application or create a new Supabase project.

After applying it, enter the real content in Supabase:

- the 15 Hanon A-Day episode titles, exercise numbers, topics, descriptions,
  thumbnails, YouTube links, TikTok links, and publication dates
- the two original/experimental work titles, descriptions, dates, artwork, and
  real Chrome Music Lab project links (`tool_used` should be `Chrome Music Lab`)

Keep rows as `draft` until they are ready. Public RLS policies expose only rows
with `status = 'published'` whose parent project and series are also published.

## MattYC content admin

The internal content manager is available at `/admin/mattyc-content`. It keeps the
existing passcode-style entry experience but validates the passcode on the server,
stores authentication in a signed HttpOnly cookie, and performs all MattYC content
writes in server-only route handlers.

Configure these server-only values in `.env.local` and in the hosting environment:

```text
MATTYC_ADMIN_PASSCODE=choose-a-private-passcode
MATTYC_ADMIN_SESSION_SECRET=use-a-long-random-secret
SUPABASE_SERVICE_ROLE_KEY=the-existing-project-service-role-key
```

Never prefix the session secret or service-role key with `NEXT_PUBLIC_`. The service
role is not imported by client components and is used only after the signed admin
session is verified. Public RLS policies remain read-only; no additional database
migration is required for the admin interface beyond the existing MattYC content
migration.

`NEXT_PUBLIC_ADMIN_PASSCODE` is not accepted by either admin screen. Both
`/admin/mattyc-content` and `/admin/van-cliburn-story` use the same
`MATTYC_ADMIN_PASSCODE` login and signed HttpOnly session cookie.

## Van Cliburn Journey admin

The Van Cliburn editor is linked from the main content back office. Story reads,
writes, publication changes, archiving, and image uploads are routed through
authenticated server handlers; browser code does not receive the service-role key
and does not write directly to Supabase.

Before enabling writes, run the read-only review query at
`supabase/inspection/van_cliburn_security_review.sql`. Review the returned columns,
table policies, grants, bucket settings, and Storage policies. Then review and
manually apply `supabase/migrations/20261121000000_secure_van_cliburn_story_admin.sql`.
The migration adds `is_archived` with a `false` default, preserves all existing
records, IDs, and image URLs, removes public table-write privileges, limits public
reads to published non-archived stories, and blocks browser writes to the existing
`van-cliburn-story-images` bucket. It is never applied by the application.

Until that migration is approved and applied, existing published stories continue
to render through a backward-compatible read path. The admin lists them read-only
and disables create, update, publication, archive, and upload controls.

The admin manages metadata, external links, and still-image uploads. YouTube,
TikTok, Chrome Music Lab, and all other video/audio media remain externally hosted;
no video upload or video storage workflow is included.

### Supabase Storage setup (manual)

Create the image bucket manually in the same existing Supabase project. The app
does not create or modify Storage configuration automatically.

1. In **Supabase Dashboard → Storage**, create a bucket named exactly
   `mattyc-content`.
2. Make the bucket **public** so the stored public URLs can be rendered on the
   website.
3. Set the bucket file-size limit to **5 MB**.
4. Restrict allowed MIME types to `image/jpeg`, `image/png`, and `image/webp`.
5. Do not add anonymous upload/update/delete policies. Uploads go through the
   authenticated MattYC admin route and its server-only service-role client.

The application stores original uploaded files without cropping or rewriting them,
using these paths:

- `episodes/<content-slug>/<unique-id>.<extension>`
- `series/<content-slug>/<unique-id>.<extension>`
- `originals/<content-slug>/<unique-id>.<extension>`

Episode thumbnails and creative-work artwork are presented portrait-first. Use
9:16 artwork where possible: **1080 × 1920 px** is recommended and **720 × 1280
px** is a practical minimum. A different valid image ratio is allowed and only
shows a non-blocking warning in the admin. The database URL columns remain
ratio-agnostic, and the manual URL inputs remain available as a fallback.

For the initial archive, open **Episodes**, confirm **Hanon A-Day** is selected, and
use **Save & Add Next Episode** to work through episodes 01–15. Open **Originals &
Experiments** to enter the two works, leaving `Chrome Music Lab` as the tool and
placing the project link in the external-project URL field.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
