import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Config } from './models/config.model';
import { ConfigService } from './config.service';
import { Service } from './models/service.model';
import { ServiceInput } from './models/serviceInput.model';

@Resolver(() => Config)
export class ConfigResolver {
  constructor(private configService: ConfigService) {}

  @Query(() => Config)
  async config(@Args('configName') configName: string): Promise<Config> {
    return this.configService.getConfig(configName);
  }

  @Query(() => [Config])
  async configs(): Promise<Config[]> {
    return this.configService.getConfigs();
  }

  @Mutation(() => Config)
  async updateConfig(
    @Args('configName') configName: string,
    @Args('body') configBody: string
  ): Promise<Config> {
    return this.configService.writeConfig(configName, JSON.parse(configBody));
  }

  @Mutation(() => Service)
  async updateService(
    @Args('id') id: string,
    @Args('service') serviceInput: ServiceInput
  ): Promise<Service> {
    return (await this.configService.saveService(serviceInput, id)).updatedService;
  }

  @Mutation(() => Service)
  async createService(@Args('service') serviceInput: ServiceInput): Promise<Service> {
    return (await this.configService.saveService(serviceInput)).updatedService;
  }

  @Mutation(() => Boolean)
  async deleteService(@Args('ids', { type: () => [String] }) ids: string[]): Promise<boolean> {
    await this.configService.deleteService(...ids);

    return true;
  }

  @ResolveField()
  async services(@Parent() author: Config) {
    return this.configService.getServices();
  }
}
