import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { ArticlesController } from './articles.controller.js';
import { ArticlesService } from '../domain/services/articles.service.js';
import { ArticleCategory } from '../entities/article.entity.js';

describe('article listing RPCs', () => {
  it('passes the availability and category filters to the service', async () => {
    const findArticles = vi.fn().mockResolvedValue([]);
    const module = await Test.createTestingModule({
      controllers: [ArticlesController],
      providers: [
        { provide: ArticlesService, useValue: { findArticles } },
      ],
    }).compile();
    const controller = module.get(ArticlesController);

    expect(await controller.getArticles()).toEqual({ articles: [] });
    expect(
      await controller.getArticles({
        onlyAvailable: false,
        category: ArticleCategory.BURGER,
      }),
    ).toEqual({ articles: [] });
    expect(findArticles.mock.calls).toEqual([
      [true, undefined],
      [false, ArticleCategory.BURGER],
    ]);
  });
});
