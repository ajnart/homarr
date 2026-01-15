import { createTRPCRouter } from "../../../trpc";
import { clusterRouter } from "./cluster";
import { configMapsRouter } from "./configMaps";
import { ingressesRouter } from "./ingresses";
import { namespacesRouter } from "./namespaces";
import { nodesRouter } from "./nodes";
import { podsRouter } from "./pods";
import { secretsRouter } from "./secrets";
import { servicesRouter } from "./services";
import { volumesRouter } from "./volumes";

export const kubernetesRouter = createTRPCRouter({
  nodes: nodesRouter,
  cluster: clusterRouter,
  namespaces: namespacesRouter,
  ingresses: ingressesRouter,
  services: servicesRouter,
  pods: podsRouter,
  secrets: secretsRouter,
  configMaps: configMapsRouter,
  volumes: volumesRouter,
});
