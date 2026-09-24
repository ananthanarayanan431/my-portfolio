export interface PostLike {
  id: string;
  data: { pubDate: Date; draft?: boolean };
}

export function filterDrafts<T extends PostLike>(posts: T[], includeDrafts: boolean): T[] {
  return includeDrafts ? posts : posts.filter((p) => !p.data.draft);
}

export function sortPostsByDate<T extends PostLike>(posts: T[]): T[] {
  return [...posts].sort((a, b) => {
    const byDate = b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
    return byDate !== 0 ? byDate : a.id.localeCompare(b.id);
  });
}
