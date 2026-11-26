import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Article } from './entities/article.entity.js';
import { ArticlesController } from './presentation/articles.controller.js';
import { articlesProviders } from './di/articles.provider.js';

@Module({
  imports: [TypeOrmModule.forFeature([Article])],
  controllers: [ArticlesController],
  providers: articlesProviders,
})
export class ArticlesModule {}
