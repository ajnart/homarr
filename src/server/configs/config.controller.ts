import { Controller, Get, Param, Res, Body, Put, Delete } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { Response } from 'express';
import { ConfigService } from './config.service';

@Controller({
  path: '/modules/configs',
})
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  async listConfigs() {
    return this.configService.getConfigs();
  }

  @Get(':configName')
  async readConfig(@Param('configName') configName: string, @Res() res: Response) {
    try {
      res.json(await this.configService.getConfig(configName));
    } catch (err) {
      res.status(404).json({
        message: 'Target not found',
      });
    }
  }

  @Put(':configName')
  async writeConfig(
    @Param('configName') configName: string,
    @Res() res: Response,
    @Body() body: any
  ) {
    this.configService.writeConfig(configName, body);

    res.json({
      message: 'Configuration saved with success',
    });
  }

  @Delete(':configName')
  async deleteConfig(
    @Param('configName') configName: string,
    @Res() res: Response,
    @Body() body: any
  ) {
    const path = `data/configs/${configName}.json`;

    try {
      await unlink(path);

      res.json({
        message: 'Configuration deleted with success',
      });
    } catch (err) {
      res.status(404).json({
        message: 'Target not found',
      });
    }
  }
}
