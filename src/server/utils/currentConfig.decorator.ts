import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '../configs/config.service';

@Injectable()
export class GetConfigPipe implements PipeTransform {
  constructor(private configService: ConfigService) {}

  async transform(value: string, metadata: ArgumentMetadata) {
    try {
      return await this.configService.getConfig(value);
    } catch (err) {
      throw new Error(`No config found with ${value}`);
    }
  }
}

export const GetConfigName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().cookies['config-name']
);

export const CurrentConfig = (additionalOptions?: any) =>
  GetConfigName(additionalOptions, GetConfigPipe);
