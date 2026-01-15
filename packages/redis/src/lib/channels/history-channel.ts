import { createChannelEventHistory } from "../channel";

export const createIntegrationHistoryChannel = <TData>(integrationId: string, queryKey: string, maxElements = 32) => {
  const channelName = `integration:${integrationId}:history:${queryKey}`;
  return createChannelEventHistory<TData>(channelName, maxElements);
};
