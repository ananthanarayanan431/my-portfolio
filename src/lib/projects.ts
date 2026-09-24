export interface ProjectLike {
  id: string;
  data: { featured?: boolean; order?: number };
}

export function sortProjects<T extends ProjectLike>(projects: T[]): T[] {
  return [...projects].sort((a, b) => {
    const ao = a.data.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.data.order ?? Number.MAX_SAFE_INTEGER;
    return ao !== bo ? ao - bo : a.id.localeCompare(b.id);
  });
}

export function featuredProjects<T extends ProjectLike>(projects: T[], limit: number): T[] {
  return sortProjects(projects.filter((p) => p.data.featured)).slice(0, limit);
}
