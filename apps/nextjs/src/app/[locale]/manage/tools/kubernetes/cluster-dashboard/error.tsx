"use client";

import { Anchor, Center, Stack, Text } from "@mantine/core";
import { IconCubeOff } from "@tabler/icons-react";

import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

export default function KubernetesErrorPage() {
  const t = useI18n();

  return (
    <Center>
      <Stack align="center">
        <IconCubeOff size={48} stroke={1.5} />
        <Stack align="center" gap="xs">
          <Text size="lg" fw={500}>
            {t("kubernetes.error.internalServerError")}
          </Text>
          <Anchor size="sm" component={Link} href="/manage/tools/logs">
            {t("common.action.checkLogs")}
          </Anchor>
        </Stack>
      </Stack>
    </Center>
  );
}
