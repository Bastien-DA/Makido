import { Module } from '@nestjs/common';
import {ArticlesController} from "./presentation/articles.controller.js";
import {articlesProviders} from "./di/articles.provider.js";

@Module({
    // exports: ['ArticlesRepository'], Here you can export your injected dependencies
    controllers: [ArticlesController],
    providers: articlesProviders,
})
export class ArticlesModule {}
