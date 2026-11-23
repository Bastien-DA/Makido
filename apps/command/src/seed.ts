import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';

import { databaseOptions } from './database-options.js';
import { Article } from './entities/article.entity.js';
import { seedArticles } from './fixtures/articles.js';

const dataSource = new DataSource(databaseOptions(new ConfigService()));
await dataSource.initialize();

try {
  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Article)
    .values(seedArticles)
    .orUpdate(['customizations'], ['id'], {
      overwriteCondition: {
        where: '"articles"."customizations" = :emptyCustomizations',
        parameters: { emptyCustomizations: '[]' },
      },
    })
    .execute();
  const parameters = seedArticles.flatMap((article) => [
    article.id,
    article.ingredients,
  ]);
  const values = seedArticles
    .map((_, index) => `($${index * 2 + 1}::uuid, $${index * 2 + 2}::text[])`)
    .join(', ');
  await dataSource.query(
    `UPDATE articles SET ingredients = seed.ingredients FROM (VALUES ${values}) AS seed(id, ingredients) WHERE articles.id = seed.id AND cardinality(articles.ingredients) = 0`,
    parameters,
  );
  console.log('Fixtures des articles chargées.');
} finally {
  await dataSource.destroy();
}
