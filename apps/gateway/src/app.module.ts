import {ArticlesModule} from "./features/articles/articles.module.js";
import {MiddlewareConsumer, Module, NestModule} from "@nestjs/common";
import {RequestLoggerMiddleware} from "./core/middleware/request-logger.middleware.js";

/*const SharedModule = [
];*/

const FeatureModule = [
  ArticlesModule
];

@Module({
  imports: [/*...SharedModule, */...FeatureModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}