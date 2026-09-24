# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static, dark-first personal website for professional credibility and hiring, with a hero, work-experience timeline, projects, blog, skills, and resume download — populated with clearly-marked placeholder content the owner edits later.

**Architecture:** Astro 7 static site. Structured content lives in typed TS data files (`src/config`, `src/data`); prose content lives in Zod-validated content collections (`src/content/blog`, `src/content/projects`). Components never hardcode copy — they read from those sources. Pure list/date logic is extracted into `src/lib/` so it can be unit-tested without rendering.

**Tech Stack:** Astro `^7.3.5`, Tailwind CSS v4 (`@tailwindcss/vite`), `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`, Vitest `^5`, TypeScript `^6`, pnpm.

**Spec:** `docs/superpowers/specs/2026-09-24-persona-website-design.md`

## Global Constraints

- **TypeScript must be `^6.0.3`.** `astro check` errors out on TypeScript 7 ("astro check does not currently support TypeScript 7.0"). Do not upgrade.
- **Node `>=22.12.0`** — set in `package.json` `engines`.
- Astro 7 uses the **Rust compiler**: every non-void HTML element needs a closing tag, or the build fails.
- Content collection entries are addressed by **`post.id`**, not `post.slug`. Rendering is `const { Content } = await render(entry)` with `render` imported from `astro:content` — not `entry.render()`.
- Collections are defined in **`src/content.config.ts`** using `glob()` from `astro/loaders` and `z` from `astro/zod`.
- Tailwind v4 has **no config file**. It wires in via `vite: { plugins: [tailwindcss()] }` plus `@import "tailwindcss";` at the top of `src/styles/global.css`.
- **All placeholder content must be obviously placeholder** (e.g. "Your Name", "Acme Corp") so the owner can find and replace it.
- Package manager is **pnpm**. Commit after every task.

## Review Focus

Input classes the spec implies but that no feature step naturally exercises. Each has a test pinned to the task that owns the code.

1. **Draft posts must never ship.** A post with `draft: true` must be absent from `/blog`, from `/blog/[slug]` routes, and from `rss.xml` in a production build. — Task 2 (unit), Task 7 (build assertion).
2. **Empty collections must not crash the build.** Zero projects or zero posts must render an empty state, not throw on `posts[0]`. — Task 2 (unit), Tasks 6 & 7 (empty-state markup).
3. **Projects with no links.** A project with neither `liveUrl` nor `repoUrl` must render a card with no empty or broken anchors. — Task 6.
4. **Theme must not flash, and must survive blocked storage.** The stored theme applies before first paint, and a `localStorage` access that throws (private browsing / blocked cookies) must not break the page. — Task 3.
5. **Ties in `pubDate` must sort deterministically.** Two posts with the same date must not reorder between builds. — Task 2.

---

### Task 1: Project scaffold and build pipeline

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/styles/global.css`, `src/pages/index.astro`

**Interfaces:**
- Consumes: nothing.
- Produces: a working `pnpm build`, `pnpm check`, `pnpm test` pipeline that all later tasks rely on.

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "me-anantha",
  "type": "module",
  "version": "0.1.0",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "astro": "astro"
  },
  "dependencies": {
    "@astrojs/mdx": "^8.0.2",
    "@astrojs/rss": "^4.0.19",
    "@astrojs/sitemap": "^3.7.4",
    "astro": "^7.3.5",
    "sharp": "^0.35.0"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.10",
    "@tailwindcss/vite": "^4.3.3",
    "tailwindcss": "^4.3.3",
    "typescript": "^6.0.3",
    "vitest": "^5.0.1"
  },
  "allowScripts": { "esbuild": true, "sharp": true }
}
```

- [ ] **Step 2: Install dependencies**

Run: `pnpm install`
Expected: completes with no peer-dependency errors.

- [ ] **Step 3: Create `astro.config.mjs`**

`site` is used by `@astrojs/sitemap` and `@astrojs/rss`; leave the placeholder and note it for the owner.

```js
// @ts-check
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// PLACEHOLDER: replace `site` with your real domain before deploying.
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": { "strictNullChecks": true }
}
```

- [ ] **Step 5: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
```

- [ ] **Step 6: Create `.gitignore`**

```
dist/
.astro/
node_modules/
.DS_Store
*.log
.env
.env.production
```

- [ ] **Step 7: Create `src/styles/global.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 8: Create a temporary `src/pages/index.astro` to prove the pipeline**

```astro
---
import '../styles/global.css';
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Scaffold</title>
  </head>
  <body>
    <p class="text-3xl font-bold underline">scaffold ok</p>
  </body>
</html>
```

- [ ] **Step 9: Verify build, check, and test all pass**

Run: `pnpm build && pnpm check && pnpm test`
Expected: build completes ("Complete!"); check reports `0 errors`; vitest reports "No test files found" and exits 0.

If vitest exits non-zero on no tests, add `"passWithNoTests": true` to the `test` block in `vitest.config.ts`.

- [ ] **Step 10: Confirm Tailwind actually emitted utilities**

Run: `grep -r "underline" dist/_astro/*.css`
Expected: at least one match. If there is no match, Tailwind is not wired — recheck the `vite.plugins` entry and the `@import "tailwindcss";` line.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 7 project with Tailwind v4 and Vitest"
```

---

### Task 2: Pure helpers for sorting, filtering, and dates (TDD)

This is the only task with real branching logic, so it is written test-first and carries the Review Focus cases for drafts, empty collections, and date ties.

**Files:**
- Create: `src/lib/date.ts`, `src/lib/posts.ts`, `src/lib/projects.ts`
- Test: `tests/date.test.ts`, `tests/posts.test.ts`, `tests/projects.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces — later tasks import exactly these:
  - `formatDate(date: Date, locale?: string): string`
  - `PostLike` — `{ id: string; data: { pubDate: Date; draft?: boolean } }`
  - `filterDrafts<T extends PostLike>(posts: T[], includeDrafts: boolean): T[]`
  - `sortPostsByDate<T extends PostLike>(posts: T[]): T[]`
  - `ProjectLike` — `{ id: string; data: { featured?: boolean; order?: number } }`
  - `sortProjects<T extends ProjectLike>(projects: T[]): T[]`
  - `featuredProjects<T extends ProjectLike>(projects: T[], limit: number): T[]`

- [ ] **Step 1: Write the failing date test**

`timeZone: 'UTC'` is pinned so the output does not change with the machine's timezone.

```ts
// tests/date.test.ts
import { describe, expect, it } from 'vitest';
import { formatDate } from '../src/lib/date';

describe('formatDate', () => {
  it('formats a date as "Mon D, YYYY"', () => {
    expect(formatDate(new Date('2026-03-09T00:00:00Z'))).toBe('Mar 9, 2026');
  });

  it('is timezone-stable for dates near midnight UTC', () => {
    expect(formatDate(new Date('2026-01-01T00:30:00Z'))).toBe('Jan 1, 2026');
  });
});
```

- [ ] **Step 2: Run it to make sure it fails**

Run: `pnpm vitest run tests/date.test.ts`
Expected: FAIL — cannot resolve `../src/lib/date`.

- [ ] **Step 3: Implement `src/lib/date.ts`**

```ts
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
```

- [ ] **Step 4: Run the date test and make sure it passes**

Run: `pnpm vitest run tests/date.test.ts`
Expected: 2 passed.

- [ ] **Step 5: Write the failing posts test**

Covers Review Focus 1 (drafts), 2 (empty), and 5 (date ties).

```ts
// tests/posts.test.ts
import { describe, expect, it } from 'vitest';
import { filterDrafts, sortPostsByDate, type PostLike } from '../src/lib/posts';

const post = (id: string, date: string, draft = false): PostLike => ({
  id,
  data: { pubDate: new Date(date), draft },
});

describe('filterDrafts', () => {
  it('removes drafts when drafts are excluded', () => {
    const posts = [post('a', '2026-01-01'), post('b', '2026-01-02', true)];
    expect(filterDrafts(posts, false).map((p) => p.id)).toEqual(['a']);
  });

  it('keeps drafts when drafts are included', () => {
    const posts = [post('a', '2026-01-01'), post('b', '2026-01-02', true)];
    expect(filterDrafts(posts, true).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('treats a missing draft field as published', () => {
    const posts: PostLike[] = [{ id: 'a', data: { pubDate: new Date('2026-01-01') } }];
    expect(filterDrafts(posts, false)).toHaveLength(1);
  });

  it('returns an empty array for an empty collection', () => {
    expect(filterDrafts([], false)).toEqual([]);
  });
});

describe('sortPostsByDate', () => {
  it('orders newest first', () => {
    const posts = [post('old', '2026-01-01'), post('new', '2026-06-01')];
    expect(sortPostsByDate(posts).map((p) => p.id)).toEqual(['new', 'old']);
  });

  it('breaks ties by id so ordering is deterministic across builds', () => {
    const posts = [post('zebra', '2026-01-01'), post('apple', '2026-01-01')];
    expect(sortPostsByDate(posts).map((p) => p.id)).toEqual(['apple', 'zebra']);
  });

  it('does not mutate the input array', () => {
    const posts = [post('old', '2026-01-01'), post('new', '2026-06-01')];
    sortPostsByDate(posts);
    expect(posts.map((p) => p.id)).toEqual(['old', 'new']);
  });

  it('returns an empty array for an empty collection', () => {
    expect(sortPostsByDate([])).toEqual([]);
  });
});
```

- [ ] **Step 6: Run it to make sure it fails**

Run: `pnpm vitest run tests/posts.test.ts`
Expected: FAIL — cannot resolve `../src/lib/posts`.

- [ ] **Step 7: Implement `src/lib/posts.ts`**

```ts
export interface PostLike {
  id: string;
  data: { pubDate: Date; draft?: boolean };
}

export function filterDrafts<T extends PostLike>(posts: T[], includeDrafts: boolean): T[] {
  return includeDrafts ? posts : posts.filter((p) => !p.data.draft);
}

export function sortPostsByDate<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const byDate = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
  });
}
```

- [ ] **Step 8: Run the posts test and make sure it passes**

Run: `pnpm vitest run tests/posts.test.ts`
Expected: 8 passed.

- [ ] **Step 9: Write the failing projects test**

```ts
// tests/projects.test.ts
import { describe, expect, it } from 'vitest';
import { featuredProjects, sortProjects, type ProjectLike } from '../src/lib/projects';

const project = (id: string, order?: number, featured = false): ProjectLike => ({
  id,
  data: { order, featured },
});

describe('sortProjects', () => {
  it('orders by ascending order value', () => {
    const projects = [project('b', 2), project('a', 1)];
    expect(sortProjects(projects).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('places projects without an order value last, sorted by id', () => {
    const projects = [project('zebra'), project('apple'), project('ordered', 1)];
    expect(sortProjects(projects).map((p) => p.id)).toEqual(['ordered', 'apple', 'zebra']);
  });

  it('does not mutate the input array', () => {
    const projects = [project('b', 2), project('a', 1)];
    sortProjects(projects);
    expect(projects.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('returns an empty array for an empty collection', () => {
    expect(sortProjects([])).toEqual([]);
  });
});

describe('featuredProjects', () => {
  it('returns only featured projects, limited and ordered', () => {
    const projects = [
      project('c', 3, true),
      project('a', 1, true),
      project('skip', 2, false),
      project('b', 4, true),
    ];
    expect(featuredProjects(projects, 2).map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('returns an empty array when nothing is featured', () => {
    expect(featuredProjects([project('a', 1, false)], 3)).toEqual([]);
  });

  it('returns fewer than the limit when not enough are featured', () => {
    expect(featuredProjects([project('a', 1, true)], 3)).toHaveLength(1);
  });
});
```

- [ ] **Step 10: Run it to make sure it fails**

Run: `pnpm vitest run tests/projects.test.ts`
Expected: FAIL — cannot resolve `../src/lib/projects`.

- [ ] **Step 11: Implement `src/lib/projects.ts`**

```ts
export interface ProjectLike {
  id: string;
  data: { featured?: boolean; order?: number };
}

export function sortProjects<T extends ProjectLike>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const ao = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.data.order ?? Number.MAX_SAFE_INTEGER;
    return ao !== bo ? ao - bo : a.id.localeCompare(b.id);
  });
}

export function featuredProjects<T extends ProjectLike>(projects: T[], limit: number): T[] {
  return sortProjects(projects.filter((p) => p.data.featured)).slice(0, limit);
}
```

- [ ] **Step 12: Run the whole suite and make sure it passes**

Run: `pnpm test`
Expected: 3 files, 17 passed, 0 failed.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add tested helpers for post sorting, draft filtering, and dates"
```

---

### Task 3: Design tokens, base layout, and no-flash theme toggle

**Files:**
- Modify: `src/styles/global.css`
- Create: `src/components/BaseHead.astro`, `src/components/ThemeToggle.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/layouts/BaseLayout.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `src/config/site.ts` does not exist yet — Header and Footer take their nav/name as props in this task and are rewired to the config in Task 4.
- Produces:
  - `BaseLayout.astro` props: `{ title: string; description: string; }`, renders a `<slot />`.
  - `BaseHead.astro` props: `{ title: string; description: string; }`

- [ ] **Step 1: Replace `src/styles/global.css` with tokens**

Dark is the default; light is opt-in via `data-theme="light"`, matching the spec's dark-first requirement.

```css
@import "tailwindcss";

:root {
  --bg: #0b0b0f;
  --bg-subtle: #14141b;
  --border: #26262f;
  --text: #e8e8ed;
  --text-muted: #9a9aa8;
  --accent: #7c6cff;
}

:root[data-theme="light"] {
  --bg: #ffffff;
  --bg-subtle: #f5f5f7;
  --border: #e2e2e7;
  --text: #16161a;
  --text-muted: #5f5f6b;
  --accent: #5b48e0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg);
  color: var(--text);
}
```

- [ ] **Step 2: Create `src/components/BaseHead.astro`**

```astro
---
import '../styles/global.css';
import { ClientRouter } from 'astro:transitions';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site);
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={canonical} />
<meta name="twitter:card" content="summary_large_image" />
<link rel="sitemap" href="/sitemap-index.xml" />
<ClientRouter />
```

- [ ] **Step 3: Create `src/components/ThemeToggle.astro`**

Every `localStorage` access is wrapped in `try/catch` — Review Focus 4. The inline script in `<head>` (Step 5) is what prevents the flash; this component only handles clicks.

```astro
<button
  id="theme-toggle"
  type="button"
  aria-label="Toggle colour theme"
  class="rounded-md border border-[var(--border)] px-2 py-1 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
>
  <span aria-hidden="true" data-theme-icon>&#9789;</span>
</button>

<script>
  function readTheme(): string | null {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  }

  function writeTheme(value: string): void {
    try {
      localStorage.setItem('theme', value);
    } catch {
      /* storage blocked — theme still applies for this page view */
    }
  }

  function syncIcon(): void {
    const isLight = document.documentElement.dataset.theme === 'light';
    document.querySelectorAll('[data-theme-icon]').forEach((el) => {
      el.textContent = isLight ? '☀' : '☽';
    });
  }

  function bind(): void {
    syncIcon();
    document.getElementById('theme-toggle')?.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      document.documentElement.dataset.theme = next;
      writeTheme(next);
      syncIcon();
    });
  }

  bind();
  document.addEventListener('astro:after-swap', () => {
    const stored = readTheme();
    if (stored) document.documentElement.dataset.theme = stored;
    bind();
  });
</script>
```

- [ ] **Step 4: Create `src/components/Header.astro` and `src/components/Footer.astro`**

```astro
---
// src/components/Header.astro
import ThemeToggle from './ThemeToggle.astro';

interface Props {
  name: string;
  nav: { label: string; href: string }[];
}

const { name, nav } = Astro.props;
---

<header class="border-b border-[var(--border)]">
  <nav class="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
    <a href="/" class="font-semibold text-[var(--text)]">{name}</a>
    <div class="flex items-center gap-4">
      {
        nav.map((item) => (
          <a href={item.href} class="text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
            {item.label}
          </a>
        ))
      }
      <ThemeToggle />
    </div>
  </nav>
</header>
```

```astro
---
// src/components/Footer.astro
interface Props {
  name: string;
}

const { name } = Astro.props;
const year = new Date().getFullYear();
---

<footer class="mt-24 border-t border-[var(--border)]">
  <div class="mx-auto max-w-3xl px-4 py-8 text-sm text-[var(--text-muted)]">
    <p>&copy; {year} {name}</p>
  </div>
</footer>
```

- [ ] **Step 5: Create `src/layouts/BaseLayout.astro` with the no-flash script**

The `is:inline` script runs before the body paints, so the stored theme is applied with no flash — Review Focus 4.

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;

// PLACEHOLDER: replaced by src/config/site.ts in Task 4.
const name = 'Your Name';
const nav = [
  { label: 'Projects', href: '/projects' },
  { label: 'Blog', href: '/blog' },
];
---

<!doctype html>
<html lang="en" data-theme="dark">
  <head>
    <script is:inline>
      try {
        const stored = localStorage.getItem('theme');
        if (stored) document.documentElement.dataset.theme = stored;
      } catch (e) {
        /* storage blocked — fall back to the dark default */
      }
    </script>
    <BaseHead title={title} description={description} />
  </head>
  <body class="min-h-screen bg-[var(--bg)] text-[var(--text)] antialiased">
    <Header name={name} nav={nav} />
    <main class="mx-auto max-w-3xl px-4">
      <slot />
    </main>
    <Footer name={name} />
  </body>
</html>
```

- [ ] **Step 6: Rewrite `src/pages/index.astro` to use the layout**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="Your Name" description="Placeholder description.">
  <p class="py-12">Layout wired.</p>
</BaseLayout>
```

- [ ] **Step 7: Verify the build and types pass**

Run: `pnpm build && pnpm check`
Expected: build "Complete!"; check `0 errors`.

- [ ] **Step 8: Verify the no-flash script is inline in the output**

Run: `grep -c "documentElement.dataset.theme" dist/index.html`
Expected: at least `1`. If it is `0`, the `is:inline` directive is missing and the theme will flash.

- [ ] **Step 9: Verify the theme toggle by eye**

Run: `pnpm dev`, open the printed URL, click the toggle, reload the page.
Expected: theme switches, survives the reload, and there is no white flash on load.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, base layout, and no-flash theme toggle"
```

---

### Task 4: Site config, hero, and social links

**Files:**
- Create: `src/config/site.ts`, `src/components/SocialLinks.astro`, `src/components/Hero.astro`
- Modify: `src/layouts/BaseLayout.astro`, `src/pages/index.astro`

**Interfaces:**
- Consumes: `BaseLayout.astro` from Task 3.
- Produces: `SITE` from `src/config/site.ts`, shaped as below. Tasks 5–8 all import it.

- [ ] **Step 1: Create `src/config/site.ts`**

This is the file the owner edits first. Every value is placeholder.

```ts
export interface SocialLink {
  label: string;
  href: string;
  icon: 'github' | 'linkedin' | 'x' | 'email';
}

export interface NavItem {
  label: string;
  href: string;
}

export const SITE = {
  // PLACEHOLDER: replace everything in this file with your own details.
  name: 'Your Name',
  title: 'Software Engineer',
  description: 'Software engineer building reliable, well-tested systems.',
  bio: 'I build backend systems and developer tooling. Currently focused on distributed systems and developer experience. Previously at a few places you may have heard of.',
  location: 'Bengaluru, India',
  resumePath: '/resume.pdf',
  nav: [
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
  ] satisfies NavItem[],
  socials: [
    { label: 'GitHub', href: 'https://github.com/yourhandle', icon: 'github' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/yourhandle', icon: 'linkedin' },
    { label: 'X', href: 'https://x.com/yourhandle', icon: 'x' },
    { label: 'Email', href: 'mailto:you@example.com', icon: 'email' },
  ] satisfies SocialLink[],
} as const;
```

- [ ] **Step 2: Create `src/components/SocialLinks.astro`**

Icons are inline SVG paths so the project takes no icon dependency.

```astro
---
import { SITE } from '../config/site';

const PATHS: Record<string, string> = {
  github:
    'M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.731.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.180 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.7.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z',
  linkedin:
    'M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.71h.05c.53-.95 1.83-1.96 3.76-1.96 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.03-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21H9z',
  x: 'M17.53 3h3.04l-6.64 7.59L21.75 21h-5.9l-4.62-5.96L5.94 21H2.9l7.1-8.12L2.25 3h6.05l4.18 5.45zM16.4 19.2h1.68L7.73 4.7H5.93z',
  email:
    'M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5zm2.3-.5 7.7 6.1L19.7 5z',
};
---

<ul class="flex items-center gap-4">
  {
    SITE.socials.map((social) => (
      <li>
        <a
          href={social.href}
          aria-label={social.label}
          rel="me noopener noreferrer"
          target="_blank"
          class="text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d={PATHS[social.icon]}></path>
          </svg>
        </a>
      </li>
    ))
  }
</ul>
```

- [ ] **Step 3: Create `src/components/Hero.astro`**

```astro
---
import { SITE } from '../config/site';
import SocialLinks from './SocialLinks.astro';
---

<section class="py-16">
  <p class="text-sm text-[var(--text-muted)]">{SITE.location}</p>
  <h1 class="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">{SITE.name}</h1>
  <p class="mt-2 text-lg text-[var(--accent)]">{SITE.title}</p>
  <p class="mt-6 max-w-2xl leading-relaxed text-[var(--text-muted)]">{SITE.bio}</p>
  <div class="mt-8 flex flex-wrap items-center gap-6">
    <a
      href={SITE.resumePath}
      class="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
    >
      Download resume
    </a>
    <SocialLinks />
  </div>
</section>
```

- [ ] **Step 4: Rewire `BaseLayout.astro` to read from `SITE`**

Replace the placeholder `name`/`nav` constants in the frontmatter with an import, and pass `SITE.name` / `SITE.nav` to `Header` and `Footer`:

```astro
---
import BaseHead from '../components/BaseHead.astro';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import { SITE } from '../config/site';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---
```

Then in the body: `<Header name={SITE.name} nav={SITE.nav} />` and `<Footer name={SITE.name} />`.

- [ ] **Step 5: Update `src/pages/index.astro` to render the hero**

```astro
---
import { SITE } from '../config/site';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
---

<BaseLayout title={`${SITE.name} — ${SITE.title}`} description={SITE.description}>
  <Hero />
</BaseLayout>
```

- [ ] **Step 6: Verify build and types**

Run: `pnpm build && pnpm check`
Expected: build "Complete!"; check `0 errors`.

- [ ] **Step 7: Verify the hero content rendered**

Run: `grep -o "Your Name" dist/index.html | head -1`
Expected: `Your Name`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add site config, hero section, and social links"
```

---

### Task 5: Experience timeline, skills, and resume file

**Files:**
- Create: `src/data/experience.ts`, `src/data/skills.ts`, `src/components/Section.astro`, `src/components/Experience.astro`, `src/components/Skills.astro`, `public/resume.pdf`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SITE` (Task 4), `BaseLayout` (Task 3).
- Produces: `EXPERIENCE: Experience[]`, `SKILLS: SkillGroup[]`, and `Section.astro` with props `{ title: string; href?: string; }`.

- [ ] **Step 1: Create `src/data/experience.ts`**

`end: null` means "present", which the component renders as "Present".

```ts
export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string | null;
  url?: string;
  highlights: string[];
}

// PLACEHOLDER: replace with your real roles.
export const EXPERIENCE: Experience[] = [
  {
    company: 'Acme Corp',
    role: 'Senior Software Engineer',
    start: '2024',
    end: null,
    url: 'https://example.com',
    highlights: [
      'Led the migration of the billing service to an event-driven architecture, cutting p99 latency by 40%.',
      'Mentored three engineers through their first production on-call rotation.',
    ],
  },
  {
    company: 'Globex',
    role: 'Software Engineer',
    start: '2021',
    end: '2024',
    highlights: [
      'Built the internal design system adopted by six product teams.',
      'Reduced CI runtime from 22 minutes to 7 by parallelising the test suite.',
    ],
  },
];
```

- [ ] **Step 2: Create `src/data/skills.ts`**

```ts
export interface SkillGroup {
  category: string;
  items: string[];
}

// PLACEHOLDER: replace with your real stack.
export const SKILLS: SkillGroup[] = [
  { category: 'Languages', items: ['TypeScript', 'Python', 'Go', 'SQL'] },
  { category: 'Frameworks', items: ['Astro', 'React', 'Node.js', 'FastAPI'] },
  { category: 'Infrastructure', items: ['PostgreSQL', 'Redis', 'Docker', 'AWS'] },
];
```

- [ ] **Step 3: Create `src/components/Section.astro`**

```astro
---
interface Props {
  title: string;
  href?: string;
}

const { title, href } = Astro.props;
---

<section class="border-t border-[var(--border)] py-12">
  <div class="mb-6 flex items-baseline justify-between">
    <h2 class="text-xl font-semibold tracking-tight">{title}</h2>
    {
      href && (
        <a href={href} class="text-sm text-[var(--text-muted)] hover:text-[var(--accent)]">
          View all &rarr;
        </a>
      )
    }
  </div>
  <slot />
</section>
```

- [ ] **Step 4: Create `src/components/Experience.astro`**

```astro
---
import { EXPERIENCE } from '../data/experience';
---

<ol class="space-y-8">
  {
    EXPERIENCE.map((job) => (
      <li>
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h3 class="font-medium">
            {job.role} &middot;{' '}
            {job.url ? (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-[var(--accent)] hover:underline"
              >
                {job.company}
              </a>
            ) : (
              <span class="text-[var(--accent)]">{job.company}</span>
            )}
          </h3>
          <p class="text-sm text-[var(--text-muted)]">
            {job.start} &ndash; {job.end ?? 'Present'}
          </p>
        </div>
        <ul class="mt-3 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--text-muted)]">
          {job.highlights.map((point) => (
            <li>{point}</li>
          ))}
        </ul>
      </li>
    ))
  }
</ol>
```

- [ ] **Step 5: Create `src/components/Skills.astro`**

```astro
---
import { SKILLS } from '../data/skills';
---

<dl class="space-y-4">
  {
    SKILLS.map((group) => (
      <div class="flex flex-col gap-2 sm:flex-row sm:gap-6">
        <dt class="w-36 shrink-0 text-sm text-[var(--text-muted)]">{group.category}</dt>
        <dd class="flex flex-wrap gap-2">
          {group.items.map((item) => (
            <span class="rounded-md bg-[var(--bg-subtle)] px-2 py-1 text-sm">{item}</span>
          ))}
        </dd>
      </div>
    ))
  }
</dl>
```

- [ ] **Step 6: Create the placeholder `public/resume.pdf`**

The resume button must not 404. Generate a real one-page PDF:

```bash
mkdir -p public
printf 'PLACEHOLDER RESUME\n\nReplace public/resume.pdf with your real CV.\n' > /tmp/resume.txt
# macOS has `textutil` + `cupsfilter` built in:
textutil -convert html -output /tmp/resume.html /tmp/resume.txt && cupsfilter /tmp/resume.html > public/resume.pdf 2>/dev/null
# Verify it is a valid PDF:
head -c 4 public/resume.pdf
```

Expected: prints `%PDF`. If `cupsfilter` is unavailable, any valid one-page PDF works — the point is that the link resolves.

- [ ] **Step 7: Add the sections to `src/pages/index.astro`**

```astro
---
import { SITE } from '../config/site';
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/Hero.astro';
import Section from '../components/Section.astro';
import Experience from '../components/Experience.astro';
import Skills from '../components/Skills.astro';
---

<BaseLayout title={`${SITE.name} — ${SITE.title}`} description={SITE.description}>
  <Hero />
  <Section title="Experience">
    <Experience />
  </Section>
  <Section title="Skills">
    <Skills />
  </Section>
</BaseLayout>
```

- [ ] **Step 8: Verify build, types, and the resume link**

Run: `pnpm build && pnpm check && head -c 4 dist/resume.pdf`
Expected: build "Complete!"; check `0 errors`; prints `%PDF`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add experience timeline, skills, and resume download"
```

---

### Task 6: Projects collection, cards, and /projects page

**Files:**
- Create: `src/content.config.ts`, `src/content/projects/*.md` (4 files), `src/components/ProjectCard.astro`, `src/pages/projects/index.astro`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `sortProjects`, `featuredProjects` (Task 2); `Section.astro` (Task 5).
- Produces: the `projects` collection; `ProjectCard.astro` with props `{ project: CollectionEntry<'projects'> }`. Task 7 adds a `blog` collection to the same `src/content.config.ts`.

- [ ] **Step 1: Create `src/content.config.ts` with the projects collection**

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    tech: z.array(z.string()).default([]),
    liveUrl: z.url().optional(),
    repoUrl: z.url().optional(),
    featured: z.boolean().default(false),
    order: z.number().optional(),
  }),
});

export const collections = { projects };
```

- [ ] **Step 2: Create four placeholder projects**

The fourth deliberately has **no links** — that is Review Focus 3, and it must render without empty anchors.

```bash
mkdir -p src/content/projects

cat > src/content/projects/telemetry-pipeline.md <<'EOF'
---
name: Telemetry Pipeline
description: A streaming ingest pipeline that processes 40k events/sec with at-least-once delivery and replayable backfills.
tech: ['Go', 'Kafka', 'ClickHouse']
liveUrl: 'https://example.com'
repoUrl: 'https://github.com/yourhandle/telemetry-pipeline'
featured: true
order: 1
---

PLACEHOLDER: replace this project with your own.
EOF

cat > src/content/projects/design-system.md <<'EOF'
---
name: Orbit Design System
description: A component library and token pipeline adopted by six product teams, with automated visual regression testing.
tech: ['TypeScript', 'React', 'Storybook']
repoUrl: 'https://github.com/yourhandle/orbit'
featured: true
order: 2
---

PLACEHOLDER: replace this project with your own.
EOF

cat > src/content/projects/query-cache.md <<'EOF'
---
name: Query Cache
description: A read-through cache layer that cut database load by 60% without changing a single call site.
tech: ['Python', 'Redis', 'PostgreSQL']
liveUrl: 'https://example.com'
featured: true
order: 3
---

PLACEHOLDER: replace this project with your own.
EOF

cat > src/content/projects/internal-tool.md <<'EOF'
---
name: Internal Migration Tool
description: A closed-source CLI that automated a 200-service dependency upgrade. No public links available.
tech: ['Rust', 'CLI']
featured: false
order: 4
---

PLACEHOLDER: this entry exists to prove a project with no links renders correctly.
EOF
```

- [ ] **Step 3: Create `src/components/ProjectCard.astro`**

The links block renders only when at least one URL exists — Review Focus 3.

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  project: CollectionEntry<'projects'>;
}

const { project } = Astro.props;
const { name, description, tech, liveUrl, repoUrl } = project.data;
---

<article class="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-5">
  <h3 class="font-medium">{name}</h3>
  <p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{description}</p>
  {
    tech.length > 0 && (
      <ul class="mt-4 flex flex-wrap gap-2">
        {tech.map((item) => (
          <li class="rounded border border-[var(--border)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
            {item}
          </li>
        ))}
      </ul>
    )
  }
  {
    (liveUrl || repoUrl) && (
      <div class="mt-4 flex gap-4 text-sm">
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[var(--accent)] hover:underline"
          >
            Live &rarr;
          </a>
        )}
        {repoUrl && (
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-[var(--accent)] hover:underline"
          >
            Code &rarr;
          </a>
        )}
      </div>
    )
  }
</article>
```

- [ ] **Step 4: Create `src/pages/projects/index.astro`**

Includes the empty state — Review Focus 2.

```astro
---
import { getCollection } from 'astro:content';
import { SITE } from '../../config/site';
import BaseLayout from '../../layouts/BaseLayout.astro';
import ProjectCard from '../../components/ProjectCard.astro';
import { sortProjects } from '../../lib/projects';

const projects = sortProjects(await getCollection('projects'));
---

<BaseLayout title={`Projects — ${SITE.name}`} description={`Projects by ${SITE.name}.`}>
  <section class="py-12">
    <h1 class="text-3xl font-bold tracking-tight">Projects</h1>
    {
      projects.length === 0 ? (
        <p class="mt-6 text-[var(--text-muted)]">No projects yet.</p>
      ) : (
        <div class="mt-8 grid gap-4 sm:grid-cols-2">
          {projects.map((project) => (
            <ProjectCard project={project} />
          ))}
        </div>
      )
    }
  </section>
</BaseLayout>
```

- [ ] **Step 5: Add featured projects to the homepage**

Add these imports to `src/pages/index.astro`:

```ts
import { getCollection } from 'astro:content';
import ProjectCard from '../components/ProjectCard.astro';
import { featuredProjects } from '../lib/projects';

const featured = featuredProjects(await getCollection('projects'), 3);
```

And add this `Section` after Experience and before Skills:

```astro
<Section title="Featured projects" href="/projects">
  {
    featured.length === 0 ? (
      <p class="text-[var(--text-muted)]">No projects yet.</p>
    ) : (
      <div class="grid gap-4 sm:grid-cols-2">
        {featured.map((project) => (
          <ProjectCard project={project} />
        ))}
      </div>
    )
  }
</Section>
```

- [ ] **Step 6: Verify build and types**

Run: `pnpm build && pnpm check`
Expected: build "Complete!"; check `0 errors`.

- [ ] **Step 7: Verify the no-link project rendered without empty anchors**

Run: `grep -c 'href=""' dist/projects/index.html`
Expected: `0`. A non-zero count means the conditional link block is wrong.

Run: `grep -c "Internal Migration Tool" dist/projects/index.html`
Expected: `1` — the unlinked project still appears.

- [ ] **Step 8: Verify only featured projects are on the homepage**

Run: `grep -c "Internal Migration Tool" dist/index.html`
Expected: `0` — it is `featured: false`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add projects collection, cards, and projects page"
```

---

### Task 7: Blog collection, listing, post pages, RSS, and 404

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/content/blog/*.mdx` (3 files), `src/components/FormattedDate.astro`, `src/layouts/BlogPost.astro`, `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`, `src/pages/rss.xml.ts`, `src/pages/404.astro`
- Modify: `src/pages/index.astro` (not required, but keep consistent if a "Latest posts" section is desired)

**Interfaces:**
- Consumes: `filterDrafts`, `sortPostsByDate` (Task 2); `formatDate` (Task 2); `BaseLayout` (Task 3); `SITE` (Task 4).
- Produces: the `blog` collection and the `/blog`, `/blog/[slug]`, `/rss.xml`, `/404` routes.

- [ ] **Step 1: Add the blog collection to `src/content.config.ts`**

Keep the existing `projects` block; add `blog` and export both.

```ts
const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
```

- [ ] **Step 2: Create three placeholder posts**

The third is a **draft** — Review Focus 1. Two share a `pubDate` to exercise the tie-break from Task 2.

```bash
mkdir -p src/content/blog

cat > src/content/blog/hello-world.mdx <<'EOF'
---
title: 'Hello World'
description: 'A placeholder post. Replace it with your own writing.'
pubDate: 2026-09-01
tags: ['meta']
---

PLACEHOLDER: this is sample content. Replace `src/content/blog/hello-world.mdx` with a real post.

## A heading

Body copy renders through Astro's Markdown pipeline.
EOF

cat > src/content/blog/on-testing.mdx <<'EOF'
---
title: 'What I Look For in a Test Suite'
description: 'A placeholder post sharing a pubDate with another, to prove sort order is deterministic.'
pubDate: 2026-09-01
tags: ['testing']
---

PLACEHOLDER: replace with your own writing.
EOF

cat > src/content/blog/draft-post.mdx <<'EOF'
---
title: 'Unfinished Draft'
description: 'This post is a draft and must never appear in the built site.'
pubDate: 2026-09-20
draft: true
---

PLACEHOLDER: if you can read this on the live site, draft filtering is broken.
EOF
```

- [ ] **Step 3: Create `src/components/FormattedDate.astro`**

```astro
---
import { formatDate } from '../lib/date';

interface Props {
  date: Date;
}

const { date } = Astro.props;
---

<time datetime={date.toISOString()}>{formatDate(date)}</time>
```

- [ ] **Step 4: Create `src/layouts/BlogPost.astro`**

```astro
---
import BaseLayout from './BaseLayout.astro';
import FormattedDate from '../components/FormattedDate.astro';

interface Props {
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  tags?: string[];
}

const { title, description, pubDate, updatedDate, tags = [] } = Astro.props;
---

<BaseLayout title={title} description={description}>
  <article class="py-12">
    <header class="border-b border-[var(--border)] pb-6">
      <h1 class="text-3xl font-bold tracking-tight">{title}</h1>
      <p class="mt-3 text-sm text-[var(--text-muted)]">
        <FormattedDate date={pubDate} />
        {updatedDate && <span> &middot; updated <FormattedDate date={updatedDate} /></span>}
      </p>
      {
        tags.length > 0 && (
          <ul class="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li class="rounded bg-[var(--bg-subtle)] px-2 py-0.5 text-xs text-[var(--text-muted)]">
                {tag}
              </li>
            ))}
          </ul>
        )
      }
    </header>
    <div class="prose-custom mt-8 space-y-4 leading-relaxed">
      <slot />
    </div>
  </article>
</BaseLayout>

<style>
  .prose-custom :global(h2) {
    margin-top: 2rem;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .prose-custom :global(a) {
    color: var(--accent);
    text-decoration: underline;
  }
  .prose-custom :global(code) {
    background: var(--bg-subtle);
    border-radius: 0.25rem;
    padding: 0.1rem 0.3rem;
    font-size: 0.9em;
  }
  .prose-custom :global(pre) {
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
  }
</style>
```

- [ ] **Step 5: Create `src/pages/blog/index.astro`**

`import.meta.env.PROD` is what excludes drafts from production builds while keeping them visible in `pnpm dev`.

```astro
---
import { getCollection } from 'astro:content';
import { SITE } from '../../config/site';
import BaseLayout from '../../layouts/BaseLayout.astro';
import FormattedDate from '../../components/FormattedDate.astro';
import { filterDrafts, sortPostsByDate } from '../../lib/posts';

const posts = sortPostsByDate(
  filterDrafts(await getCollection('blog'), !import.meta.env.PROD),
);
---

<BaseLayout title={`Blog — ${SITE.name}`} description={`Writing by ${SITE.name}.`}>
  <section class="py-12">
    <h1 class="text-3xl font-bold tracking-tight">Blog</h1>
    {
      posts.length === 0 ? (
        <p class="mt-6 text-[var(--text-muted)]">No posts yet.</p>
      ) : (
        <ul class="mt-8 space-y-6">
          {posts.map((post) => (
            <li class="border-t border-[var(--border)] pt-6">
              <a href={`/blog/${post.id}/`} class="group">
                <h2 class="font-medium group-hover:text-[var(--accent)]">{post.data.title}</h2>
                <p class="mt-1 text-sm text-[var(--text-muted)]">
                  <FormattedDate date={post.data.pubDate} />
                </p>
                <p class="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">
                  {post.data.description}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )
    }
  </section>
</BaseLayout>
```

- [ ] **Step 6: Create `src/pages/blog/[...slug].astro`**

Note `post.id` and the top-level `render` import — both are Astro 7 requirements.

```astro
---
import { type CollectionEntry, getCollection, render } from 'astro:content';
import BlogPost from '../../layouts/BlogPost.astro';
import { filterDrafts } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = filterDrafts(await getCollection('blog'), !import.meta.env.PROD);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: post,
  }));
}

type Props = CollectionEntry<'blog'>;

const post = Astro.props;
const { Content } = await render(post);
---

<BlogPost {...post.data}>
  <Content />
</BlogPost>
```

- [ ] **Step 7: Create `src/pages/rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../config/site';
import { filterDrafts, sortPostsByDate } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = sortPostsByDate(filterDrafts(await getCollection('blog'), false));
  return rss({
    title: `${SITE.name} — Blog`,
    description: SITE.description,
    site: context.site ?? 'https://example.com',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
}
```

- [ ] **Step 8: Create `src/pages/404.astro`**

```astro
---
import { SITE } from '../config/site';
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title={`Not found — ${SITE.name}`} description="That page does not exist.">
  <section class="py-24 text-center">
    <h1 class="text-4xl font-bold">404</h1>
    <p class="mt-4 text-[var(--text-muted)]">That page does not exist.</p>
    <a href="/" class="mt-8 inline-block text-[var(--accent)] hover:underline">Back home &rarr;</a>
  </section>
</BaseLayout>
```

- [ ] **Step 9: Verify build and types**

Run: `pnpm build && pnpm check`
Expected: build "Complete!"; check `0 errors`.

- [ ] **Step 10: Verify the draft post did NOT ship (Review Focus 1)**

```bash
test ! -d dist/blog/draft-post && echo "PASS: no draft route"
grep -c "Unfinished Draft" dist/blog/index.html
grep -c "Unfinished Draft" dist/rss.xml
```

Expected: prints `PASS: no draft route`, then `0`, then `0`. Any other result means draft filtering is broken — fix before committing.

- [ ] **Step 11: Verify the published posts DID ship**

```bash
ls dist/blog/hello-world/index.html dist/blog/on-testing/index.html
grep -c "hello-world" dist/rss.xml
```

Expected: both files listed; `1`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add blog collection, post pages, RSS feed, and 404"
```

---

### Task 8: README, deployment notes, and final verification

**Files:**
- Create: `README.md`
- Modify: none

**Interfaces:**
- Consumes: everything above.
- Produces: the owner-facing documentation for editing content and deploying.

- [ ] **Step 1: Create `README.md`**

```markdown
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
```

- [ ] **Step 2: Run the full verification suite**

```bash
pnpm test && pnpm check && pnpm build
```

Expected: 17 tests passed; `0 errors`; build "Complete!".

- [ ] **Step 3: Confirm every expected route was emitted**

```bash
find dist -name "*.html" | sort
test -f dist/rss.xml && echo "rss ok"
test -f dist/sitemap-index.xml && echo "sitemap ok"
```

Expected routes: `dist/index.html`, `dist/404.html`, `dist/projects/index.html`,
`dist/blog/index.html`, `dist/blog/hello-world/index.html`,
`dist/blog/on-testing/index.html`. Plus `rss ok` and `sitemap ok`.
There must be **no** `dist/blog/draft-post/`.

- [ ] **Step 4: Look at the running site**

Run: `pnpm preview`
Check in the browser, at both desktop and phone width:
- Homepage: hero, experience, three featured projects, skills, resume button.
- The resume button downloads a PDF rather than 404ing.
- Theme toggle switches and survives a reload with no flash.
- `/projects` shows all four projects, including the one with no links.
- `/blog` lists two posts; the draft is absent; a post page renders.
- No horizontal scrolling at phone width.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: add README with content editing and deployment guide"
```
