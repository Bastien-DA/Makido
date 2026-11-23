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
  console.log('Fixtures des articles chargées.');
} finally {
  await dataSource.destroy();
}
