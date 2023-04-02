import Consola from 'consola';
import { SecurityEvent, SecurityEventType } from './types';
import { prisma } from '../../server/db';

export const addSecurityEvent = async <TType extends SecurityEventType>(
  type: TType,
  data: SecurityEvent<TType>['data'],
  userId: string | null
) => {
  try {
    const event = await prisma?.securityEvent.create({
      data: {
        type,
        data: JSON.stringify(data),
        userId,
      },
    });
    return event?.id;
  } catch (error) {
    Consola.error('Failed to add security event');
    return null;
  }
};
