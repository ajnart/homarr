import { Controller, Get, Query } from '@nestjs/common';
import axios from 'axios';
import { Config } from '../configs/config.types';
import { CurrentConfig } from '../utils/currentConfig.decorator';

@Controller('/modules/search')
export class SearchController {
  @Get()
  async search(@Query('q') q: string, @CurrentConfig() currentConfig: Config) {
    const response = await axios.get(`${currentConfig.settings.searchUrl}${q}`);

    return response.data;
  }
}
