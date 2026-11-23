import { status } from '@grpc/grpc-js';
import { rpcError } from '@makido/contracts/grpc';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Article,
  ArticleCategory,
  type ArticleCustomizationGroup,
  type ArticleCustomizationOption,
} from './entities/article.entity.js';

export interface CreateArticleDto {
  name: string;
  price: number;
  category?: ArticleCategory;
  description?: null | string;
  imageUrl?: null | string;
  isAvailable?: boolean;
  displayOrder?: number;
  allergens?: null | string[];
  prepTimeSeconds?: null | number;
  customizations?: ArticleCustomizationGroup[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

export function validateArticleCustomizations(
  value: unknown,
): ArticleCustomizationGroup[] {
  if (!Array.isArray(value)) {
    throw rpcError(
      status.INVALID_ARGUMENT,
      'Les personnalisations doivent être une liste.',
    );
  }

  const groupIds = new Set<string>();

  return value.map((rawGroup, groupIndex) => {
    if (!isRecord(rawGroup)) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Le groupe ${groupIndex + 1} est invalide.`,
      );
    }

    const {
      id,
      name,
      minSelections,
      maxSelections,
      includedSelections,
      options,
    } = rawGroup;
    if (
      typeof id !== 'string' ||
      id.trim() === '' ||
      groupIds.has(id) ||
      typeof name !== 'string' ||
      name.trim() === '' ||
      !isNonNegativeInteger(minSelections) ||
      !isNonNegativeInteger(maxSelections) ||
      !isNonNegativeInteger(includedSelections) ||
      minSelections > maxSelections ||
      includedSelections > maxSelections ||
      !Array.isArray(options) ||
      (maxSelections > 0 && options.length === 0)
    ) {
      throw rpcError(
        status.INVALID_ARGUMENT,
        `Les contraintes du groupe de personnalisation "${String(name)}" sont invalides.`,
      );
    }

    groupIds.add(id);
    const optionIds = new Set<string>();
    const validatedOptions: ArticleCustomizationOption[] = options.map(
      (rawOption, optionIndex) => {
        if (!isRecord(rawOption)) {
          throw rpcError(
            status.INVALID_ARGUMENT,
            `L'option ${optionIndex + 1} du groupe "${name}" est invalide.`,
          );
        }

        const { id: optionId, name: optionName, additionalPrice } = rawOption;
        if (
          typeof optionId !== 'string' ||
          optionId.trim() === '' ||
          optionIds.has(optionId) ||
          typeof optionName !== 'string' ||
          optionName.trim() === '' ||
          typeof additionalPrice !== 'number' ||
          !Number.isFinite(additionalPrice) ||
          additionalPrice < 0
        ) {
          throw rpcError(
            status.INVALID_ARGUMENT,
            `Les données de l'option ${optionIndex + 1} du groupe "${name}" sont invalides.`,
          );
        }

        optionIds.add(optionId);

        return { id: optionId, name: optionName, additionalPrice };
      },
    );

    return {
      id,
      name,
      minSelections,
      maxSelections,
      includedSelections,
      options: validatedOptions,
    };
  });
}

@Injectable()
export class CommandService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepo: Repository<Article>,
  ) {}

  async createArticle(data: CreateArticleDto): Promise<Article> {
    const customizations = validateArticleCustomizations(
      data.customizations ?? [],
    );
    const article = this.articleRepo.create({ ...data, customizations });

    return this.articleRepo.save(article);
  }

  async findById(id: string): Promise<Article> {
    const article = await this.articleRepo.findOne({ where: { id } });
    if (!article) {
      throw new NotFoundException(`Article avec l'id "${id}" introuvable`);
    }

    return article;
  }

  async findAllForKiosk(onlyAvailable = false): Promise<Article[]> {
    return this.articleRepo.find({
      where: onlyAvailable ? { isAvailable: true } : {},
      order: {
        category: 'ASC',
        name: 'ASC',
      },
    });
  }

  async findByCategory(category: ArticleCategory): Promise<Article[]> {
    return this.articleRepo.find({
      where: { category, isAvailable: true },
    });
  }

  async updateAvailability(id: string, isAvailable: boolean): Promise<Article> {
    const article = await this.findById(id);
    article.isAvailable = isAvailable;

    return this.articleRepo.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findById(id);
    await this.articleRepo.remove(article);
  }
}
