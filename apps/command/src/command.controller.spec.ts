import { Test } from '@nestjs/testing';
import { describe, expect, it, vi } from 'vitest';

import { CommandController } from './command.controller.js';
import { CommandService } from './command.service.js';
import { ArticleCategory } from './entities/article.entity.js';

describe('article listing RPCs', () => {
  it('passes the availability and category filters to the service', async () => {
    const findArticles = vi.fn().mockResolvedValue([]);
    const module = await Test.createTestingModule({
      controllers: [CommandController],
      providers: [{ provide: CommandService, useValue: { findArticles } }],
    }).compile();
    const controller = module.get(CommandController);

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
