import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SabnzbdService } from '../sabnzbd/sabnzbd.service';
import { UsenetHistory, UsenetQueue } from './usenet.model';

@Resolver()
export class UsenetResolver {
  constructor(private sabnzbdService: SabnzbdService) {}

  @Query(() => UsenetHistory)
  usenetHistory(
    @Args('serviceId') serviceId: string,
    @Args('limit') limit: number,
    @Args('offset') offset: number
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
    @Args('limit') limit: number,
    @Args('offset') offset: number
  ): Promise<UsenetQueue> {
    return this.sabnzbdService.getQueue({
      serviceId,
      limit,
      offset,
    });
  }

  @Mutation(() => Boolean)
  pauseQueue(@Args('serviceId') serviceId: string) {
    return this.sabnzbdService.pauseQueue(serviceId);
  }

  @Mutation(() => Boolean)
  resumeQueue(@Args('serviceId') serviceId: string) {
    return this.sabnzbdService.resumeQueue(serviceId);
  }
}
