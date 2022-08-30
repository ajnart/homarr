import { Module } from '@nestjs/common';
import { RadarrService } from './radar.service';

@Module({
  providers: [RadarrService],
  exports: [RadarrService],
})
export class RadarrModule {}
