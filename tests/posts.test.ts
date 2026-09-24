import { describe, expect, it } from 'vitest';
import { filterDrafts, sortPostsByDate, type PostLike } from '../src/lib/posts';

const post = (id: string, date: string, draft = false): PostLike => ({
  id,
  data: { pubDate: new Date(date), draft },
});

describe('filterDrafts', () => {
  it('removes drafts when drafts are excluded', () => {
    const posts = [post('a', '2026-01-01'), post('b', '2026-01-02', true)];
    expect(filterDrafts(posts, false).map((p) => p.id)).toEqual(['a']);
  });

  it('keeps drafts when drafts are included', () => {
    const posts = [post('a', '2026-01-01'), post('b', '2026-01-02', true)];
    expect(filterDrafts(posts, true).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('treats a missing draft field as published', () => {
    const posts: PostLike[] = [{ id: 'a', data: { pubDate: new Date('2026-01-01') } }];
    expect(filterDrafts(posts, false)).toHaveLength(1);
  });

  it('returns an empty array for an empty collection', () => {
    expect(filterDrafts([], false)).toEqual([]);
  });
});

describe('sortPostsByDate', () => {
  it('orders newest first', () => {
    const posts = [post('old', '2026-01-01'), post('new', '2026-06-01')];
    expect(sortPostsByDate(posts).map((p) => p.id)).toEqual(['new', 'old']);
  });

  it('breaks ties by id so ordering is deterministic across builds', () => {
    const posts = [post('zebra', '2026-01-01'), post('apple', '2026-01-01')];
    expect(sortPostsByDate(posts).map((p) => p.id)).toEqual(['apple', 'zebra']);
  });

  it('does not mutate the input array', () => {
    const posts = [post('old', '2026-01-01'), post('new', '2026-06-01')];
    sortPostsByDate(posts);
    expect(posts.map((p) => p.id)).toEqual(['old', 'new']);
  });

  it('returns an empty array for an empty collection', () => {
    expect(sortPostsByDate([])).toEqual([]);
  });
});
