import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CommandService, type CreateArticleDto } from './command.service.js';
import { ArticleCategory } from './entities/article.entity.js';

interface FindByIdRequest {
  id: string;
}

interface FindAllKioskRequest {
  onlyAvailable?: boolean;
}

interface GetArticlesRequest {
  onlyAvailable?: boolean;
}

interface FindByCategoryRequest {
  category: ArticleCategory;
}

interface UpdateAvailabilityRequest {
  id: string;
  isAvailable: boolean;
}

@Controller()
export class CommandController {
  constructor(private readonly commandService: CommandService) {}

  @GrpcMethod('CommandService', 'CreateArticle')
  createArticle(data: CreateArticleDto) {
    return this.commandService.createArticle(data);
  }

  @GrpcMethod('CommandService', 'FindArticleById')
  findArticleById(data: FindByIdRequest) {
    return this.commandService.findById(data.id);
  }

  @GrpcMethod('CommandService', 'GetArticles')
  async getArticles(data?: GetArticlesRequest) {
    const articles = await this.commandService.findAllForKiosk(
      data?.onlyAvailable ?? true,
    );

    return { articles };
  }

  @GrpcMethod('CommandService', 'FindArticlesKiosk')
  async findArticlesKiosk(data?: FindAllKioskRequest) {
    const articles = await this.commandService.findAllForKiosk(
      data?.onlyAvailable ?? false,
    );

    return { articles };
  }

  @GrpcMethod('CommandService', 'FindArticlesByCategory')
  async findArticlesByCategory(data: FindByCategoryRequest) {
    const articles = await this.commandService.findByCategory(data.category);

    return { articles };
  }

  @GrpcMethod('CommandService', 'UpdateArticleAvailability')
  updateArticleAvailability(data: UpdateAvailabilityRequest) {
    return this.commandService.updateAvailability(data.id, data.isAvailable);
  }

  @GrpcMethod('CommandService', 'RemoveArticle')
  async removeArticle(data: FindByIdRequest) {
    await this.commandService.remove(data.id);

    return { deleted: true };
  }
}
