import {
  ActionIcon,
  Title,
  Tooltip,
  Drawer,
  Tabs,
  ScrollArea,
  Indicator,
  Alert,
  Notification,
  Anchor,
} from '@mantine/core';
import { useElementSize, useHotkeys, useViewportSize } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { IconInfoCircle, IconSettings } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import AdvancedSettings from './AdvancedSettings';
import CommonSettings from './CommonSettings';
import Credits from './Credits';
import { CURRENT_VERSION, REPO_URL } from '../../../data/constants';
import Link from 'next/link';
import { NextLink } from '@mantine/next';

function SettingsMenu({ newVersionAvailable }: { newVersionAvailable: string }) {
  const { t } = useTranslation('settings/common');
  const { height, width } = useViewportSize();

  return (
    <Tabs defaultValue="Common">
      <Tabs.List grow>
        <Tabs.Tab value="Common">{t('tabs.common')}</Tabs.Tab>
        <Tabs.Tab value="Customizations">{t('tabs.customizations')}</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel data-autofocus value="Common">
        <ScrollArea style={{ height: height - 100 }} offsetScrollbars>
          {newVersionAvailable && <NewUpdateIndicator newVersionAvailable={newVersionAvailable} />}
          <CommonSettings />
          <Credits />
        </ScrollArea>
      </Tabs.Panel>
      <Tabs.Panel value="Customizations">
        <ScrollArea style={{ height: height - 120 }} offsetScrollbars>
          <AdvancedSettings />
          <Credits />
        </ScrollArea>
      </Tabs.Panel>
    </Tabs>
  );
}

export function SettingsMenuButton(props: any) {
  useHotkeys([['ctrl+L', () => setOpened(!opened)]]);
  const { t } = useTranslation('settings/common');
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

  const [opened, setOpened] = useState(false);

  return (
    <>
      <Drawer
        size="xl"
        padding="lg"
        position="right"
        title={<Title order={5}>{t('title')}</Title>}
        opened={props.opened || opened}
        onClose={() => setOpened(false)}
      >
        <SettingsMenu newVersionAvailable={newVersionAvailable} />
      </Drawer>
      <Tooltip label={t('tooltip')}>
        <Indicator size={15} color="blue" withBorder processing disabled={!newVersionAvailable}>
          <ActionIcon
            variant="default"
            radius="md"
            size="xl"
            color="blue"
            style={props.style}
            onClick={() => setOpened(true)}
          >
            <IconSettings />
          </ActionIcon>
        </Indicator>
      </Tooltip>
    </>
  );
}

function NewUpdateIndicator({ newVersionAvailable }: { newVersionAvailable: string }) {
  return (
    <Notification
      mt={10}
      icon={<IconInfoCircle size={25} />}
      disallowClose
      color="teal"
      radius="md"
      title="New update available"
      hidden={newVersionAvailable === ''}
    >
      Version{' '}
      <b>
        <Anchor
          target="_blank"
          href={`https://github.com/ajnart/homarr/releases/tag/${newVersionAvailable}`}
        >
          {newVersionAvailable}
        </Anchor>
      </b>{' '}
      is available ! Current version: {CURRENT_VERSION}
    </Notification>
  );
}
