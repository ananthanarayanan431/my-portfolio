# Personal Website — Design

**Date:** 2026-09-24
**Status:** Approved

## Intent

A personal website whose primary job is **professional credibility and hiring** —
a polished place for recruiters, clients, and collaborators to land on and quickly
understand who the owner is, what they have built, and how to reach them.

The reference the owner supplied is <https://www.piyushgarg.dev/>. What we take from
it is the *feel*: minimal, dark, a single scrolling homepage built from tight
sections, with a small number of secondary pages. What we deliberately do **not**
take is its section list — courses, cohorts, and a guestbook serve a content-creator
business, not a hiring signal.

### Success criteria

- A visitor understands the owner's role, experience, and best work within one screen
  and one scroll.
- The owner can replace every piece of placeholder content by editing a small,
  obvious set of files, without touching component markup.
- The site builds to static output and deploys unchanged to Vercel, Netlify,
  Cloudflare Pages, or GitHub Pages.

### Explicitly agreed with the owner

- All four content areas are in scope: work experience, projects, blog, skills +
  resume download.
- The site ships with **realistic placeholder content**, clearly marked, which the
  owner edits afterwards. We are not interviewing for real content in this pass.

## Stack

| Concern | Choice | Why |
|---|---|---|
| Framework | Astro 5, `output: 'static'` | Content site with near-zero client JS; static deploys anywhere with no adapter. |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | No config file needed in v4; keeps spacing/type consistent across sections without hand-rolled tokens. |
| Content | Astro Content Collections + Zod | Frontmatter is validated at build time, so a malformed post date fails the build instead of shipping. |
| Posts | MDX | Prose plus the option of embedded components later. |
| Feeds | `@astrojs/rss`, `@astrojs/sitemap` | Standard, small, no lock-in. |
| Package manager | pnpm | Already installed on the machine. |

### Alternatives rejected

- **Plain CSS with hand-rolled design tokens.** Removes a dependency but is slower to
  build and harder to keep visually consistent across sections.
- **A prebuilt theme (AstroWind, Astrofy).** Fastest possible start, but customization
  becomes a fight with someone else's structure and assumptions.

## Pages

| Route | Contents |
|---|---|
| `/` | Hero (name, title, bio, social links), work experience timeline, three featured projects, skills strip |
| `/projects` | All projects |
| `/blog` | Post listing, newest first |
| `/blog/[slug]` | Individual post |
| `/rss.xml` | Feed of published posts |
| `/404` | Not found |

## Where content lives

This is the part that matters most to the owner, since they populate it later. The
rule: **content lives in data and content files; components never hardcode copy.**

- `src/config/site.ts` — name, title, short bio, social URLs, nav items, resume path,
  site URL. One file, edited once.
- `src/data/experience.ts` — typed array of roles (company, title, start, end, bullets).
  A missing field is a TypeScript error.
- `src/data/skills.ts` — typed array of skill groups.
- `src/content/blog/*.mdx` — posts. Frontmatter: `title`, `description`, `pubDate`,
  optional `updatedDate`, `tags`, `draft`.
- `src/content/projects/*.md` — projects. Frontmatter: `name`, `description`, `tech`,
  optional `liveUrl`, `repoUrl`, `featured`, `order`.
- `public/resume.pdf` — placeholder PDF served by the resume button.

`featured: true` on a project controls its appearance on the homepage; `order`
controls sequence. Drafts are excluded from production builds.

## Appearance

- Dark-first, matching the reference's mood. Colors defined as CSS custom properties
  on `:root`, redefined for light mode.
- Light-mode toggle, persisted to `localStorage`, applied before first paint to avoid
  a flash of the wrong theme.
- Astro view transitions between pages.
- Responsive to phone width: 16px side gutters, no horizontal page scroll.

## Out of scope (deliberate)

Both are straightforward to add later; neither earns its place now.

- **Per-project detail pages.** Project cards link directly to the live demo and the
  repo, which is what a reviewer actually clicks.
- **GitHub / YouTube activity dashboard.** Requires API tokens and a build-time fetch,
  and it is a content-creator signal rather than a hiring signal.

Also out of scope: guestbook, courses, cohorts, comments, analytics, CMS integration.

## Verification

- `pnpm astro check` passes — types across `.astro` and `.ts`.
- `pnpm build` succeeds and emits the expected routes.
- Unit tests (Vitest), written test-first, for the pure helpers that carry real logic:
  post sorting, draft filtering, and date formatting. Components and layout are
  verified by the build and by looking at the running site, not by unit tests.
