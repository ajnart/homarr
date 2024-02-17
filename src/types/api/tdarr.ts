export type TdarrPieSegment = {
  name: string;
  value: number;
};

export type TdarrStatistics = {
  totalFileCount: number;
  totalTranscodeCount: number;
  totalHealthCheckCount: number;
  failedTranscodeCount: number;
  failedHealthCheckCount: number;
  stagedTranscodeCount: number;
  stagedHealthCheckCount: number;
  pies: {
    libraryName: string;
    libraryId: string;
    totalFiles: number;
    totalTranscodes: number;
    savedSpace: number;
    totalHealthChecks: number;
    transcodeStatus: TdarrPieSegment[];
    healthCheckStatus: TdarrPieSegment[];
    videoCodecs: TdarrPieSegment[];
    videoContainers: TdarrPieSegment[];
    videoResolutions: TdarrPieSegment[];
    audioCodecs: TdarrPieSegment[];
    audioContainers: TdarrPieSegment[];
  }[];
};

export type TdarrWorker = {
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
};

export type TdarrQueue = {
  array: {
    id: string;
    healthCheck: string;
    transcode: string;
    filePath: string;
    fileSize: number;
    container: string;
    codec: string;
    resolution: string;
    type: 'transcode' | 'health check';
  }[];
  totalCount: number;
  startIndex: number;
  endIndex: number;
};