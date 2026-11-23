import type { DataSourceOptions } from 'typeorm';

import { type ConfigService } from '@nestjs/config';

import { Article } from './entities/article.entity.js';

export function databaseOptions(config: ConfigService): DataSourceOptions {
  return {
    type: 'postgres',
    host: config.get<string>('DB_HOST'),
    port: Number(config.get<string>('DB_PORT') ?? 5432),
    username: config.get<string>('DB_USER'),
    password: config.get<string>('DB_PASSWORD'),
    database: config.get<string>('DB_NAME'),
    entities: [Article],
  };
}
