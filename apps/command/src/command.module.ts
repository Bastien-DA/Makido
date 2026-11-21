import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './entities/article.entity.js';
import { CommandController } from './command.controller.js';
import { CommandService } from './command.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<number>('DB_PORT') ?? 5432),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities: [Article],
        synchronize: true,
      }),
    }),
    TypeOrmModule.forFeature([Article]),
  ],
  controllers: [CommandController],
  providers: [CommandService],
})
export class CommandModule {}