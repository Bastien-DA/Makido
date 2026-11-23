import type { ServerUnaryCall } from '@grpc/grpc-js';

import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CommandService, type CreateArticleDto } from './command.service.js';
import { ArticleCategory } from './entities/article.entity.js';
import { assertPaymentIdentity } from './mtls.js';
import { type FinalizeCommandRequest, OrderService } from './order.service.js';

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
export class CommandController {
  constructor(
    private readonly commandService: CommandService,
    private readonly orderService: OrderService,
  ) {}

  @GrpcMethod('CommandService', 'FinalizeCommand')
  finalizeCommand(data: FinalizeCommandRequest) {
    return this.orderService.finalize(data);
  }

  @GrpcMethod('CommandService', 'PaymentConfirmed')
  paymentConfirmed(
    data: { reference: string; createdAtUtc: string },
    _metadata: unknown,
    call: ServerUnaryCall<unknown, unknown>,
  ) {
    assertPaymentIdentity(call);

    return this.orderService.confirmPayment(data.reference, data.createdAtUtc);
  }

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
    const category = data?.category;
    if (
      category !== undefined &&
      !Object.values(ArticleCategory).includes(category)
    ) {
      throw rpcError(status.INVALID_ARGUMENT, 'Catégorie d’article invalide.');
    }

    return {
      articles: await this.commandService.findArticles(
        data?.onlyAvailable ?? true,
        category,
      ),
    };
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
