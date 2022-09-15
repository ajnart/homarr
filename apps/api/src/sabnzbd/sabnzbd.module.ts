import { Module } from '@nestjs/common';
import { SabnzbdService } from './sabnzbd.service';

@Module({
  providers: [SabnzbdService],
  exports: [SabnzbdService],
})
export class SabnzbdModule {}
