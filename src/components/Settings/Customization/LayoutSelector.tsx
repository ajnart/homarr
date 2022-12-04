import {
  Box,
  Center,
  Checkbox,
  createStyles,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconBrandDocker, IconLayout, IconSearch } from '@tabler/icons';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { useConfigContext } from '../../../config/provider';
import { useConfigStore } from '../../../config/store';
import { CustomizationSettingsType } from '../../../types/settings';
import { Logo } from '../../layout/Logo';

interface LayoutSelectorProps {
  defaultLayout: CustomizationSettingsType['layout'] | undefined;
}

// TODO: add translations
export const LayoutSelector = ({ defaultLayout }: LayoutSelectorProps) => {
  const { classes } = useStyles();

  const { name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const [leftSidebar, setLeftSidebar] = useState(defaultLayout?.enabledLeftSidebar ?? true);
  const [rightSidebar, setRightSidebar] = useState(defaultLayout?.enabledRightSidebar ?? true);
  const [docker, setDocker] = useState(defaultLayout?.enabledDocker ?? false);
  const [ping, setPing] = useState(defaultLayout?.enabledPing ?? false);
  const [searchBar, setSearchBar] = useState(defaultLayout?.enabledSearchbar ?? false);

  if (!configName) return null;

  const handleChange = (
    key: keyof CustomizationSettingsType['layout'],
    event: ChangeEvent<HTMLInputElement>,
    setState: Dispatch<SetStateAction<boolean>>
  ) => {
    const value = event.target.checked;
    setState(value);
    updateConfig(configName, (prev) => {
      const layout = prev.settings.customization.layout;

      layout[key] = value;

      return {
        ...prev,
        settings: {
          ...prev.settings,
          customization: {
            ...prev.settings.customization,
            layout,
          },
        },
      };
    });
  };

  return (
    <Box className={classes.box} p="xl" pb="sm">
      <Stack spacing="xs">
        <Group spacing={5}>
          <IconLayout size={20} />
          <Title order={6}>Dashboard layout</Title>
        </Group>

        <Text color="dimmed" size="sm">
          You can adjust the layout of the Dashboard to your preferences. The main are cannot be
          turned on or off
        </Text>

        <Paper px="xs" py={2} withBorder>
          <Group position="apart">
            <Logo size="xs" />
            <Group spacing={4}>
              {searchBar ? (
                <Paper withBorder p={2} w={60}>
                  <Group spacing={2} align="center">
                    <IconSearch size={8} />
                    <Text size={8} color="dimmed">
                      Search
                    </Text>
                  </Group>
                </Paper>
              ) : null}
              {docker ? <IconBrandDocker size={18} color="#0db7ed" /> : null}
            </Group>
          </Group>
        </Paper>

        <Group align="stretch">
          {leftSidebar && (
            <Paper p="xs" withBorder>
              <Center style={{ height: '100%' }}>
                <Text align="center">Sidebar</Text>
              </Center>
            </Paper>
          )}

          <Paper className={classes.main} p="xs" withBorder>
            <Text align="center">Main</Text>
            <Text color="dimmed" size="xs" align="center">
              Can be used for categories,
              <br />
              services and integrations
            </Text>
          </Paper>

          {rightSidebar && (
            <Paper p="xs" withBorder>
              <Center style={{ height: '100%' }}>
                <Text align="center">Sidebar</Text>
              </Center>
            </Paper>
          )}
        </Group>

        <Stack spacing="xs">
          <Checkbox
            label="Enable left sidebar"
            description="Optional. Can be used for services and integrations only"
            checked={leftSidebar}
            onChange={(ev) => handleChange('enabledLeftSidebar', ev, setLeftSidebar)}
          />
          <Checkbox
            label="Enable right sidebar"
            description="Optional. Can be used for services and integrations only"
            checked={rightSidebar}
            onChange={(ev) => handleChange('enabledRightSidebar', ev, setRightSidebar)}
          />
          <Checkbox
            label="Enable search bar"
            checked={searchBar}
            onChange={(ev) => handleChange('enabledSearchbar', ev, setSearchBar)}
          />
          <Checkbox
            label="Enable docker"
            checked={docker}
            onChange={(ev) => handleChange('enabledDocker', ev, setDocker)}
          />
          <Checkbox
            label="Enable pings"
            checked={ping}
            onChange={(ev) => handleChange('enabledPing', ev, setPing)}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

const useStyles = createStyles((theme) => ({
  main: {
    flexGrow: 1,
  },
  box: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[1],
    borderRadius: theme.radius.md,
  },
}));
