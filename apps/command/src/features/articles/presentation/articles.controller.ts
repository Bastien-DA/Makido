import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { ArticlesService } from '../domain/services/articles.service.js';
import type { CreateArticleDto } from '../domain/services/articles.service.js';
import { ArticleCategory } from '../entities/article.entity.js';

interface FindByIdRequest {
  id: string;
}

interface GetArticlesRequest {
  onlyAvailable?: boolean;
  category?: ArticleCategory;
}

interface UpdateAvailabilityRequest {
  id: string;
  isAvailable: boolean;
}

@Controller()
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @GrpcMethod('CommandService', 'CreateArticle')
  createArticle(data: CreateArticleDto) {
    return this.articlesService.createArticle(data);
  }

  @GrpcMethod('CommandService', 'FindArticleById')
  findArticleById(data: FindByIdRequest) {
    return this.articlesService.findById(data.id);
  }

  @GrpcMethod('CommandService', 'GetArticles')
  async getArticles(data?: GetArticlesRequest) {
    const category = data?.category;
    if (
      category !== undefined &&
      !Object.values(ArticleCategory).includes(category)
    ) {
      throw rpcError(status.INVALID_ARGUMENT, "Catégorie d'article invalide.");
    }

    return {
      articles: await this.articlesService.findArticles(
        data?.onlyAvailable ?? true,
        category,
      ),
    };
  }

  @GrpcMethod('CommandService', 'UpdateArticleAvailability')
  updateArticleAvailability(data: UpdateAvailabilityRequest) {
    return this.articlesService.updateAvailability(data.id, data.isAvailable);
  }

  @GrpcMethod('CommandService', 'RemoveArticle')
  async removeArticle(data: FindByIdRequest) {
    await this.articlesService.remove(data.id);

    return { deleted: true };
  }
}
