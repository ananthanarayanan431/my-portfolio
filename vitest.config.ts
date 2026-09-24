import { defineConfig } from 'vitest/config';

// Pin the suite's timezone. formatDate's `timeZone: 'UTC'` guard is only observable from a
// timezone that is NOT UTC, so on a UTC CI runner the regression test would pass even with the
// guard deleted. Pinning here makes that guard's test meaningful on every machine.
process.env.TZ = 'Asia/Kolkata';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
});
