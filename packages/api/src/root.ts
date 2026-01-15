import { apiKeysRouter } from "./router/apiKeys";
import { appRouter as innerAppRouter } from "./router/app";
import { boardRouter } from "./router/board";
import { certificateRouter } from "./router/certificates/certificate-router";
import { cronJobsRouter } from "./router/cron-jobs";
import { dockerRouter } from "./router/docker/docker-router";
import { groupRouter } from "./router/group";
import { homeRouter } from "./router/home";
import { iconsRouter } from "./router/icons";
import { importRouter } from "./router/import/import-router";
import { infoRouter } from "./router/info";
import { integrationRouter } from "./router/integration/integration-router";
import { inviteRouter } from "./router/invite";
import { kubernetesRouter } from "./router/kubernetes/router/kubernetes-router";
import { locationRouter } from "./router/location";
import { logRouter } from "./router/log";
import { mediaRouter } from "./router/medias/media-router";
import { onboardRouter } from "./router/onboard/onboard-router";
import { searchEngineRouter } from "./router/search-engine/search-engine-router";
import { sectionRouter } from "./router/section/section-router";
import { serverSettingsRouter } from "./router/serverSettings";
import { updateCheckerRouter } from "./router/update-checker";
import { userRouter } from "./router/user";
import { widgetRouter } from "./router/widgets";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  user: userRouter,
  group: groupRouter,
  invite: inviteRouter,
  integration: integrationRouter,
  board: boardRouter,
  section: sectionRouter,
  app: innerAppRouter,
  searchEngine: searchEngineRouter,
  widget: widgetRouter,
  location: locationRouter,
  log: logRouter,
  icon: iconsRouter,
  import: importRouter,
  onboard: onboardRouter,
  home: homeRouter,
  docker: dockerRouter,
  kubernetes: kubernetesRouter,
  serverSettings: serverSettingsRouter,
  cronJobs: cronJobsRouter,
  apiKeys: apiKeysRouter,
  media: mediaRouter,
  updateChecker: updateCheckerRouter,
  certificates: certificateRouter,
  info: infoRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
