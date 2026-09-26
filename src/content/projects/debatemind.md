---
name: 'DebateMind: Memory-Driven AI Debate Trainer'
description: An adaptive AI debate coach that learns how you argue, building a persistent per-user cognitive fingerprint with a knowledge graph and vector memory, and uses it to challenge your real weaknesses over text and voice.
tech:
  [
    'LangGraph',
    'Cognee',
    'Neo4j',
    'pgvector',
    'PostgreSQL',
    'FastAPI',
    'Celery',
    'Redis',
    'OpenRouter',
    'OpenAI Realtime',
    'WebRTC',
    'Next.js',
    'D3.js',
  ]
repoUrl: 'https://github.com/ananthanarayanan431/cognee-project'
featured: true
order: 2
---

_Personal project, 2026. Built for the WeMakeDevs × Cognee Hackathon._

DebateMind is an AI debate opponent that doesn't just debate with you. **It remembers how you argue**, identifies your recurring weaknesses, and adapts future debates around your individual reasoning patterns.

The debate UI is only the visible product. The technically interesting part is the **persistent cognitive-memory architecture** behind the agent. Cognee is used as the memory and knowledge-graph engine, but DebateMind is the application built around it: the ontology, the memory API, the debate agents, mastery tracking, voice and text interfaces, and the asynchronous memory pipeline.

```text
                 YOU
                  │
                  ▼
          ┌───────────────┐
          │  DebateMind   │
          │   Challenge   │
          │   Evaluate    │
          │   Remember    │
          │   Adapt       │
          └───────┬───────┘
                  │
                  ▼
      YOUR COGNITIVE FINGERPRINT
                  │
       ┌──────────┼──────────┐
       ▼          ▼          ▼
    Topics    Fallacies  Reasoning
       └──────────┼──────────┘
                  ▼
             NEXT DEBATE
                  │
                  ▼
   A MORE PERSONALIZED OPPONENT
```

## The problem

A normal AI debate application has no memory of you. You debate, the session ends, and the next day you get the same generic opponent again.

```text
Day 1:  User ──► AI opponent ──► debate ──► end
Day 2:  User ──► AI opponent ──► same generic experience
```

That is a major limitation for a _training_ product. A real debate coach remembers things like:

```text
User
 ├── frequently uses Strawman
 ├── weak evidence
 ├── strong rhetorical arguments
 ├── weak logical reasoning
 ├── struggles with AI regulation topics
 ├── often appeals to authority
 └── has already mastered Slippery Slope
```

…and plans the next session around them. That is the problem DebateMind addresses.

## The product idea

DebateMind turns an LLM from a generic opponent into a **personalized adversarial coach**. Before responding, the opponent effectively asks: _What does this user struggle with? Which weaknesses matter for today's topic? Which have they already mastered? How should I build my next argument to challenge them?_

The result is a closed feedback loop:

```text
Debate ──► observe argument ──► analyze reasoning ──► extract weaknesses
   ▲                                                         │
   │                                                         ▼
update memory                                           store memory
   ▲                                                         │
   │                                                         ▼
measure improvement ◄── adapt next debate ◄── recall ◄── build cognitive profile
```

## The cognitive fingerprint

The central concept is the **cognitive fingerprint**: a living, per-user knowledge graph that captures _how this particular person thinks and argues_. It holds recurring fallacies, reasoning approaches, topics, evidence quality, outcomes, personal facts, session-level performance and mastered weaknesses.

```text
                     User
                      │
       ┌──────────────┼──────────────┐
       ▼              ▼              ▼
    Topics      Reasoning style   Fallacies
       │              │              │
 AI Regulation     Rhetoric       Strawman
 Climate           Logic          Ad Hominem
 Education         Evidence       Appeal to Authority
```

Each fallacy is also linked through the argument it appeared in, to the topic, the session and the outcome:

```text
Fallacy ──► Argument ──► Topic ──► Session ──► Outcome
```

That is far richer than storing `user_id → last_message`.

### How it differs from chat-assistant memory

Generic conversational memory tends to be flat facts: _user likes X, works in Y, mentioned Z_. DebateMind's memory is structured and relational: reasoning style, argument patterns, fallacies, evidence quality, topics, outcomes, mastery and personal facts, all connected to each other. The goal isn't "remember what the user said"; it's **build a machine-readable model of how the user reasons**.

## Memory architecture

### Why a knowledge graph

A relational table can store `user_id, topic, fallacy, score`, but it doesn't naturally express the relationships between those concepts. Suppose a user keeps losing debates on AI regulation because they make strawman arguments backed by weak evidence. A graph represents that directly:

```text
User
 └── weak at ──► Strawman
                    └── occurs in ──► AI Regulation
                                          └── associated with ──► Weak Evidence
```

That relationship structure is exactly what the opponent exploits when it plans a challenge.

### Graph memory + vector memory

DebateMind combines two complementary kinds of memory:

```text
                 User memory
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Knowledge graph         Vector memory
       (Neo4j)               (pgvector)
          │                     │
   "What is related      "What past memory is
    to what?"             semantically similar
                          to this situation?"
          └──────────┬──────────┘
                     ▼
             Contextual memory
```

- The **knowledge graph** answers relationship questions: which weaknesses connect to which topics, arguments and outcomes.
- **Vector search** retrieves semantically similar historical examples, even when the wording differs.

Together they give far more useful context for a personalized agent than a vector database alone.

### The ontology

The graph isn't a pile of arbitrary LLM-generated entities. DebateMind defines a controlled vocabulary for the fingerprint, with these core node types:

- `UserProfile`
- `Topic`
- `ArgumentRecord`
- `SessionSummary`
- `PersonalFact`

```text
UserProfile
   ├── participated in ──► SessionSummary
   ├── discussed ────────► Topic
   ├── made ─────────────► ArgumentRecord
   └── revealed ─────────► PersonalFact

ArgumentRecord ──► Topic
               ──► Reasoning approach
               ──► Fallacy
               ──► Knowledge domain
               ──► Evidence quality
               ──► Outcome
```

This domain-specific ontology is what gives the graph its meaning.

### Two levels of memory

Memory is kept at two granularities:

- **Fine-grained:** an `ArgumentRecord` for every argument (claim, pattern, fallacy, evidence quality, outcome, reasoning).
- **Coarse-grained:** a `SessionSummary` at the end of each debate with topic, mode, difficulty, rounds played, win rate, average logic / evidence / rhetoric scores, weak patterns and a coaching note.

`PersonalFact` nodes capture things the user reveals, for example "I'm a software engineer working on AI agents", so later debates can use relevant examples.

### Dual-write: prose + typed nodes

Every memory event is written **twice**.

```text
                   Memory event
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
  Write 1: natural language    Write 2: typed DataPoint
  "In a debate about AI         ArgumentRecord {
   regulation, the user           user_id, session_id,
   made a Strawman argument       topic, pattern_type,
   with weak evidence and         fallacy, evidence_quality,
   lost."                         outcome, reasoning }
          │                           │
  cognee.add() + cognify()     add_data_points()
  (LLM extracts relationships) (deterministic IDs)
          └─────────────┬─────────────┘
                        ▼
                   Rich memory
```

- **Prose** that Cognee cognifies lets the LLM discover flexible, semantically rich relationships.
- **Typed nodes** give deterministic application semantics: reliable queries, stable IDs and dependable deletion.

Using both gets the advantages of each.

### The memory API

The rest of the application never touches Cognee internals. It calls a stable, application-level memory API exposed from `debatemind/cognee/__init__.py`:

```text
remember_argument(...)        recall_weaknesses(...)
recall_topic_weaknesses(...)  recall_user_facts(...)
improve_fingerprint(...)      forget_pattern(...)
forget_personal_fact(...)
```

```text
            Debate agents (text + voice)
                        │
                        ▼
              DebateMind Memory API
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
     Remember         Recall          Forget
        └───────────────┼───────────────┘
                        ▼
                     Cognee
               ┌────────┴────────┐
               ▼                 ▼
             Neo4j            pgvector
```

Because the agents depend on this API rather than on Cognee directly, the underlying memory implementation can change without rewriting the debate logic.

### Using Cognee at two levels

DebateMind uses Cognee's high-level API (`cognee.add()`, `cognee.cognify()`) for prose ingestion, and its low-level storage APIs (`get_vector_engine()`, `get_graph_engine()`, `add_data_points()`, `delete_nodes()`) for precise control over deterministic IDs, deletion, user isolation, graph projection and vector collections. `cognee_config.py` configures Cognee's LLM and embedding setup explicitly.

## The memory lifecycle

Memory follows a clear four-stage lifecycle:

```text
REMEMBER ──► RECALL ──► IMPROVE ──► FORGET
    ▲                                  │
    └──────────────────────────────────┘
```

### 1. Remember

After a debate turn, the system extracts structured information and stores it as persistent memory:

```text
Topic:     AI Regulation
Argument:  "AI regulation will always destroy innovation."
Pattern:   Overgeneralization
Fallacy:   Slippery Slope
Evidence:  Weak
Outcome:   Lost
```

### 2. Recall

Before responding, DebateMind searches the user's memory for weaknesses relevant to the current topic. For "Should governments regulate generative AI?" it might retrieve: strawman, weak evidence, overgeneralization, and a history of losing on AI regulation.

```text
Historical memory ──► current context ──► adaptive opponent
```

### 3. Improve

Memory isn't static. `improve_fingerprint()` re-cognifies a user's accumulated data so relationships get richer as evidence builds up:

```text
Session 1:  User → Strawman
Session 2:  User → Strawman
Session 3:  User → Strawman + Weak Evidence
Session 4:  User → Strawman + Weak Evidence + AI Regulation

Result:
AI Regulation
   ├── Strawman
   └── Weak Evidence ── recurring pattern
```

### 4. Forget

Once a user has genuinely mastered a pattern, the opponent shouldn't keep attacking it. DebateMind performs **real deletion**: `forget_pattern()` removes the evidence from both Neo4j and pgvector instead of setting `mastered = true`. The application database keeps a `MasteryLog` that controls opponent behaviour, while the underlying memory is removed from Cognee.

The AI doesn't just learn; it also forgets what you've mastered. Because the fingerprint is sensitive behavioural data, `forget_personal_fact()` doubles as a **privacy control**.

## The text debate pipeline

The text bot is a LangGraph state machine. Each node reads from and writes to shared debate state:

```text
User argument
     │
     ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ extract  │──►│ opponent │──►│  judge   │──►│ mastery  │
└──────────┘   └────┬─────┘   └──────────┘   └────┬─────┘
                    │                             │
          recall_weaknesses()                     ▼
          recall_user_facts()              ┌─────────────┐
          filter mastered patterns         │  remember   │
                                           └──────┬──────┘
                                                  ▼
                                           ┌──────────────┐
                                           │remember_facts│
                                           └──────┬───────┘
                                                  ▼
                                           ┌─────────────┐
                                           │    prune    │
                                           └─────────────┘
```

### Extract

The user's argument is turned into structured state for downstream nodes. "Government regulation always kills innovation" becomes a claim (_regulation kills innovation_), a reasoning style (_generalization_), an evidence rating (_weak_) and a potential fallacy (_overgeneralization_).

### Opponent

This is where personalization happens. The node calls `recall_weaknesses()` and `recall_user_facts()`, filters the results against patterns the user has mastered, and injects what remains into the opponent's system prompt:

```text
Current topic:        AI regulation
Relevant weaknesses:  weak evidence, overgeneralization, strawman
Opponent strategy:    challenge evidence
                      + force precise definitions
                      + attack the generalization
```

A generic AI opponent becomes a memory-aware one.

### Judge

The judge scores the exchange on **logic**, **evidence** and **rhetoric**, and detects reasoning patterns and fallacies. Those results are what later become long-term memory.

```text
User argument ──► Judge ──┬──► Logic
                          ├──► Evidence
                          └──► Rhetoric
                                  │
                                  ▼
                          Pattern analysis
```

### Mastery

This node is what makes DebateMind a training system rather than a chatbot. It tracks whether a weakness is recurring, shrinking or consistently avoided:

```text
Week 1: Strawman ── recurring problem
Week 2: Strawman ── still occurring
Week 3: Strawman ── reduced
Week 4: Strawman ── consistently avoided  ──► mastered
```

Before mastery, the opponent keeps targeting strawman arguments. Afterwards it stops prioritizing them. Evaluation, memory, personalization and training reinforce each other.

### Remember, remember facts, prune

The final nodes dispatch the argument record and any newly revealed personal facts to memory, and prune the working state for the next turn.

### Why this is an agent, not a chatbot

A chatbot is `prompt → LLM → response`. DebateMind runs an agentic loop:

```text
Observe ──► Evaluate ──► Remember ──► Recall ──► Adapt ──► Act
   ▲                                                        │
   └────────────────────────────────────────────────────────┘
```

LangGraph orchestrates that stateful process in the text pipeline.

## One memory, two interfaces

Users can debate by **text** or by **voice**, and both share the same cognitive fingerprint: same user, same graph, same vector memory.

```text
  Voice debate                         Text debate
       │                                    │
       ▼                                    ▼
 discovers weakness ──► shared memory ──► opponent already knows
                        (per-user graph      about it
                         + vectors)
       ▲                                    │
       └──────────── and the reverse ◄──────┘
```

A weakness found in a spoken debate shapes the next typed debate, and vice versa: **cross-modal memory**.

### Voice: OpenAI Realtime over WebRTC

```text
Microphone ──► Browser ⇄ WebRTC ⇄ OpenAI Realtime ──► Voice agent
                                                        ├── debate
                                                        ├── memory tools
                                                        └── evaluation
```

Latency matters in spoken conversation. A request/response design (upload audio over HTTP, process, download audio) adds noticeable delay on every turn. WebRTC keeps a continuous real-time media channel between the browser and the realtime model, which is what a live debate needs.

### Text: streaming over SSE

The text interface streams the opponent's response over Server-Sent Events, so users see it being generated instead of waiting for the whole reply.

## Asynchronous memory pipeline

### Getting Cognee off the request path

Cognee's `add()`, `cognify()` and `forget()` calls involve LLM extraction, embedding and graph construction, and can take several seconds. Running them inline would make every debate turn wait for the graph.

```text
Synchronous (slow):
User argument ──► API waits ──► LLM extraction ──► embeddings ──► graph ──► response

DebateMind:
User argument ──► FastAPI ──► immediate response to the user
                     │
                     ▼
                  Redis ──► Celery worker ──► Cognee ──┬──► Neo4j
                                                       └──► pgvector
```

All Cognee writes are dispatched to Celery workers through Redis, so debate turns are never blocked by graph construction.

### Caching memory reads

Recalling weaknesses doesn't need to hit Neo4j and pgvector on every turn. Recall results are cached with a one-hour TTL and invalidated after writes for that user.

```text
Memory request ──► cache ──┬── HIT  ──► return
                           └── MISS ──► Cognee ──► store in cache ──► return
```

That lowers per-turn latency and database load.

### Per-user isolation

The system stores personal cognitive data, so isolation is essential. Each user gets their own Cognee dataset (`user_123_fingerprint`, `user_456_fingerprint`, …), and graph retrieval applies ownership filtering. User A's debates can only ever read User A's memory.

## Data architecture

DebateMind uses three persistence systems, each with one job:

```text
                    DebateMind
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
    App PostgreSQL   Cognee          Neo4j
                    PostgreSQL
                    + pgvector
          │             │              │
   users, sessions,  embeddings,    knowledge graph,
   exchanges,        Cognee's       entities and
   mastery logs      relational     relationships
                     data
```

### Why two PostgreSQL databases

The application database holds the business domain (users, sessions, debates, mastery). The Cognee database holds memory infrastructure. Keeping them separate means the application's models aren't coupled to Cognee's internal storage, so either side can evolve independently. It's more infrastructure, but a cleaner boundary between **business state** and **AI memory state**.

## Model routing

Model responsibilities are split deliberately:

```text
Debate agents + Cognee cognify ──► OpenRouter ──► openai/gpt-4.1-mini
Embeddings ─────────────────────► OpenAI API ──► text-embedding-3-large (3072 dims)
```

Routing chat and extraction through OpenRouter keeps model choice flexible. Embeddings go directly to OpenAI because OpenRouter doesn't provide the embeddings endpoint this setup needs.

## Complete system architecture

The whole system, from both interfaces through the agent and memory pipeline and back into the next debate:

```text
                           USER
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
         TEXT DEBATE                   VOICE DEBATE
       Next.js + SSE                 Browser + WebRTC
              │                             │
              ▼                             ▼
           FastAPI                   OpenAI Realtime
              └──────────────┬──────────────┘
                             ▼
                  Debate orchestrator (LangGraph)
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
         Extract          Opponent          Judge
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
             Recall weaknesses   Recall user facts
                    └────────┬────────┘
                             ▼
                          Mastery
                             │
                             ▼
                      Remember memory
                             │
                             ▼
                      Redis ──► Celery
                             │
                             ▼
                          Cognee
                   ┌─────────┴─────────┐
                   ▼                   ▼
                 Neo4j              pgvector
                 graph             embeddings
                   └─────────┬─────────┘
                             ▼
                   Cognitive fingerprint
                             │
                             ▼
                        Next debate
```

**How to read it:** both interfaces feed the same orchestrator. The opponent reads from memory through the recall path (cached), the judge and mastery nodes decide what is worth remembering, and writes flow asynchronously through Redis and Celery into Cognee. The resulting fingerprint is what the next debate recalls.

## Infrastructure

```text
                       Internet
                           │
                           ▼
                    ┌─────────────┐
                    │   Next.js   │
                    │  frontend   │
                    └──────┬──────┘
                           ▼
                    ┌─────────────┐
                    │   FastAPI   │
                    │   backend   │
                    └──────┬──────┘
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   App PostgreSQL        Redis           Cognee
                           │          ┌─────┴─────┐
                           ▼          ▼           ▼
                     Celery worker  Neo4j     pgvector
```

Everything runs locally with Docker Compose: the Next.js frontend, the FastAPI backend, Celery workers, Redis, the application Postgres, Cognee's Postgres with pgvector, and Neo4j. Schema changes go through SQLAlchemy models and Alembic migrations.

## Visualizing the fingerprint

The memory layer is visible to the user, not just used internally. The frontend includes a **knowledge-graph explorer** built with D3.js:

```text
             AI Regulation
                  │
         ┌────────┴────────┐
         ▼                 ▼
     Strawman        Weak Evidence
         └────────┬────────┘
                  ▼
             Argument #14
                  │
                  ▼
                 Lost
```

It also turns the fingerprint into a profile view:

```text
                    YOU
                     │
        ┌────────────┼─────────────┐
      Logic       Evidence      Rhetoric
     (strong)      (weak)       (strong)
                     │
            ┌────────┴────────┐
      AI Regulation        Politics
            │
         Strawman
```

Showing the graph makes an otherwise invisible memory system understandable, and far more compelling than a dashboard of numbers.

## End-to-end example

Following one argument through the entire system:

1. **User argues:** "Government regulation always destroys innovation."
2. **Opponent responds** with a counterargument.
3. **Judge scores it:** logic 5/10, evidence 3/10, rhetoric 7/10.
4. **Patterns detected:** overgeneralization, weak evidence.
5. **Memory created:** an `ArgumentRecord`, written as prose and as a typed node via Celery.
6. **Graph updated:** User → Argument → AI Regulation → Weak Evidence → Overgeneralization.
7. **Next debate:** the user picks "Should AI be regulated?"
8. **Recall:** relevant weaknesses are weak evidence and overgeneralization.
9. **Adaptive opponent:** "What evidence supports your claim that regulation _necessarily_ destroys innovation?"
10. **Training:** the user learns to shore up that exact weakness, and mastery tracking records whether they do.

## Engineering challenges

| Challenge                         | Solution                                                    |
| --------------------------------- | ----------------------------------------------------------- |
| Making memory actually useful     | Graph + vector retrieval with topic filtering               |
| Memory going stale                | Mastery tracking, real forgetting, graph improvement        |
| Slow graph construction           | Cognee writes run in Celery background workers              |
| Cross-modal memory                | One per-user Cognee dataset shared by text and voice        |
| Personal data leaking across users | Per-user datasets and ownership filtering                  |
| Exact queries miss similar cases  | pgvector semantic search                                    |
| Vectors can't express relationships | Neo4j knowledge graph                                     |
| Unpredictable LLM-extracted entities | Explicit typed DataPoint nodes alongside prose          |
| Real-time interaction             | WebRTC for voice, SSE for text                              |
| Structured multi-stage agent state | LangGraph state machine                                    |

## Architecture trade-offs

- **Graph + vector vs vector-only:** vector-only is simpler, but "find similar arguments" is a much easier question than "how do my evidence weakness, this topic and my past outcomes relate?" The graph pays for its complexity by answering the second.
- **Celery vs synchronous writes:** synchronous is simpler but makes every turn slow. Celery adds infrastructure in exchange for a non-blocking debate experience.
- **Typed nodes + prose:** typed nodes are reliable, prose is semantically rich. Writing both gets both.
- **Two databases:** more to run, but a clean separation between business state and AI memory state.

## Privacy and security

DebateMind stores an unusually sensitive kind of data: a user's behavioural and cognitive profile. The architecture addresses that with per-user datasets, ownership filtering on retrieval, authenticated API access, and **hard deletion** of memory through the forget operations, so a user's lifecycle controls apply to the graph and vectors themselves, not just a flag in a table.

## Technology stack

| Layer               | Technology                              |
| ------------------- | --------------------------------------- |
| Frontend            | Next.js, React, Tailwind CSS            |
| Visualization       | D3.js                                   |
| Backend             | FastAPI (Python)                        |
| Agent orchestration | LangGraph                               |
| Memory engine       | Cognee                                  |
| Graph database      | Neo4j                                   |
| Vector store        | PostgreSQL + pgvector                   |
| Application DB      | PostgreSQL, SQLAlchemy, Alembic         |
| Async workers       | Celery with Redis as broker             |
| LLM gateway         | OpenRouter (`openai/gpt-4.1-mini`)      |
| Embeddings          | OpenAI `text-embedding-3-large` (3072-d) |
| Voice               | OpenAI Realtime API over WebRTC         |
| Text streaming      | Server-Sent Events                      |
| Infrastructure      | Docker Compose                          |

## Business opportunity

The larger opportunity isn't "AI that debates with you". It's **personalized cognitive training through persistent AI memory**. The debate is the interface; the platform underneath is:

```text
Personal AI + long-term memory + behavioural analysis + adaptive training
```

The same architecture extends naturally to:

- **Interview preparation:** spotting vague answers, weak evidence and inconsistencies.
- **Sales training:** learning a rep's recurring weaknesses when handling objections.
- **Leadership and communication training:** practising persuasion and decision-making.
- **Education:** building argumentation, critical thinking and evidence-based reasoning.
- **Public speaking:** where voice mode is especially useful.

A natural (not yet implemented) SaaS model would have a free tier with limited debates and basic memory, a Pro tier with unlimited debates, long-term memory, voice and cognitive analytics, and an enterprise tier with team accounts, private memory, custom training domains and admin controls.

> DebateMind learns how you argue. Every conversation becomes structured memory, connecting your topics, reasoning patterns, evidence quality and recurring fallacies into a living cognitive fingerprint that the next debate uses to challenge your actual weaknesses.
