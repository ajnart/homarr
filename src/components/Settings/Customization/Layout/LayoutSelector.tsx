import {
  ActionIcon,
  Checkbox,
  createStyles,
  Divider,
  Flex,
  Group,
  Indicator,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { useConfigContext } from '../../../../config/provider';
import { useConfigStore } from '../../../../config/store';
import { createDummyArray } from '../../../../tools/client/arrays';
import { CustomizationSettingsType } from '../../../../types/settings';
import { Logo } from '../../../layout/Logo';

export const LayoutSelector = () => {
  const { classes } = useStyles();

  const { config, name: configName } = useConfigContext();
  const updateConfig = useConfigStore((x) => x.updateConfig);

  const layoutSettings = config?.settings.customization.layout;

  const [leftSidebar, setLeftSidebar] = useState(layoutSettings?.enabledLeftSidebar ?? true);
  const [rightSidebar, setRightSidebar] = useState(layoutSettings?.enabledRightSidebar ?? true);
  const [docker, setDocker] = useState(layoutSettings?.enabledDocker ?? false);
  const [ping, setPing] = useState(layoutSettings?.enabledPing ?? false);
  const [searchBar, setSearchBar] = useState(layoutSettings?.enabledSearchbar ?? false);
  const { t } = useTranslation('settings/common');

  if (!configName || !config) return null;

  const handleChange = (
    key: keyof CustomizationSettingsType['layout'],
    event: ChangeEvent<HTMLInputElement>,
    setState: Dispatch<SetStateAction<boolean>>
  ) => {
    const value = event.target.checked;
    setState(value);
    updateConfig(
      configName,
      (prev) => {
        const { layout } = prev.settings.customization;

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
      },
      true
    );
  };

  const enabledPing = layoutSettings?.enabledPing ?? false;

  return (
    <>
      <Group position="apart" mb="md">
        <Stack spacing={0}>
          <Title order={6}>{t('layout.preview.title')}</Title>
          <Text color="dimmed" size="xs">
            {t('layout.preview.subtitle')}
          </Text>
        </Stack>
        <Tooltip
          label="This configuration affects what elements will be activated in your layout."
          width={150}
          multiline
        >
          <ActionIcon size={24} variant="default">
            <IconInfoCircle size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
      <Stack spacing="xs">
        <Paper px="xs" py={4} withBorder>
          <Group position="apart">
            <Logo size="xs" />
            <Group spacing={5}>
              {searchBar && <PlaceholderElement width={60} height={10} />}
              {docker && <PlaceholderElement width={10} height={10} />}
            </Group>
          </Group>
        </Paper>

        <Flex gap={6}>
          {leftSidebar && (
            <Paper className={classes.secondaryWrapper} p="xs" withBorder>
              <Flex gap={5} wrap="wrap">
                {createDummyArray(5).map((item, index) => (
                  <PlaceholderElement
                    height={index % 4 === 0 ? 60 + 5 : 30}
                    width={30}
                    key={`example-item-right-sidebard-${index}`}
                    index={index}
                    hasPing={enabledPing}
                  />
                ))}
              </Flex>
            </Paper>
          )}

          <Paper className={classes.primaryWrapper} p="xs" withBorder>
            <Flex gap={5} wrap="wrap">
              {createDummyArray(10).map((item, index) => (
                <PlaceholderElement
                  height={30}
                  width={index % 5 === 0 ? 60 : 30}
                  key={`example-item-main-${index}`}
                  index={index}
                  hasPing={enabledPing}
                />
              ))}
            </Flex>
          </Paper>

          {rightSidebar && (
            <Paper className={classes.secondaryWrapper} p="xs" withBorder>
              <Flex gap={5} align="start" wrap="wrap">
                {createDummyArray(5).map((item, index) => (
                  <PlaceholderElement
                    height={30}
                    width={index % 4 === 0 ? 60 + 5 : 30}
                    key={`example-item-right-sidebard-${index}`}
                    index={index}
                    hasPing={enabledPing}
                  />
                ))}
              </Flex>
            </Paper>
          )}
        </Flex>

        <Divider label="Layout options" labelPosition="center" mt="md" mb="xs" />
        <Stack spacing="xs">
          <Checkbox
            label={t('layout.enablelsidebar')}
            description={t('layout.enablelsidebardesc')}
            checked={leftSidebar}
            onChange={(ev) => handleChange('enabledLeftSidebar', ev, setLeftSidebar)}
          />
          <Checkbox
            label={t('layout.enablersidebar')}
            description={t('layout.enablersidebardesc')}
            checked={rightSidebar}
            onChange={(ev) => handleChange('enabledRightSidebar', ev, setRightSidebar)}
          />
          <Checkbox
            label={t('layout.enablesearchbar')}
            checked={searchBar}
            onChange={(ev) => handleChange('enabledSearchbar', ev, setSearchBar)}
          />
          <Checkbox
            label={t('layout.enabledocker')}
            checked={docker}
            onChange={(ev) => handleChange('enabledDocker', ev, setDocker)}
          />
          <Checkbox
            label={t('layout.enableping')}
            checked={ping}
            onChange={(ev) => handleChange('enabledPing', ev, setPing)}
          />
        </Stack>
      </Stack>
    </>
  );
};

const PlaceholderElement = (props: any) => {
  const { colorScheme, colors } = useMantineTheme();
  const { height, width, hasPing, index } = props;

  const Element = () => (
    <Paper
      style={{
        height,
        backgroundColor: colorScheme === 'dark' ? colors.gray[8] : colors.gray[1],
      }}
      p={2}
      w={width}
    />
  );

  if (hasPing) {
    return (
      <Indicator
        position="bottom-end"
        size={5}
        offset={10}
        color={index % 4 === 0 ? 'red' : 'green'}
      >
        <Element />
      </Indicator>
    );
  }

  return <Element />;
};

const useStyles = createStyles((theme) => ({
  primaryWrapper: {
    flexGrow: 2,
  },
  secondaryWrapper: {
    flexGrow: 1,
    maxWidth: 100,
  },
}));
