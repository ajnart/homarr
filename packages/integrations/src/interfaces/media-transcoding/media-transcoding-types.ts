export interface TdarrQueue {
  array: {
    id: string;
    healthCheck: string;
    transcode: string;
    filePath: string;
    fileSize: number;
    container: string;
    codec: string;
    resolution: string;
    type: "transcode" | "health-check";
  }[];
  totalCount: number;
  startIndex: number;
  endIndex: number;
}

export interface TdarrPieSegment {
  name: string;
  value: number;
}

export interface TdarrStatistics {
  libraryName: string;
  totalFileCount: number;
  totalTranscodeCount: number;
  totalHealthCheckCount: number;
  failedTranscodeCount: number;
  failedHealthCheckCount: number;
  stagedTranscodeCount: number;
  stagedHealthCheckCount: number;
  totalSavedSpace: number;
  transcodeStatus: TdarrPieSegment[];
  healthCheckStatus: TdarrPieSegment[];
  videoCodecs: TdarrPieSegment[];
  videoContainers: TdarrPieSegment[];
  videoResolutions: TdarrPieSegment[];
  audioCodecs: TdarrPieSegment[];
  audioContainers: TdarrPieSegment[];
}

export interface TdarrWorker {
  id: string;
  filePath: string;
  fps: number;
  percentage: number;
  ETA: string;
  jobType: string;
  status: string;
  step: string;
  originalSize: number;
  estimatedSize: number | null;
  outputSize: number | null;
}
