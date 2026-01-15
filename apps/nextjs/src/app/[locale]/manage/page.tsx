import type { Metadata } from "next";
import { Card, Group, SimpleGrid, Space, Stack, Text } from "@mantine/core";
import { IconArrowRight } from "@tabler/icons-react";

import { api } from "@homarr/api/server";
import { getScopedI18n } from "@homarr/translation/server";
import { Link } from "@homarr/ui";

import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { createMetaTitle } from "~/metadata";
import { HeroBanner } from "./_components/hero-banner";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getScopedI18n("management");

  return {
    title: createMetaTitle(t("metaTitle")),
  };
}

export default async function ManagementPage() {
  const statistics = await api.home.getStats();
  const t = await getScopedI18n("management.page.home");

  return (
    <>
      <DynamicBreadcrumb />
      <HeroBanner />
      <Space h="md" />
      <SimpleGrid cols={{ xs: 1, sm: 2, md: 3 }}>
        {statistics.map((statistic) => (
          <Card component={Link} href={statistic.path} key={statistic.path} radius="lg">
            <Group justify="space-between" wrap="nowrap">
              <Group wrap="nowrap">
                <Text size="2.4rem" fw="bolder">
                  {statistic.count}
                </Text>
                <Stack gap={0}>
                  <Text c="red" size="xs">
                    {t(`statisticLabel.${statistic.subtitleKey}`)}
                  </Text>
                  <Text fw="bold">{t(`statistic.${statistic.titleKey}`)}</Text>
                </Stack>
              </Group>
              <IconArrowRight />
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
