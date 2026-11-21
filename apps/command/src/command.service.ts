import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Article, ArticleCategory } from './entities/article.entity.js';

export interface CreateArticleDto {
  name: string;
  price: number;
  category?: ArticleCategory;
  description?: string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  displayOrder?: number;
  allergens?: string[] | null;
  prepTimeSeconds?: number | null;
}

@Injectable()
export class CommandService {
  constructor(
      @InjectRepository(Article)
      private readonly articleRepo: Repository<Article>,
  ) {}

  async createArticle(data: CreateArticleDto): Promise<Article> {
    const article = this.articleRepo.create(data);
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