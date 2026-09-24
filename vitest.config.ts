import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    // Task 1 only: no tests exist yet. Task 2 removes this so a broken
    // include glob can never make the suite pass vacuously.
    passWithNoTests: true,
  },
});
