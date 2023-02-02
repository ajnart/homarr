import { Box, createStyles, Group, Header as MantineHeader, Indicator } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { REPO_URL } from '../../../../data/constants';
import DockerMenuButton from '../../../modules/Docker/DockerModule';
import { usePackageAttributesStore } from '../../../tools/client/zustands/usePackageAttributesStore';
import { Logo } from '../Logo';
import { useCardStyles } from '../useCardStyles';
import { ToggleEditModeAction } from './Actions/ToggleEditMode/ToggleEditMode';
import { Search } from './Search';
import { SettingsMenu } from './SettingsMenu';

export const HeaderHeight = 64;

export function Header(props: any) {
  const { classes } = useStyles();
  const { classes: cardClasses } = useCardStyles(false);
  const { attributes } = usePackageAttributesStore();

  const { isLoading, error, data } = useQuery({
    queryKey: ['github/latest'],
    cacheTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 5,
    queryFn: () =>
      fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`).then((res) => res.json()),
  });
  const newVersionAvailable =
    data?.tag_name > `v${attributes.packageVersion}` ? data?.tag_name : undefined;

  return (
    <MantineHeader height="auto" className={cardClasses.card}>
      <Group p="xs" noWrap grow>
        <Box className={classes.hide}>
          <Logo />
        </Box>
        <Group position="right" style={{ maxWidth: 'none' }} noWrap>
          <Search />
          <ToggleEditModeAction />
          <DockerMenuButton />
          <Indicator
            size={15}
            color="blue"
            withBorder
            processing
            disabled={newVersionAvailable === undefined}
          >
            <SettingsMenu newVersionAvailable={newVersionAvailable} />
          </Indicator>
        </Group>
      </Group>
    </MantineHeader>
  );
}

const useStyles = createStyles((theme) => ({
  hide: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
}));
