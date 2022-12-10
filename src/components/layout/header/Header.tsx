import { Box, createStyles, Group, Header as MantineHeader, Text } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { useConfigContext } from '../../../config/provider';
import { Logo } from '../Logo';
import { useCardStyles } from '../useCardStyles';
import { AddElementAction } from './Actions/AddElementAction/AddElementAction';
import { ToggleEditModeAction } from './Actions/ToggleEditMode/ToggleEditMode';
import { Search } from './Search';
import { SettingsMenu } from './SettingsMenu';

export const HeaderHeight = 64;

export function Header(props: any) {
  const { classes } = useStyles();
  const { classes: cardClasses } = useCardStyles();

  const { config } = useConfigContext();

  return (
    <MantineHeader height={HeaderHeight} className={cardClasses.card}>
      <Group p="xs" noWrap grow>
        <Box className={classes.hide}>
          <Logo />
        </Box>
        <Group position="right" style={{ maxWidth: 'none' }} noWrap>
          <Text
            onClick={() => {
              openContextModal({
                modal: 'changeTilePosition',
                title: 'Change tile position',
                innerProps: {
                  tile: config?.services[0],
                },
              });
            }}
            variant="link"
          >
            Test
          </Text>

          <Search />
          <AddElementAction />
          <ToggleEditModeAction />
          <SettingsMenu />
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
