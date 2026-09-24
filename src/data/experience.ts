export interface Experience {
  company: string;
  role: string;
  start: string;
  end: string | null;
  url?: string;
  highlights: string[];
}

export const EXPERIENCE: Experience[] = [
  {
    company: 'Oraczen',
    role: 'Product Engineer',
    start: 'June 2025',
    end: null,
    highlights: [
      'Engineered an advanced Text-to-SQL chatbot by refactoring a LangGraph application into a ReAct Agent architecture, cutting latency by 40% and raising decision-making accuracy from 40% to 90%.',
      'Designed a context off-loading mechanism to prevent context degradation in long-running agent sessions, achieving 95% accuracy and a 99% reliability score across extended multi-turn interactions.',
      'Built an LLM-as-a-Judge evaluation framework for continuous quality monitoring across production AI systems.',
      'Developed a Deep-Researcher Multi-Agent System where planner and researcher agents generate reports via web search, Text-to-SQL analysis, and image generation (Nano-Banana), with a LongWriter-style plan-then-write pipeline, lifting accuracy from 35% to 90% and automating 80% of manual research.',
      'Delivered real-time voice agents over WebRTC with tool-calling support, extracting knowledge graphs, actionable items, and summaries from calls, with chat over voice logs via Qdrant-backed long-term memory.',
      'Established a prompt orchestration layer using XML tag-based structured prompting across the Deep-Researcher and voice agents, isolating untrusted input to harden against prompt injection, with prompt-level guardrails to keep agent behaviour on-policy.',
      'Built core Zen modules for the company’s Zen Platform, including ZenTools and ContextZen.',
    ],
  },
  {
    company: 'Launch Ventures',
    role: 'Software Engineer',
    start: 'July 2024',
    end: 'June 2025',
    highlights: [
      'Built Wisdom Chat, a RAG application delivering personalized guidance grounded in Bhagavad Gita texts, using a HyDE-based RAG pipeline with LlamaIndex, NeMo Guardrails, and RAGAS-driven quality evaluation.',
      'Shipped a Flux-powered on-demand image generation feature that visualises abstract spiritual concepts for users.',
      'Engineered the backend for a Market Research Application in LangGraph with multi-level node classification and validation steps, running web research across Exa, Tavily, and News API and exporting findings as structured CSV reports.',
      'Implemented a plan-then-write pipeline for report generation, drafting sections independently for coherent long-form output.',
      'Developed a production-grade async pipeline with FastAPI, Celery, Redis, and Postgres-backed checkpointing, scheduling cron-driven daily runs that email each morning’s research report as a CSV attachment.',
    ],
  },
];
