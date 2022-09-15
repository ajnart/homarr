import { Global, Module } from '@nestjs/common';
import { ConfigService } from './config.service';
import { ConfigResolver } from './config.resolver';

@Global()
@Module({
  providers: [ConfigService, ConfigResolver],
  exports: [ConfigService],
})
export class ConfigModule {}
