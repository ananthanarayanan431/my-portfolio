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
