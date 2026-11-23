import {ArticlesService} from "../domain/services/articles.service.js";

export const articlesProviders = [
    ArticlesService,
/*    {  Here you can inject your dependencies
        provide: 'ArticlesRepository',
        useClass: ArticlesRepositoryImplementationExample,
    }, */
];
