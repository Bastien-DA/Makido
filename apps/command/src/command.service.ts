import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { validateArticleCustomizations } from './article-customizations.js';
import {
  Article,
  ArticleCategory,
  type ArticleCustomizationGroup,
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

  async findArticles(
    onlyAvailable = true,
    category?: ArticleCategory,
  ): Promise<Article[]> {
    return this.articleRepo.find({
      where: {
        ...(onlyAvailable ? { isAvailable: true } : {}),
        ...(category === undefined ? {} : { category }),
      },
      order: {
        category: 'ASC',
        name: 'ASC',
      },
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
