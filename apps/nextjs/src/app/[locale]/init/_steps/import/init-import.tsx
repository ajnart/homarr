"use client";

import { startTransition, useState } from "react";
import { Card, Stack } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { InitialOldmarrImport } from "@homarr/old-import/components";

import { FileInfoCard } from "./file-info-card";
import { ImportDropZone } from "./import-dropzone";

export const InitImport = () => {
  const [file, setFile] = useState<FileWithPath | null>(null);
  const { isPending, mutate } = clientApi.import.analyseInitialOldmarrImport.useMutation();
  const [analyseResult, setAnalyseResult] = useState<RouterOutputs["import"]["analyseInitialOldmarrImport"] | null>(
    null,
  );

  if (!file) {
    return (
      <Card w={64 * 12 + 8} maw="90vw" withBorder>
        <ImportDropZone
          loading={isPending}
          updateFile={(file) => {
            const formData = new FormData();
            formData.append("file", file);

            mutate(formData, {
              onSuccess: (result) => {
                startTransition(() => {
                  setAnalyseResult(result);
                  setFile(file);
                });
              },
              onError: (error) => {
                console.error(error);
              },
            });
          }}
        />
      </Card>
    );
  }

  return (
    <Stack mb="sm">
      <FileInfoCard file={file} onRemove={() => setFile(null)} />
      {analyseResult !== null && <InitialOldmarrImport file={file} analyseResult={analyseResult} />}
    </Stack>
  );
};
