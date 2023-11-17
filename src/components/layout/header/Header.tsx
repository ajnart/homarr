import {
  Box,
  Center,
  Flex,
  Group,
  Header,
  Text,
  Title,
  UnstyledButton,
  useMantineTheme
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';

import { Logo } from '../Common/Logo';
import { AvatarMenu } from './AvatarMenu';
import { Search } from './Search';

type MainHeaderProps = {
  logoHref?: string;
  showExperimental?: boolean;
  headerActions?: React.ReactNode;
  contentComponents?: React.ReactNode;
  leftSection?: React.ReactNode;
  autoFocusSearch?: boolean;
};

export const MainHeader = ({
  showExperimental = false,
  logoHref = '/',
  headerActions,
  leftSection,
  contentComponents,
  autoFocusSearch,
}: MainHeaderProps) => {
  const { breakpoints } = useMantineTheme();
  const isSmallerThanMd = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const experimentalHeaderNoteHeight = isSmallerThanMd ? 60 : 30;
  const headerBaseHeight = isSmallerThanMd ? 60 + 46 : 60;
  const headerHeight = showExperimental
    ? headerBaseHeight + experimentalHeaderNoteHeight
    : headerBaseHeight;

  return (
    <Header height={headerHeight} pb="sm" pt={0}>
      <Group gap="xl" mt="xs" px="md" justify="apart" wrap="nowrap">
        <Group wrap="nowrap" style={{ flex: 1 }}>
          {leftSection}
          <UnstyledButton component="a" href={logoHref}>
            <Logo />
          </UnstyledButton>
        </Group>

        {!isSmallerThanMd && <Search autoFocus={autoFocusSearch} />}

        <Group wrap="nowrap" style={{ flex: 1 }} justify="right">
          <Group wrap="nowrap" gap={8}>
            {contentComponents}
            {headerActions}
          </Group>
          <AvatarMenu />
        </Group>
      </Group>

      {isSmallerThanMd && (
        <Center mt="xs" px="md">
          <Search isMobile />
        </Center>
      )}
    </Header>
  );
};

type ExperimentalHeaderNoteProps = {
  height?: 30 | 60;
  visible?: boolean;
};
const ExperimentalHeaderNote = ({ visible = false, height = 30 }: ExperimentalHeaderNoteProps) => {
  const { t } = useTranslation('layout/header');
  if (!visible) return null;

  return (
    <Box bg="red" h={height} p={3} px={6} style={{ overflow: 'hidden' }}>
      <Flex h="100%" align="center" columnGap={7}>
        <IconAlertTriangle color="white" size="1rem" style={{ minWidth: '1rem' }} />
        <Text c="white" lineClamp={height === 30 ? 1 : 2}>
          <Title>Make an announcement here</Title>
        </Text>
      </Flex>
    </Box>
  );
};
