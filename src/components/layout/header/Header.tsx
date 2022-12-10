import { ActionIcon, Box, createStyles, Group, Header as MantineHeader } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconCode } from '@tabler/icons';
import { useConfigContext } from '../../../config/provider';
import { Logo } from '../Logo';
import { useCardStyles } from '../useCardStyles';
import { AddElementAction } from './Actions/AddElementAction/AddElementAction';
import { ToolsMenu } from './Actions/RunToolAction/ToolsMenu';
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
        <Group position="right" noWrap>
          <Search />
          <AddElementAction />
          <ToolsMenu />

          <ActionIcon
            onClick={() => {
              openContextModal({
                modal: 'changeTilePosition',
                title: 'Change tile position',
                innerProps: {
                  tile: config?.services[0],
                },
              });
            }}
            variant="default"
            radius="md"
            size="xl"
            color="blue"
          >
            <IconCode />
          </ActionIcon>

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
