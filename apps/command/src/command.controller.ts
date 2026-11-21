import { Controller } from '@nestjs/common';
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { GrpcMethod } from '@nestjs/microservices';
import { ArticleCategory } from './entities/article.entity.js';
import { CommandService, type CreateArticleDto } from './command.service.js';

interface FindByIdRequest {
  id: string;
}

interface FindAllKioskRequest {
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
  createArticle(
      data: CreateArticleDto,
      _metadata?: Metadata,
      _call?: ServerUnaryCall<CreateArticleDto, unknown>,
  ) {
    return this.commandService.createArticle(data);
  }

  @GrpcMethod('CommandService', 'FindArticleById')
  findArticleById(data: FindByIdRequest) {
    return this.commandService.findById(data.id);
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