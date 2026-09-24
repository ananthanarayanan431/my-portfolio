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
