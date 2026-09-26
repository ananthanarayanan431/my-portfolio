---
name: 'Promptly: AI Prompt Optimization Platform'
description: An AI prompt engineering platform that turns rough prompts into tested, optimized, versioned and reusable production prompts through multi-model collaboration.
tech:
  [
    'LangGraph',
    'FastAPI',
    'Celery',
    'Redis',
    'PostgreSQL',
    'pgvector',
    'MinIO',
    'Supabase',
    'OpenRouter',
    'Next.js 14',
  ]
repoUrl: 'https://github.com/ananthanarayanan431/promptly'
featured: true
order: 1
year: '2026'
---

_Personal project, April – June 2026._

Promptly is a prompt optimization platform built around **multi-model collaboration**. Instead of asking a single LLM to rewrite a prompt, Promptly lets four models independently optimize it, critique each other's work anonymously, and synthesize the strongest ideas into a final, production-ready prompt.

Around that core it adds prompt health analysis, domain-grounded optimization (GEPA), agent-skill optimization (SkillOpt), cross-model prompt transfer (Prompt Bridge), versioning, asynchronous execution with live progress, token-based billing, and a full admin and observability surface.

```text
User prompt
    │
    ▼
Intent classification ──► irrelevant / unsafe ──► reject
    │
    ▼
Performance gate ──► already strong ──► return
    │
    ▼
AI Council: 4 models optimize independently
    │
    ▼
Blind peer review (anonymized A / B / C / D)
    │
    ▼
Chairman synthesis
    │
    ▼
Quality gate ──► weak ──► refine again (back to council)
    │
    ▼
Final prompt
```

## The problem

Prompts have quietly become application logic. Consider a customer-support agent:

```text
You are a customer support assistant.
Answer customer questions using the provided context.
Never reveal confidential information.
Escalate refund requests above $500.
Respond professionally.
```

That system prompt decides answer quality, hallucination behaviour, safety, formatting, tool usage, business-rule compliance, token spend and ultimately the customer experience.

Yet most prompt development still looks like this: write a prompt, try it by hand, tweak some wording, try again, decide "this looks better", ship it. There is no systematic optimization, no objective comparison, no record of why a prompt changed, no testing against domain data, and no guarantee that a prompt tuned for one model behaves the same on another.

**Promptly treats prompts as engineering artifacts rather than disposable strings.**

## Product philosophy

The design follows one loop: **Optimize → Evaluate → Evolve → Manage.** A prompt is written, analyzed, optimized, evaluated, versioned, tested, re-optimized and reused. That maps closely onto a normal software workflow:

| Software engineering  | Promptly               |
| --------------------- | ---------------------- |
| Source code           | Prompt                 |
| Static analysis       | Health score           |
| Code review           | AI Council critique    |
| Compiler optimization | Prompt optimization    |
| Tests                 | Domain evaluation      |
| Git commits and diffs | Prompt versions, diffs |
| Package portability   | Prompt Bridge          |
| Monitoring            | Usage and admin analytics |

## The Multi-Model Council

The council is the heart of Promptly. It runs as a LangGraph graph with conditional routing and loops.

```text
START ──► Intent ──► Performance gate ──► already good ──► END
                           │
                           ▼
                 ┌──► Council (4 models)
                 │         │
                 │         ▼
                 │    Critic (blind review)
                 │         │
                 │         ▼
                 │    Synthesis (chairman)
                 │         │
                 │         ▼
                 │    Quality gate ──► PASS ──► END
                 │         │
                 └── FAIL ─┘
```

### Round 0: Intent classification

Not every input is a prompt. "Explain Docker to me" is a question; "You are an expert DevOps engineer. Explain technical concepts to beginners…" is a prompt. A classifier routes inputs before any expensive work happens and also guards against off-topic input, harmful content and prompt-injection attempts.

### Performance gate

Running five or more LLM calls on every request is expensive. A cheap evaluation first scores the prompt on eight dimensions (role/persona, goal clarity, context, output format, examples, guardrails, tone and conciseness). If the prompt is already strong, the council is skipped entirely, which keeps inference costs down.

### Round 1: Independent optimization

Four models from different providers each receive the original prompt with a different optimization strategy: analytical, creative, concise and structured. A single model optimizing and judging its own work reproduces its own blind spots, so the council deliberately creates diversity in its proposals.

```text
                  Original prompt
                         │
     ┌─────────────┬─────┴───────┬─────────────┐
     ▼             ▼             ▼             ▼
 Analytical     Creative      Concise     Structured
  (model 1)     (model 2)     (model 3)    (model 4)
```

### Round 2: Blind peer review

The proposals are anonymized as Response A, B, C and D. Each model reviews the others and returns rankings, strengths, weaknesses and rationale. Because reviewers never see which model wrote what, model-name bias ("Claude wrote this, so it's probably better") is removed from the evaluation.

```text
Model A ─┐
Model B ─┼──► anonymize ──► peer review ──► strengths / weaknesses ──► ranking
Model C ─┤
Model D ─┘
```

### Round 3: Chairman synthesis

A chairman model receives every proposal plus every critique. Rather than _selecting_ the best one, it _synthesizes_ a new prompt that keeps the strongest ideas and fixes the weaknesses reviewers pointed out.

```text
Selection:  A B C D ──► pick B
Synthesis:  A B C D + critiques ──► combine strongest ideas ──► E
```

### Quality gate and iterative refinement

The synthesized prompt is scored again on the same eight dimensions. If it falls short, the council runs another round with the previous result as context. The loop stops when quality passes, the iteration ceiling is reached, or improvement converges. The result is a generate → evaluate → reflect → improve cycle rather than a single-shot LLM call.

## Beyond the council

### Prompt health score

Sometimes a developer only wants to know what is wrong with a prompt. The analysis mode scores the eight dimensions and reports strengths, weaknesses and concrete improvement suggestions without running a full optimization. A typical report looks like this:

| Dimension      | Score |
| -------------- | ----- |
| Role / persona | 9/10  |
| Goal clarity   | 8/10  |
| Context        | 5/10  |
| Output format  | 7/10  |
| Examples       | 3/10  |
| Guardrails     | 6/10  |
| Tone           | 9/10  |
| Conciseness    | 8/10  |

That makes Promptly feel like a developer tool rather than another chat interface.

### Domain prompt optimization (GEPA)

General optimization asks "does this look like a well-written prompt?" Domain optimization asks "does this prompt actually perform well on _my_ data?"

Users upload domain material such as a PDF. Promptly processes the document, generates a Q&A evaluation dataset, and evolves the prompt against it using **GEPA (Reflective Prompt Evolution)**: Pareto-frontier candidate sampling, reflective mutation driven by execution traces, and minibatch gating.

```text
Domain PDF ──► document processing ──► Q&A generation ──► evaluation dataset
                                                                 │
         ┌───────────────────────────────────────────────────────┘
         ▼
Candidate prompts ──► execute ──► score ──► reflect on failures ──► mutate
         ▲                                                            │
         └────────────────── keep promising candidates ◄──────────────┘
```

Instead of "make this prompt better", the system is told "here is evidence of where this prompt succeeds and fails; evolve it based on measured performance". That turns optimization from subjective rewriting into evaluation-driven development.

### SkillOpt: optimizing agent skills

Agents carry a lot of behaviour in text: skills and instructions sitting next to tools, memory and the model. SkillOpt applies the same optimization philosophy to them. Each epoch runs rollouts, reflects on successes and failures, proposes ADD / DELETE / REPLACE edits, merges them, and passes the result through an evaluation gate. Train, selection and test splits are kept separate, and scores are cached.

```text
Current skill ──► rollout ──► successes / failures ──► reflection
      ▲                                                    │
      │                                                    ▼
 next epoch ◄── evaluation gate ◄── merge edits ◄── ADD / DELETE / REPLACE
```

This widens Promptly's scope from prompt optimization to **optimization infrastructure for textual AI behaviour**.

### Prompt Bridge: model portability

A prompt tuned for GPT does not necessarily behave the same on Claude or Gemini; model families differ in instruction following, preferred structure, verbosity and formatting. Prompt Bridge learns a style-transfer mapping for a source/target model pair from calibrated examples and reuses it for later prompts. For teams switching providers, that reduces lock-in and saves re-engineering every prompt by hand.

```text
Prompt optimized for model A ──► Prompt Bridge (model-pair mapping) ──► prompt adapted for model B
```

### Versioning, library and projects

Related iterations form a **prompt family**: an immutable `prompt_id` with sequential versions underneath it (original, council-optimized, safety constraints added, feedback refinement, domain-optimized…). Developers can see how a prompt evolved, diff versions and restore old ones, the same way they would with Git commits.

```text
Customer Support Agent (prompt family)
├── v1  Original prompt
├── v2  Council optimized
├── v3  Added safety constraints
├── v4  Feedback refinement
└── v5  Domain optimized
```

| Git            | Promptly        |
| -------------- | --------------- |
| Repository     | Prompt family   |
| Commit         | Prompt version  |
| Commit history | Version history |
| Diff           | Prompt diff     |
| Checkout       | Restore version |

Prompts are organized in a library with projects, favourites, versions and history, with Prompt Media on the roadmap. That lets the platform grow from an optimizer into an internal prompt management system:

```text
Customer Support Project          Procurement AI Project
├── System prompt                 ├── Supplier analysis
├── Escalation prompt             ├── Spend classification
├── Summarization prompt          └── Contract extraction
└── Classification prompt
```

### Feedback-driven refinement

Optimization is conversational. A user can reply "keep everything but make the output JSON" or "remove the chain-of-thought instructions", and the same session continues with the previous graph state and feedback, producing a new version. Human judgement and AI optimization work in one loop.

```text
Prompt ──► optimization ──► result ──► human feedback ──► refinement ──► new version
```

## System architecture

The product surface and the infrastructure behind it:

```text
┌──────────────────────────── Next.js UI ─────────────────────────────┐
│ Optimize │ Analyze │ Domain │ SkillOpt │ Bridge │ Library           │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ REST API
┌──────────────────────────────────▼──────────────────────────────────┐
│                               FastAPI                               │
│ Auth │ Users │ Prompts │ Jobs │ Billing │ Admin │ Analytics         │
└─────────────────────────────────────────────────────────────────────┘
```

Request flow through the stack:

```text
                  User
                   │
                   ▼
            Next.js frontend
                   │  REST + SSE
                   ▼
                FastAPI ──────────────► PostgreSQL + pgvector
                   │  enqueue job        (users, sessions, versions,
                   ▼                      runs, billing, checkpoints)
                 Redis
           (broker + job state)          MinIO
                   │                     (PDFs, datasets, artifacts)
                   ▼
             Celery worker
                   │
                   ▼
               LangGraph
       ┌───────────┼───────────┐
    Council       GEPA      SkillOpt
       └───────────┼───────────┘
                   ▼
               OpenRouter
       ┌───────────┼───────────┐
     OpenAI    Anthropic    Google …
```

### Why asynchronous

A single council run can involve a classifier, a performance evaluation, four optimization calls, four critique calls, a chairman call, a quality evaluation and possibly further iterations. Doing that inside one synchronous HTTP request would be fragile. Instead `POST /optimize` creates a job and immediately returns **HTTP 202 with a `job_id`**, while the LangGraph pipeline runs inside a Celery worker. Results and progress flow back through Redis.

```text
POST /optimize ──► FastAPI ──► create job ──► HTTP 202 + job_id   (user gets control back)
                                  │
                                  ▼
                   Celery worker ──► LLM pipeline ──► Redis job state ──► SSE to UI
```

### Real-time progress over SSE

A spinner for 30 to 60 seconds feels broken. The backend streams pipeline events (intent, performance gate, council 1/4 … 4/4, critique, synthesis, quality gate, completed) to the frontend with Server-Sent Events, with polling as a fallback, which gives real-time visibility into an asynchronous AI workflow.

### Why LangGraph

The pipeline is not `input → model → output`; it is a graph with conditional exits (reject, already good) and a refinement loop back into the council. That maps naturally onto LangGraph's stateful execution model, and Postgres-backed checkpointing lets sessions be resumed and refined with feedback.

### Modular monolith, not microservices

The backend is a deliberate **modular monolith**, documented in an architecture decision record. Substantial features (`optimize`, `domain_prompt`, `skill_opt`, `prompt_bridge`, `admin`) are vertical slices, and shared infrastructure (`graph`, `llm`, `core`, `db`, `workers`) lives in a shared kernel. That keeps strong domain boundaries while avoiding the operational cost of many deployables: simpler development, easy transactions, shared models, and cheap refactoring.

### Data layer

PostgreSQL 16 (with pgvector) stores users, sessions and messages, prompt families and versions, favourites, projects, API keys, domain runs, usage and billing, with row-level security. Large artifacts such as uploaded PDFs and generated datasets go to **MinIO** object storage, keeping metadata relational and blobs out of the database.

### Authentication and API access

People sign in through **Supabase**, and the API verifies their JWTs against JWKS. Applications use `qac_`-prefixed **API keys**. That means Promptly isn't limited to its own UI; it can sit as infrastructure inside another product.

### Token-based billing

Users receive an initial token balance, completed jobs are charged by their actual LLM token consumption, and new jobs are blocked once the balance runs out. Because the platform's own cost is driven by provider input and output tokens, billing on tokens ties user usage directly to real inference cost, and the admin side tracks OpenRouter spend alongside it.

### Admin and observability

Promptly is built to be _operated_, not just demoed. The admin console covers platform KPIs, users and token balances, rate limits, errors, system health, jobs, API keys, audit logs, user activity, OpenRouter spend, agent analytics and developer metrics, with errors tracked through Sentry-compatible GlitchTip.

### Deployment

Production is self-hosted with Docker Compose behind **Nginx** (TLS and routing to Next.js and FastAPI), with Redis, PostgreSQL and the Celery workers alongside. It ships with health and readiness endpoints, structured JSON logs with correlation IDs, Alembic migrations and documented rollback procedures.

## Technology stack

| Area               | Technology                               |
| ------------------ | ---------------------------------------- |
| Frontend           | Next.js 14, TypeScript, Tailwind CSS, shadcn/ui |
| State              | TanStack Query (server), Zustand (client) |
| Backend            | FastAPI, Python 3.12                     |
| ORM and migrations | SQLAlchemy 2, Alembic                    |
| Database           | PostgreSQL 16, pgvector                  |
| Queue and state    | Celery, Redis                            |
| AI orchestration   | LangGraph                                |
| LLM gateway        | OpenRouter                               |
| Authentication     | Supabase (JWT via JWKS), API keys        |
| Object storage     | MinIO                                    |
| Error monitoring   | Sentry / GlitchTip                       |
| Testing            | pytest, Playwright                       |
| Code quality       | Ruff, MyPy, ESLint                       |

## Business opportunity and users

Promptly is best described as **an experimentation and optimization layer between AI teams and their LLMs**. A company running 50 agents with 5 prompts each has 250 production prompts, often spread across GPT, Claude and Gemini. Those prompts need quality evaluation, version control, model migration, testing, optimization and cost tracking.

- **AI engineers** optimize system prompts, compare approaches and keep prompt versions.
- **Agent developers** improve agent instructions and skills with SkillOpt.
- **AI product teams** manage prompts across products instead of scattering them through source files and documents.
- **Domain-heavy teams** in finance, procurement, support, legal or healthcare evaluate prompts against their own data.
- **Teams changing LLM providers** adapt prompts with Prompt Bridge instead of redesigning them by hand.

## What makes it technically interesting

1. **Multi-model orchestration:** it coordinates models from different providers rather than wrapping one LLM endpoint.
2. **Agentic evaluation loops:** generation → critique → synthesis → evaluation → refinement.
3. **Asynchronous AI infrastructure:** FastAPI, Celery, Redis and SSE.
4. **Research turned into product:** GEPA and SkillOpt built into a usable platform.
5. **Prompt lifecycle management:** prompts become versioned engineering artifacts.
6. **Production operations:** auth, API keys, token accounting, rate limiting, auditing, admin analytics, error tracking, tests and deployment.

> Prompt engineering shouldn't be trial and error. It should be engineering.
