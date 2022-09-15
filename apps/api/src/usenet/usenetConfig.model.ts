import { ObjectType } from '@nestjs/graphql';
import { ConfigModule } from '../configs/models/configModule.model';

@ObjectType()
export class UsenetConfig extends ConfigModule {}
