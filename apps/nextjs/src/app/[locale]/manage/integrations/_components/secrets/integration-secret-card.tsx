"use client";

import { useState } from "react";
import { ActionIcon, Avatar, Badge, Button, Card, Collapse, Group, Kbd, Stack, Text, Tooltip } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import type { RouterOutputs } from "@homarr/api";
import type { IntegrationSecretKind } from "@homarr/definitions";
import { integrationSecretKindObject } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";

import { integrationSecretIcons } from "./integration-secret-icons";

dayjs.extend(relativeTime);

interface SecretCardProps {
  secret:
    | RouterOutputs["integration"]["byId"]["secrets"][number]
    | { kind: IntegrationSecretKind; value: null; updatedAt: null };
  children: React.ReactNode;
  onCancel: () => Promise<boolean>;
}

export const SecretCard = ({ secret, children, onCancel }: SecretCardProps) => {
  const t = useI18n();
  const { isPublic } = integrationSecretKindObject[secret.kind];
  const [publicSecretDisplayOpened, { toggle: togglePublicSecretDisplay }] = useDisclosure(false);
  const [editMode, setEditMode] = useState(false);
  const DisplayIcon = publicSecretDisplayOpened ? IconEye : IconEyeOff;
  const KindIcon = integrationSecretIcons[secret.kind];

  return (
    <Card withBorder>
      <Stack>
        <Group justify="space-between">
          <Group>
            <Avatar>
              <KindIcon size={16} />
            </Avatar>
            <Text fw={500}>{t(`integration.secrets.kind.${secret.kind}.label`)}</Text>
            {publicSecretDisplayOpened ? <Kbd>{secret.value}</Kbd> : null}
          </Group>
          <Group>
            {secret.updatedAt ? (
              <Text c="gray.6" size="sm">
                {t("integration.secrets.lastUpdated", {
                  date: dayjs().to(dayjs(secret.updatedAt)),
                })}
              </Text>
            ) : (
              <Tooltip label={t("integration.secrets.notSet.tooltip")} position="left">
                <Badge color="orange" variant="light" size="sm">
                  {t("integration.secrets.notSet.label")}
                </Badge>
              </Tooltip>
            )}
            {isPublic ? (
              <ActionIcon color="gray" variant="subtle" onClick={togglePublicSecretDisplay}>
                <DisplayIcon size={16} stroke={1.5} />
              </ActionIcon>
            ) : null}
            <Button
              variant="default"
              onClick={async () => {
                if (!editMode) {
                  setEditMode(true);
                  return;
                }

                const shouldCancel = await onCancel();
                if (!shouldCancel) return;
                setEditMode(false);
              }}
            >
              {editMode ? t("common.action.cancel") : t("common.action.edit")}
            </Button>
          </Group>
        </Group>
        <Collapse in={editMode}>{children}</Collapse>
      </Stack>
    </Card>
  );
};
