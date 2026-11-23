import { describe, expect, it } from 'vitest';

import { validateArticleCustomizations } from './command.service.js';

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
});
