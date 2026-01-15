import * as fs from "fs";
import { CoreV1Api, KubeConfig, Metrics, NetworkingV1Api, VersionApi } from "@kubernetes/client-node";

import { env } from "../../env";

export class KubernetesClient {
  private static instance: KubernetesClient | null = null;
  public kubeConfig: KubeConfig;
  public coreApi: CoreV1Api;
  public networkingApi: NetworkingV1Api;
  public metricsApi: Metrics;
  public versionApi: VersionApi;

  private constructor() {
    this.kubeConfig = new KubeConfig();

    if (process.env.NODE_ENV === "development") {
      this.kubeConfig.loadFromDefault();
    } else {
      this.kubeConfig.loadFromCluster();

      const currentCluster = this.kubeConfig.getCurrentCluster();
      if (!currentCluster) throw new Error("No cluster configuration found");

      const token = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/token", "utf8");
      const caData = fs.readFileSync("/var/run/secrets/kubernetes.io/serviceaccount/ca.crt", "utf8");

      const clusterWithCA = {
        ...currentCluster,
        name: `${currentCluster.name}-service-account`,
        caData,
      };

      const serviceAccountUser = {
        name: env.KUBERNETES_SERVICE_ACCOUNT_NAME ?? "default-sa",
        token,
      };

      this.kubeConfig.clusters = [];
      this.kubeConfig.users = [];

      this.kubeConfig.addCluster(clusterWithCA);
      this.kubeConfig.addUser(serviceAccountUser);

      const currentContext = this.kubeConfig.getCurrentContext();
      const originalContext = this.kubeConfig.getContextObject(currentContext);
      if (!originalContext) throw new Error("No context found");

      const updatedContext = {
        ...originalContext,
        name: `${originalContext.name}-service-account`,
        cluster: clusterWithCA.name,
        user: serviceAccountUser.name,
      };

      this.kubeConfig.contexts = [];
      this.kubeConfig.addContext(updatedContext);
      this.kubeConfig.setCurrentContext(updatedContext.name);
    }

    this.coreApi = this.kubeConfig.makeApiClient(CoreV1Api);
    this.networkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
    this.metricsApi = new Metrics(this.kubeConfig);
    this.versionApi = this.kubeConfig.makeApiClient(VersionApi);
  }

  public static getInstance(): KubernetesClient {
    KubernetesClient.instance ??= new KubernetesClient();
    return KubernetesClient.instance;
  }
}
