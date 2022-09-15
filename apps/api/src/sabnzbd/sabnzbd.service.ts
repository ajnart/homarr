import { Injectable, Scope } from '@nestjs/common';
import { Client } from 'sabnzbd-api';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { ConfigService } from '../configs/config.service';

import { ServiceType } from '../configs/models/serviceType.enum';
import { UsenetHistory } from '../usenet/models/usenetHistory.model';
import { UsenetHistoryItem } from '../usenet/models/usenetHistoryItem.model';
import { UsenetQueue } from '../usenet/models/usenetQueu.model';
import { UsenetQueueItem } from '../usenet/models/usenetQueueItem.model';
import { UsenetInfo } from '../usenet/models/usenetInfo.model';

dayjs.extend(duration);

@Injectable({
  scope: Scope.REQUEST,
})
export class SabnzbdService {
  private readonly clients: Record<string, Client> = {};

  constructor(private configService: ConfigService) {}

  async getHistory({
    serviceId,
    offset,
    limit,
  }: {
    serviceId: string;
    offset: number;
    limit: number;
  }): Promise<UsenetHistory> {
    const client = await this.getClient(serviceId);

    const history = await client.history(offset, limit);

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

  async getQueue({
    serviceId,
    offset,
    limit,
  }: {
    serviceId: string;
    offset: number;
    limit: number;
  }): Promise<UsenetQueue> {
    const client = await this.getClient(serviceId);

    const queue = await client.queue(offset, limit);

    const items: UsenetQueueItem[] = queue.slots.map((slot) => {
      const [hours, minutes, seconds] = slot.timeleft.split(':');
      const eta = dayjs.duration({
        hour: parseInt(hours, 10),
        minutes: parseInt(minutes, 10),
        seconds: parseInt(seconds, 10),
      } as any);

      return {
        id: slot.nzo_id,
        eta: eta.asSeconds(),
        name: slot.filename,
        progress: parseFloat(slot.percentage),
        size: parseFloat(slot.mb) * 1000 * 1000,
        state: slot.status.toLowerCase() as any,
      };
    });

    return {
      items,
      total: queue.noofslots,
    };
  }

  async pauseQueue(serviceId: string): Promise<boolean> {
    return (await (await this.getClient(serviceId)).queuePause()).status;
  }

  async resumeQueue(serviceId: string): Promise<boolean> {
    return (await (await this.getClient(serviceId)).queueResume()).status;
  }

  async getInfo(serviceId: string): Promise<UsenetInfo> {
    const queue = await (await this.getClient(serviceId)).queue(0, -1);

    const [hours, minutes, seconds] = queue.timeleft.split(':');
    const eta = dayjs.duration({
      hour: parseInt(hours, 10),
      minutes: parseInt(minutes, 10),
      seconds: parseInt(seconds, 10),
    } as any);

    return {
      paused: queue.paused,
      sizeLeft: parseFloat(queue.mbleft) * 1024 * 1024,
      speed: parseFloat(queue.kbpersec) * 1000,
      eta: eta.asSeconds(),
    };
  }

  private async getClient(serviceId: string) {
    if (!this.clients[serviceId]) {
      const services = await this.configService.getServices(ServiceType.Sabnzbd);

      const service = services.find((s) => s.id === serviceId);

      if (!service) {
        throw new Error(`Service with ID "${serviceId}" could not be found.`);
      }

      if (!service.apiKey) {
        throw new Error(`API Key for service "${service.name}" is missing`);
      }

      const { origin } = new URL(service.url);

      this.clients[serviceId] = new Client(origin, service.apiKey);
    }

    return this.clients[serviceId];
  }
}
