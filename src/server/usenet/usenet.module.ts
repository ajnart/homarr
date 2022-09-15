import { Module } from '@nestjs/common';
import { SabnzbdModule } from '../sabnzbd/sabnzbd.module';
import { UsenetResolver } from './usenet.resolver';

@Module({
  providers: [UsenetResolver],
  imports: [SabnzbdModule],
})
export class UsenetModule {}
