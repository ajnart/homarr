import type { CreateCronJobCreatorOptions } from "./creator";
import { createCronJobCreator } from "./creator";
import { createJobGroupCreator } from "./group";

export const createCronJobFunctions = <TAllowedNames extends string>(
  options: CreateCronJobCreatorOptions<TAllowedNames>,
) => {
  return {
    createCronJob: createCronJobCreator<TAllowedNames>(options),
    createCronJobGroup: createJobGroupCreator<TAllowedNames>({
      logger: options.logger,
    }),
  };
};
