export type Theme = 'dark' | 'light';

const THEMES: readonly string[] = ['dark', 'light'];

/** The theme a click should switch to. Anything that is not 'light' is treated as dark. */
export function nextTheme(current: string | null | undefined): Theme {
  return current === 'light' ? 'dark' : 'light';
}

/**
 * Decide which theme to apply after a view transition.
 *
 * `stored` is localStorage, which can be null when storage is blocked (private browsing) or
 * when the value was never written. `inMemory` carries the visitor's choice across swaps in
 * exactly that case — without it, Astro's swap reinstates the document's default and silently
 * undoes their choice on every internal navigation.
 */
export function resolveTheme(
  stored: string | null,
  inMemory: string | null,
  fallback: Theme = 'dark',
): Theme {
  for (const candidate of [stored, inMemory]) {
    if (candidate !== null && THEMES.includes(candidate)) {
      return candidate as Theme;
    }
  }
  return fallback;
}
