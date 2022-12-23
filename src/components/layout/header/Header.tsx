import { Box, createStyles, Group, Header as MantineHeader, Indicator } from '@mantine/core';
import { useEffect, useState } from 'react';
import { CURRENT_VERSION, REPO_URL } from '../../../../data/constants';
import { useConfigContext } from '../../../config/provider';
import { Logo } from '../Logo';
import { useCardStyles } from '../useCardStyles';
import { AddElementAction } from './Actions/AddElementAction/AddElementAction';
import DockerMenuButton from './Actions/Docker/DockerModule';
import { ToggleEditModeAction } from './Actions/ToggleEditMode/ToggleEditMode';
import { Search } from './Search';
import { SettingsMenu } from './SettingsMenu';

export const HeaderHeight = 64;

export function Header(props: any) {
  const { classes } = useStyles();
  const { classes: cardClasses } = useCardStyles();

  const { config } = useConfigContext();

  const [newVersionAvailable, setNewVersionAvailable] = useState<string>('');
  useEffect(() => {
    // Fetch Data here when component first mounted
    fetch(`https://api.github.com/repos/${REPO_URL}/releases/latest`).then((res) => {
      res.json().then((data) => {
        if (data.tag_name > CURRENT_VERSION) {
          setNewVersionAvailable(data.tag_name);
        }
      });
    });
  }, [CURRENT_VERSION]);

  return (
    <MantineHeader height={HeaderHeight} className={cardClasses.card}>
      <Group p="xs" noWrap grow>
        <Box className={classes.hide}>
          <Logo />
        </Box>
        <Group position="right" style={{ maxWidth: 'none' }} noWrap>
          <Search />
          <AddElementAction />
          <ToggleEditModeAction />
          <DockerMenuButton />
          <Indicator size={15} color="blue" withBorder processing disabled={!newVersionAvailable}>
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
