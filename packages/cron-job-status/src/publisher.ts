import { createCronJobStatusChannel } from ".";

export const beforeCallbackAsync = async (name: string) => {
  const channel = createCronJobStatusChannel(name);

  const previous = await channel.getLastDataAsync();

  await channel.publishAsync({
    name,
    lastExecutionStatus: previous?.lastExecutionStatus ?? null,
    lastExecutionTimestamp: new Date().toISOString(),
    status: "running",
  });
};

export const onCallbackSuccessAsync = async (name: string) => {
  const channel = createCronJobStatusChannel(name);

  const previous = await channel.getLastDataAsync();
  await channel.publishAsync({
    name,
    lastExecutionStatus: "success",
    lastExecutionTimestamp: previous?.lastExecutionTimestamp ?? new Date().toISOString(),
    status: "idle",
  });
};

export const onCallbackErrorAsync = async (name: string, _error: unknown) => {
  const channel = createCronJobStatusChannel(name);

  const previous = await channel.getLastDataAsync();
  await channel.publishAsync({
    name,
    lastExecutionStatus: "error",
    lastExecutionTimestamp: previous?.lastExecutionTimestamp ?? new Date().toISOString(),
    status: "idle",
  });
};
