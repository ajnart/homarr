import { api } from '~/utils/api';
import { useConfigContext } from '~/config/provider';
import { TRPCClientErrorLike } from '@trpc/client';

const POLLING_INTERVAL = 10000;

export const useGetTdarrStats = (appId: string): [{
  queued: number | undefined,
  errored: number | undefined,
}, "error" | "success" | "loading", TRPCClientErrorLike<any> | null] => {
  const { name: configName } = useConfigContext();

  const result = api.tdarr.getStatistics.useQuery(
    {
      appId,
      configName: configName!,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    },
  );

  return [{
    queued: result.data?.table1Count,
    errored: result.data?.table3Count,
  }, result.status, result.error];
};

export const useGetTdarrNodes = (appId: string) => {
  const { name: configName } = useConfigContext();

  const result = api.tdarr.getNodes.useQuery(
    {
      appId,
      configName: configName!,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    },
  );

  return result.data;
};

export type TdarrFile = {
  filename: string;
  status: 'Queued' | 'processing' | 'copying' | 'Transcode error' | 'accepted';
  size: number;
};

export const useGetTdarrFiles = (appId: string): [{
  queued: TdarrFile[];
  errored: TdarrFile[];
}, string, TRPCClientErrorLike<any> | null] => {
  const { name: configName } = useConfigContext();

  const result = api.tdarr.getFiles.useQuery(
    {
      appId,
      configName: configName!,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    },
  );

  const files: TdarrFile[] = result.data?.filter((file: any) => file.TranscodeDecisionMaker !== 'Transcode success')
    .map((file: any) => ({
      filename: file.file,
      status: file.TranscodeDecisionMaker,
      size: file.file_size * 1_000_000, // file_size is in MB, convert to bytes
    })) ?? [];

  return [{
    queued: files.filter(file => file.status === 'Queued'),
    errored: files.filter(file => file.status === 'Transcode error'),
  }, result.status, result.error];
};

export const useGetTdarrStagedFiles = (appId: string): [TdarrFile[], string, TRPCClientErrorLike<any> | null] => {
  const { name: configName } = useConfigContext();

  const result = api.tdarr.getStagedFiles.useQuery(
    {
      appId,
      configName: configName!,
    },
    {
      refetchInterval: POLLING_INTERVAL,
      keepPreviousData: true,
      retry: 2,
    },
  );

  const files = result.data?.map((file: any) => ({
    filename: file.originalLibraryFile.file,
    status: file.status, // "processing" | "copying"
    size: file.originalLibraryFile.file_size * 1_000_000, // file_size is in MB, convert to bytes
  })) ?? [];

  return [files, result.status, result.error];
};
