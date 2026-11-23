import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe, expect, it, vi } from 'vitest';

import { validateArticleCustomizations } from './article-customizations.js';
import { CommandService } from './command.service.js';
import { Article, ArticleCategory } from './entities/article.entity.js';

describe('article filters', () => {
  it('combines category and availability without changing the existing sort order', async () => {
    const find = vi
      .fn<(options: FindManyOptions<Article>) => Promise<Article[]>>()
      .mockResolvedValue([]);
    const module = await Test.createTestingModule({
      providers: [
        CommandService,
        { provide: getRepositoryToken(Article), useValue: { find } },
      ],
    }).compile();
    const service = module.get(CommandService);

    await service.findArticles(true, ArticleCategory.BURGER);
    await service.findArticles(false, ArticleCategory.SIDE);
    await service.findArticles(false);
    expect(find.mock.calls.map(([options]) => options.where)).toEqual([
      { isAvailable: true, category: ArticleCategory.BURGER },
      { category: ArticleCategory.SIDE },
      {},
    ]);
    expect(find.mock.calls[0]?.[0].order).toEqual({
      category: 'ASC',
      name: 'ASC',
    });
  });
});

describe('validateArticleCustomizations', () => {
  it('accepts a required quantity range and an included base quantity', () => {
    const groups = validateArticleCustomizations([
      {
        id: 'salmon',
        name: 'Portions de saumon',
        minSelections: 1,
        maxSelections: 3,
        includedSelections: 1,
        options: [
          {
            id: 'salmon-piece',
            name: 'Morceau de saumon',
            additionalPrice: 2,
          },
        ],
      },
    ]);

    expect(groups[0]?.minSelections).toBe(1);
    expect(groups[0]?.maxSelections).toBe(3);
    expect(groups[0]?.includedSelections).toBe(1);
  });

  it('rejects a range whose minimum exceeds its maximum', () => {
    expect(() =>
      validateArticleCustomizations([
        {
          id: 'salmon',
          name: 'Portions de saumon',
          minSelections: 3,
          maxSelections: 1,
          includedSelections: 1,
          options: [
            {
              id: 'salmon-piece',
              name: 'Morceau de saumon',
              additionalPrice: 2,
            },
          ],
        },
      ]),
    ).toThrow(
      'Les contraintes du groupe de personnalisation "Portions de saumon" sont invalides.',
    );
  });

  it('rejects duplicate option identifiers and negative prices', () => {
    const option = { id: 'salmon', name: 'Saumon', additionalPrice: 2 };
    const group = {
      id: 'portions',
      name: 'Portions',
      minSelections: 1,
      maxSelections: 3,
      includedSelections: 1,
      options: [option, option],
    };

    expect(() => validateArticleCustomizations([group])).toThrow(
      'Les données de l\'option 2 du groupe "Portions" sont invalides.',
    );
    expect(() =>
      validateArticleCustomizations([
        { ...group, options: [{ ...option, additionalPrice: -1 }] },
      ]),
    ).toThrow(
      'Les données de l\'option 1 du groupe "Portions" sont invalides.',
    );
  });
});
import type { FindManyOptions } from 'typeorm';
