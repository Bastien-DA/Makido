import { describe, expect, it } from 'vitest';

import { Article } from '../../articles/entities/article.entity.js';
import { priceLine } from './order-pricing.js';

const article = {
  id: 'article',
  name: 'Sushi burger',
  price: 10,
  isAvailable: true,
  ingredients: ['riz', 'saumon'],
  customizations: [
    {
      id: 'fish',
      name: 'Poisson',
      minSelections: 1,
      maxSelections: 3,
      includedSelections: 1,
      options: [
        { id: 'salmon', name: 'Saumon', additionalPrice: 2 },
        { id: 'tuna', name: 'Thon', additionalPrice: 3 },
      ],
    },
    {
      id: 'sauce',
      name: 'Sauce',
      minSelections: 0,
      maxSelections: 1,
      includedSelections: 0,
      options: [
        {
          id: 'spicy',
          name: 'Piquante',
          additionalPrice: 0.5,
          incompatibleWith: [{ groupId: 'fish', optionId: 'tuna' }],
        },
      ],
    },
  ],
} as Article;

const line = {
  articleId: 'article',
  quantity: 2,
  customizations: [
    { groupId: 'fish', optionId: 'salmon', quantity: 2, includedQuantity: 1 },
    { groupId: 'sauce', optionId: 'spicy', quantity: 1, includedQuantity: 0 },
  ],
};

describe('order pricing', () => {
  it('charges only extras and snapshots the ingredients and customizations', () => {
    const result = priceLine(article, line);
    expect(result.totalCents).toBe(2500);
    expect(result.snapshot.ingredients).toEqual(['riz', 'saumon']);
    expect(result.snapshot.customizations).toHaveLength(2);
  });

  it('rejects incorrect included quantities, excess portions and incompatible options', () => {
    expect(() =>
      priceLine(article, {
        ...line,
        customizations: [{ ...line.customizations[0], includedQuantity: 0 }],
      }),
    ).toThrow();
    expect(() =>
      priceLine(article, {
        ...line,
        customizations: [{ ...line.customizations[0], quantity: 4 }],
      }),
    ).toThrow();
    expect(() =>
      priceLine(article, {
        ...line,
        customizations: [
          {
            groupId: 'fish',
            optionId: 'tuna',
            quantity: 1,
            includedQuantity: 1,
          },
          line.customizations[1],
        ],
      }),
    ).toThrow('Options incompatibles.');
  });

  it('rejects unavailable articles and totals beyond safe integer precision', () => {
    expect(() =>
      priceLine(
        Object.assign(new Article(), article, { isAvailable: false }),
        line,
      ),
    ).toThrow();
    expect(() =>
      priceLine(article, { ...line, quantity: Number.MAX_SAFE_INTEGER }),
    ).toThrow();
  });
});
