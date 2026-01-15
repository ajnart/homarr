import React from "react";
import Image from "next/image";
import { Card, Group, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import type { KubernetesLabelResourceType } from "@homarr/definitions";
import { useI18n } from "@homarr/translation/client";
import { Link } from "@homarr/ui";

import classes from "./resource-tile.module.css";

interface ResourceTileProps {
  count: number;
  label: KubernetesLabelResourceType;
}

export function ResourceTile(props: ResourceTileProps) {
  const t = useI18n();
  return (
    <Card
      withBorder
      component={Link}
      href={`/manage/tools/kubernetes/${props.label}`}
      className={classes.cardContainer}
    >
      <Group justify="space-between" wrap="nowrap">
        <Image src={`/images/kubernetes/${props.label}.svg`} alt={props.label} width={64} height={64} />
        <Group gap="xs">
          <Text size="xl" fw={700} tt="capitalize">
            {props.count} {t(`kubernetes.cluster.resources.${props.label}`)}
          </Text>
          <IconArrowRight />
        </Group>
      </Group>
    </Card>
  );
}
