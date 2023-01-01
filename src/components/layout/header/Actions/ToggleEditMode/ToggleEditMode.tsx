import axios from 'axios';
import Consola from 'consola';
import { ActionIcon, Button, Group, Popover, Stack, Text, Tooltip } from '@mantine/core';
import { IconEditCircle, IconEditCircleOff, IconX } from '@tabler/icons';
import { getCookie } from 'cookies-next';
import { Trans, useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useConfigContext } from '../../../../../config/provider';
import { useScreenSmallerThan } from '../../../../../hooks/useScreenSmallerThan';

import { useEditModeStore } from '../../../../Dashboard/Views/useEditModeStore';
import { AddElementAction } from '../AddElementAction/AddElementAction';

export const ToggleEditModeAction = () => {
  const { enabled, toggleEditMode } = useEditModeStore();
  const [popoverManuallyHidden, setPopoverManuallyHidden] = useState<boolean>();

  const { t } = useTranslation('layout/header/actions/toggle-edit-mode');

  const smallerThanSm = useScreenSmallerThan('sm');
  const { config } = useConfigContext();

  useEffect(() => {
    if (enabled || config === undefined || config?.schemaVersion === undefined) return;
    const configName = getCookie('config-name')?.toString() ?? 'default';
    axios.put(`/api/configs/${configName}`, { ...config });
    Consola.log('Saved config to server', configName);
  }, [enabled]);

  const toggleButtonClicked = () => {
    toggleEditMode();

    setPopoverManuallyHidden(false);
  };

  const ToggleButtonDesktop = () => (
    <Button
      onClick={() => toggleButtonClicked()}
      leftIcon={enabled ? <IconEditCircleOff /> : <IconEditCircle />}
      variant="default"
      radius="md"
      color="blue"
      style={{ height: 43 }}
    >
      <Text>{enabled ? t('button.enabled') : t('button.disabled')}</Text>
    </Button>
  );

  const ToggleActionIconMobile = () => (
    <ActionIcon
      onClick={() => toggleButtonClicked()}
      variant="default"
      radius="md"
      size="xl"
      color="blue"
    >
      {enabled ? <IconEditCircleOff /> : <IconEditCircle />}
    </ActionIcon>
  );

  return (
    <Tooltip label={t('tooltip')} withinPortal>
      <Popover
        opened={enabled && !smallerThanSm && !popoverManuallyHidden}
        width={250}
        zIndex={199}
        withArrow
      >
        <Popover.Target>
          {smallerThanSm ? (
            enabled ? (
              <Group style={{ flexWrap: 'nowrap' }}>
                <AddElementAction type="action-icon" />
                <ToggleActionIconMobile />
              </Group>
            ) : (
              <ToggleActionIconMobile />
            )
          ) : enabled ? (
            <Button.Group>
              <ToggleButtonDesktop />
              {enabled && <AddElementAction type="button" />}
            </Button.Group>
          ) : (
            <ToggleButtonDesktop />
          )}
        </Popover.Target>

        <Popover.Dropdown p={4} px={6}>
          <div style={{ position: 'absolute', top: 2, right: 2 }}>
            <ActionIcon onClick={() => setPopoverManuallyHidden(true)}>
              <IconX size={18} />
            </ActionIcon>
          </div>
          <Text align="center" size="sm">
            <Text weight="bold">{t('popover.title')}</Text>
            <Text>
              <Trans i18nKey="layout/header/actions/toggle-edit-mode:popover.text" />
            </Text>
          </Text>
        </Popover.Dropdown>
      </Popover>
    </Tooltip>
  );
};
