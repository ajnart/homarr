import { User } from '@prisma/client';

type SecurityEventBase = {
  id: string;
  user: Pick<User, 'id' | 'username'> | null;
  timestamp: Date;
};

type NoData = Record<string, never>;

type SecurityEvents = {
  login: NoData;
  'login-failed': { fallbackUsername?: string; reason?: string }; // fallbackUsername is used when the user is not found
  logout: NoData;
  register: { inviteName: string };
  invite: { name: string };
  'invite-deleted': { name: string };
  'permission-changed': { name: string; oldValue: string; newValue: string };
  'user-archived': { username: string };
};

export type SecurityEventType = keyof SecurityEvents;

export type SecurityEvent<TType extends keyof SecurityEvents> = SecurityEventBase & {
  type: TType;
  data: SecurityEvents[TType];
};

export type AnySecurityEvent = SecurityEventBase & {
  type: SecurityEventType;
  data: SecurityEvents[SecurityEventType];
};
