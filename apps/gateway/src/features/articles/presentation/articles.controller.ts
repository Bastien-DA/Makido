import {
    Controller,
} from '@nestjs/common';
import {ArticlesService} from "../domain/services/articles.service.js";

@Controller('articles')
export class ArticlesController {
    constructor(private articlesService: ArticlesService) {}
}
