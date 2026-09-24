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
  name: 'Anantha Narayanan R',
  title: 'Product Engineer — AI Agents & LLM Systems',
  description:
    'Product engineer building production AI agents, Text-to-SQL systems, multi-agent research pipelines, and real-time voice agents.',
  bio: 'I build production AI systems: ReAct and multi-agent architectures with LangGraph, RAG pipelines, LLM-as-a-Judge evaluation, and real-time voice agents over WebRTC. Currently a Product Engineer at Oraczen; previously a Software Engineer at Launch Ventures. B.Tech in Artificial Intelligence and Data Science from Sri Sairam Engineering College.',
  location: 'Hyderabad, India',
  resumePath: '/resume.pdf',
  nav: [
    { label: 'Projects', href: '/projects' },
    { label: 'Blog', href: '/blog' },
  ] satisfies NavItem[],
  socials: [
    { label: 'GitHub', href: 'https://github.com/ananthanarayanan431', icon: 'github' },
    {
      label: 'LinkedIn',
      href: 'https://www.linkedin.com/in/rananthanarayananofficial/',
      icon: 'linkedin',
    },
    { label: 'Email', href: 'mailto:ananthanarayanan431@gmail.com', icon: 'email' },
  ] satisfies SocialLink[],
} as const;
