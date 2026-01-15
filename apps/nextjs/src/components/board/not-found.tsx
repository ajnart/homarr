import { Anchor, AppShellMain, Center, Flex, Group, Image, Text, Title } from "@mantine/core";

import type { TablerIcon } from "@homarr/ui";

import { fullHeightWithoutHeaderAndFooter } from "~/constants";
import { MainHeader } from "../layout/header";
import { HomarrLogoWithTitle } from "../layout/logo/homarr-logo";
import { ClientShell } from "../layout/shell";

export interface BoardNotFoundProps {
  icon: TablerIcon | { src: string; alt: string };
  title: string;
  description: string;
  link: {
    label: string;
    href: string;
  };
  notice: string;
}

export const BoardNotFound = ({ icon: Icon, title, description, link, notice }: BoardNotFoundProps) => {
  return (
    <ClientShell hasNavigation={false}>
      <MainHeader logo={<HomarrLogoWithTitle size="md" />} hasNavigation={false} />
      <AppShellMain>
        <Center h={fullHeightWithoutHeaderAndFooter}>
          <Flex direction="column" align="center" ta="center">
            <Group gap="sm" justify="center">
              {"src" in Icon ? <Image fit="fill" h={48} w={48} src={Icon.src} alt={Icon.alt} /> : <Icon size={32} />}

              <Title>{title}</Title>
            </Group>
            <Text>{description}</Text>
            <Anchor href={link.href}>{link.label}</Anchor>
            <Text c="dimmed">{notice}</Text>
          </Flex>
        </Center>
      </AppShellMain>
    </ClientShell>
  );
};
