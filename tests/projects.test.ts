import { describe, expect, it } from 'vitest';
import { featuredProjects, sortProjects, type ProjectLike } from '../src/lib/projects';

const project = (id: string, order?: number, featured = false): ProjectLike => ({
  id,
  data: { order, featured },
});

describe('sortProjects', () => {
  it('orders by ascending order value', () => {
    const projects = [project('b', 2), project('a', 1)];
    expect(sortProjects(projects).map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('places projects without an order value last, sorted by id', () => {
    const projects = [project('zebra'), project('apple'), project('ordered', 1)];
    expect(sortProjects(projects).map((p) => p.id)).toEqual(['ordered', 'apple', 'zebra']);
  });

  it('does not mutate the input array', () => {
    const projects = [project('b', 2), project('a', 1)];
    sortProjects(projects);
    expect(projects.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it('returns an empty array for an empty collection', () => {
    expect(sortProjects([])).toEqual([]);
  });
});

describe('featuredProjects', () => {
  it('returns only featured projects, limited and ordered', () => {
    const projects = [
      project('c', 3, true),
      project('a', 1, true),
      project('skip', 2, false),
      project('b', 4, true),
    ];
    expect(featuredProjects(projects, 2).map((p) => p.id)).toEqual(['a', 'c']);
  });

  it('returns an empty array when nothing is featured', () => {
    expect(featuredProjects([project('a', 1, false)], 3)).toEqual([]);
  });

  it('returns fewer than the limit when not enough are featured', () => {
    expect(featuredProjects([project('a', 1, true)], 3)).toHaveLength(1);
  });
});
