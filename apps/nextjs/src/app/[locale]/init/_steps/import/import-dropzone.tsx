import { Group, rem, Text } from "@mantine/core";
import type { FileWithPath } from "@mantine/dropzone";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconFileZip, IconUpload, IconX } from "@tabler/icons-react";

import "@mantine/dropzone/styles.css";

import { useScopedI18n } from "@homarr/translation/client";

interface ImportDropZoneProps {
  loading: boolean;
  updateFile: (file: FileWithPath) => void;
}

export const ImportDropZone = ({ loading, updateFile }: ImportDropZoneProps) => {
  const tDropzone = useScopedI18n("init.step.import.dropzone");
  return (
    <Dropzone
      onDrop={(files) => {
        const firstFile = files[0];
        if (!firstFile) return;

        updateFile(firstFile);
      }}
      acceptColor="blue.6"
      rejectColor="red.6"
      accept={[MIME_TYPES.zip, "application/x-zip-compressed"]}
      loading={loading}
      multiple={false}
      maxSize={1024 * 1024 * 1024 * 64} // 64 MB
      onReject={(rejections) => {
        console.error(
          "Rejected files",
          rejections.map(
            (rejection) =>
              `File: ${rejection.file.name} size=${rejection.file.size} fileType=${rejection.file.type}\n - ${rejection.errors.map((error) => error.message).join("\n - ")}`,
          ),
        );
      }}
    >
      <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: "none" }}>
        <Dropzone.Accept>
          <IconUpload style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-blue-6)" }} stroke={1.5} />
        </Dropzone.Accept>
        <Dropzone.Reject>
          <IconX style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-red-6)" }} stroke={1.5} />
        </Dropzone.Reject>
        <Dropzone.Idle>
          <IconFileZip style={{ width: rem(52), height: rem(52), color: "var(--mantine-color-dimmed)" }} stroke={1.5} />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            {tDropzone("title")}
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            {tDropzone("description")}
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
};
