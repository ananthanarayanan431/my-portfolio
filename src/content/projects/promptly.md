---
name: 'Promptly: AI Prompt Optimization Platform'
description: A full-stack SaaS platform that optimizes LLM prompts through a multi-agent “council” pipeline.
tech: ['LangGraph', 'FastAPI', 'Celery', 'Redis', 'PostgreSQL', 'Supabase', 'Next.js 14']
repoUrl: 'https://github.com/ananthanarayanan431/promptly'
featured: true
order: 1
---

Personal project, April – June 2026.

- Built a full-stack SaaS platform that optimizes LLM prompts through a multi-agent “council” pipeline: four models rewrite a prompt, blind peer-review each other’s work, and a chairman model synthesizes the result.
- Orchestrated the pipeline with LangGraph (conditional routing, Postgres-backed checkpointing) and decoupled long-running LLM calls using FastAPI, Celery, and Redis, streaming live progress to the client over SSE.
- Architected the backend as a modular monolith with dual authentication (Supabase JWT + API keys), credit-based usage metering, and Postgres RLS, paired with a Next.js 14 job-tracking and analytics dashboard.
