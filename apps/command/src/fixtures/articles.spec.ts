import { describe, expect, it } from 'vitest';

import { validateArticleCustomizations } from '../article-customizations.js';
import { seedArticles } from './articles.js';

describe('article fixtures', () => {
  it('provide valid customizations and unique identifiers for every article', () => {
    const ids = seedArticles.map((article) => article.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const article of seedArticles) {
      expect(article.customizations.length).toBeGreaterThan(0);
      expect(validateArticleCustomizations(article.customizations)).toEqual(
        article.customizations,
      );
    }
  });
});
