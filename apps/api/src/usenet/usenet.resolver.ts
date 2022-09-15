import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SabnzbdService } from '../sabnzbd/sabnzbd.service';
import { UsenetHistory } from './models/usenetHistory.model';
import { UsenetInfo } from './models/usenetInfo.model';
import { UsenetQueue } from './models/usenetQueu.model';

@Resolver()
export class UsenetResolver {
  constructor(private sabnzbdService: SabnzbdService) {}

  @Query(() => UsenetHistory)
  usenetHistory(
    @Args('serviceId') serviceId: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number
  ): Promise<UsenetHistory> {
    return this.sabnzbdService.getHistory({
      serviceId,
      limit,
      offset,
    });
  }

  @Query(() => UsenetQueue)
  usenetQueue(
    @Args('serviceId') serviceId: string,
    @Args('limit', { type: () => Int }) limit: number,
    @Args('offset', { type: () => Int }) offset: number
  ): Promise<UsenetQueue> {
    return this.sabnzbdService.getQueue({
      serviceId,
      limit,
      offset,
    });
  }

  @Query(() => UsenetInfo)
  usenetInfo(@Args('serviceId') serviceId: string): Promise<UsenetInfo> {
    return this.sabnzbdService.getInfo(serviceId);
  }

  @Mutation(() => UsenetInfo)
  async pauseUsenetQueue(@Args('serviceId') serviceId: string): Promise<UsenetInfo> {
    await this.sabnzbdService.pauseQueue(serviceId);

    return this.sabnzbdService.getInfo(serviceId);
  }

  @Mutation(() => UsenetInfo)
  async resumeUsenetQueue(@Args('serviceId') serviceId: string): Promise<UsenetInfo> {
    await this.sabnzbdService.resumeQueue(serviceId);

    return this.sabnzbdService.getInfo(serviceId);
  }
}
