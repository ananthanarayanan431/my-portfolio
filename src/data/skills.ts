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
