export interface SkillGroup {
  category: string;
  items: string[];
}

export const SKILLS: SkillGroup[] = [
  {
    category: 'Languages',
    items: ['Python', 'C/C++', 'SQL', 'HTML/CSS', 'JavaScript', 'TypeScript'],
  },
  {
    category: 'AI/ML Frameworks',
    items: [
      'LangChain',
      'LangGraph',
      'LlamaIndex',
      'CrewAI',
      'Google ADK',
      'Transformers',
      'OpenAI API',
      'Groq',
    ],
  },
  {
    category: 'Web & Protocols',
    items: ['Vue.js', 'FastAPI', 'Tailwind CSS', 'Pinia', 'MCP', 'A2A', 'AG-UI', 'WebRTC'],
  },
  {
    category: 'Databases & Vector Stores',
    items: [
      'PostgreSQL',
      'ClickHouse',
      'MySQL',
      'Pinecone',
      'ChromaDB',
      'Qdrant',
      'MongoDB',
      'Neo4j',
    ],
  },
  {
    category: 'Developer Tools',
    items: ['Git/GitHub', 'Docker', 'Dev Containers', 'Cursor', 'Antigravity', 'pytest'],
  },
  {
    category: 'Libraries',
    items: ['pandas', 'NumPy', 'Matplotlib', 'RAGAS', 'NeMo Guardrails', 'Custom RAG Pipelines'],
  },
];
