import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/lib/contrast';

/** Pull a CSS custom property out of a given `:root` selector block in global.css. */
function token(css: string, selector: string, name: string): string {
  const block = css.split(selector)[1]?.split('}')[0] ?? '';
  const match = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  if (!match) throw new Error(`token ${name} not found in ${selector}`);
  return match[1];
}

describe('contrastRatio', () => {
  it('rates black on white at the maximum 21:1', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('rates a colour against itself at 1:1', () => {
    expect(contrastRatio('#7c6cff', '#7c6cff')).toBeCloseTo(1, 5);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#5b48e0', '#ffffff')).toBeCloseTo(
      contrastRatio('#ffffff', '#5b48e0'),
      5,
    );
  });
});

describe('design token accessibility', () => {
  const css = readFileSync(new URL('../src/styles/global.css', import.meta.url), 'utf8');
  const hero = readFileSync(new URL('../src/components/Hero.astro', import.meta.url), 'utf8');

  const THEMES = [
    { label: 'dark', selector: ':root {' },
    { label: 'light', selector: ':root[data-theme="light"] {' },
  ];

  // The CTA renders --bg-coloured text on an --accent background at 14px / font-medium,
  // which is NOT "large text", so WCAG AA demands 4.5:1 rather than 3:1. The same pair also
  // covers accent-coloured links sitting directly on the page background.
  for (const { label, selector } of THEMES) {
    it(`${label} theme pairs --accent with --bg at WCAG AA (4.5:1)`, () => {
      const accent = token(css, selector, '--accent');
      const bg = token(css, selector, '--bg');
      expect(contrastRatio(accent, bg)).toBeGreaterThanOrEqual(4.5);
    });

    it(`${label} theme body text meets WCAG AA against the background`, () => {
      expect(
        contrastRatio(token(css, selector, '--text'), token(css, selector, '--bg')),
      ).toBeGreaterThanOrEqual(4.5);
    });
  }

  // Guards the fix directly: white on the dark-theme accent is only 3.86:1. Darkening the
  // shared --accent token instead would push accent links on --bg down to 3.71:1, so the
  // text colour is the correct lever and must not drift back to white.
  it('does not use white text on the accent CTA', () => {
    const cta = hero.slice(hero.indexOf('href={SITE.resumePath}'));
    expect(cta).not.toMatch(/text-white/);
    expect(cta).toMatch(/text-\[var\(--bg\)\]/);
  });
});
