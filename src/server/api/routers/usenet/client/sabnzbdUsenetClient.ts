import { TRPCError } from '@trpc/server';
import dayjs from 'dayjs';
import { Client } from 'sabnzbd-api';
import { getSecret } from '~/server/db/queries/integrations';
import { WidgetIntegration } from '~/server/db/queries/widget';

import {
  UsenetClient,
  UsenetHistory,
  UsenetHistoryItem,
  UsenetInfo,
  UsenetPaginationOptions,
  UsenetQueue,
  UsenetQueueItem,
} from './useNetClient';

export class SabnzbdUsenetClient implements UsenetClient {
  private client: Client;

  constructor(integration: WidgetIntegration) {
    const apiKey = getSecret(integration, 'apiKey');
    if (!apiKey) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Invalid sabnzbd client options',
      });
    }
    const { origin } = new URL(integration.url);

    this.client = new Client(origin, apiKey);
  }
  async info(): Promise<UsenetInfo> {
    const queue = await this.client.queue(0, -1);
    const [hours, minutes, seconds] = queue.timeleft.split(':');
    const eta = dayjs.duration({
      hours: parseInt(hours, 10),
      minutes: parseInt(minutes, 10),
      seconds: parseInt(seconds, 10),
    });

    return {
      paused: queue.paused,
      sizeLeft: parseFloat(queue.mbleft) * 1024 * 1024,
      speed: parseFloat(queue.kbpersec) * 1000,
      eta: eta.asSeconds(),
    };
  }
  async history(options: UsenetPaginationOptions): Promise<UsenetHistory> {
    const history = await this.client.history(options.offset, options.limit);
    const items: UsenetHistoryItem[] = history.slots.map((slot) => ({
      id: slot.nzo_id,
      name: slot.name,
      size: slot.bytes,
      time: slot.download_time,
    }));

    return {
      items,
      total: history.noofslots,
    };
  }
  async queue(options: UsenetPaginationOptions): Promise<UsenetQueue> {
    const queue = await this.client.queue(options.offset, options.limit);

    const items: UsenetQueueItem[] = queue.slots.map((slot) => {
      const [hours, minutes, seconds] = slot.timeleft.split(':');
      const eta = dayjs.duration({
        hours: parseInt(hours, 10),
        minutes: parseInt(minutes, 10),
        seconds: parseInt(seconds, 10),
      });

      return {
        id: slot.nzo_id,
        eta: eta.asSeconds(),
        name: slot.filename,
        progress: parseFloat(slot.percentage),
        size: parseFloat(slot.mb) * 1000 * 1000,
        state: typesafeLowercase(slot.status),
      };
    });

    return {
      items,
      total: queue.noofslots,
    };
  }
  async pause(): Promise<void> {
    await this.client.queuePause();
  }
  async resume(): Promise<void> {
    await this.client.queueResume();
  }
}

const typesafeLowercase = <TInput extends string>(input: TInput) =>
  input.toLowerCase() as Lowercase<TInput>;
