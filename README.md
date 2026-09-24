# Personal Website

Astro 7 static site. Dark-first, no server required.

## Commands

| Command | Does |
|---|---|
| `pnpm dev` | Dev server (drafts ARE visible here) |
| `pnpm build` | Production build to `dist/` (drafts excluded) |
| `pnpm preview` | Serve the production build locally |
| `pnpm check` | Type-check `.astro` and `.ts` |
| `pnpm test` | Run unit tests |

## Editing your content

Everything below is placeholder. Replace it in this order:

1. **`src/config/site.ts`** — your name, title, bio, location, social URLs, nav.
2. **`src/data/experience.ts`** — your roles. `end: null` renders as "Present".
3. **`src/data/skills.ts`** — your stack.
4. **`src/content/projects/*.md`** — one file per project. `featured: true` puts it on
   the homepage; `order` controls sequence. `liveUrl` and `repoUrl` are both optional.
5. **`src/content/blog/*.mdx`** — one file per post. Set `draft: true` to keep a post
   out of the production build.
6. **`public/resume.pdf`** — replace with your real CV.
7. **`astro.config.mjs`** — set `site` to your real domain, or the sitemap and RSS feed
   will point at `example.com`.

## Requirements

- Node `>=22.12.0`
- TypeScript is pinned to `^6` because `astro check` does not support TypeScript 7.
  Do not upgrade it.

## Deploying

The build output is fully static, so any static host works.

- **Vercel / Netlify** — build command `pnpm build`, output directory `dist`.
- **Cloudflare Pages** — same, with `NODE_VERSION=22`.
- **GitHub Pages** — set `site` and `base` in `astro.config.mjs`, then publish `dist/`.
