import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigController } from './config.controller';
import { ConfigResolver } from './config.resolver';

@Global()
@Module({
  controllers: [ConfigController],
  providers: [ConfigService, ConfigResolver],
  exports: [ConfigService],
})
export class ConfigModule {}
