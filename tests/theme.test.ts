import { describe, expect, it } from 'vitest';
import { nextTheme, resolveTheme } from '../src/lib/theme';

describe('nextTheme', () => {
  it('toggles light to dark', () => {
    expect(nextTheme('light')).toBe('dark');
  });

  it('toggles dark to light', () => {
    expect(nextTheme('dark')).toBe('light');
  });

  it('treats an unset theme as dark, so the first click goes light', () => {
    expect(nextTheme(undefined)).toBe('light');
  });
});

describe('resolveTheme', () => {
  it('prefers the stored theme when storage works', () => {
    expect(resolveTheme('light', null)).toBe('light');
  });

  // The defect this guards: in Safari private browsing / blocked cookies, setItem throws and
  // is swallowed, so stored is null. Astro's view transitions replace <html> with the new
  // document's hardcoded data-theme="dark", undoing the visitor's explicit choice on every
  // internal click. The in-memory value must survive the swap.
  it('falls back to the in-memory choice when storage is unwritable', () => {
    expect(resolveTheme(null, 'light')).toBe('light');
  });

  it('defaults to dark when neither source has a value', () => {
    expect(resolveTheme(null, null)).toBe('dark');
  });

  it('ignores a corrupted stored value and uses the in-memory choice', () => {
    expect(resolveTheme('chartreuse', 'light')).toBe('light');
  });

  it('ignores a corrupted stored value with no in-memory choice', () => {
    expect(resolveTheme('chartreuse', null)).toBe('dark');
  });
});
