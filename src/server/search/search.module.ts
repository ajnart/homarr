import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';

@Module({
  controllers: [SearchController],
})
export class SearchModule {}
