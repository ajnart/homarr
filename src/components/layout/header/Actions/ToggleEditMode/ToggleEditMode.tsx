import { ActionIcon, Button, Popover, Text, Tooltip } from '@mantine/core';
import { IconEditCircle, IconEditCircleOff, IconX } from '@tabler/icons';
import { Trans, useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useScreenSmallerThan } from '../../../../../tools/hooks/useScreenSmallerThan';

import { useEditModeStore } from '../../../../Dashboard/Views/useEditModeStore';

export const ToggleEditModeAction = () => {
  const { enabled, toggleEditMode } = useEditModeStore();
  const [popoverManuallyHidden, setPopoverManuallyHidden] = useState<boolean>();

  const { t } = useTranslation('layout/header/actions/toggle-edit-mode');

  const smallerThanSm = useScreenSmallerThan('sm');

  const toggleButtonClicked = () => {
    toggleEditMode();
    setPopoverManuallyHidden(false);
  };

  return (
    <Tooltip label={t('tooltip')} withinPortal>
      <Popover opened={enabled && !smallerThanSm && !popoverManuallyHidden} width={250} withArrow>
        <Popover.Target>
          {smallerThanSm ? (
            <ActionIcon
              onClick={() => toggleButtonClicked()}
              variant="default"
              radius="md"
              size="xl"
              color="blue"
            >
              {enabled ? <IconEditCircleOff /> : <IconEditCircle />}
            </ActionIcon>
          ) : (
            <Button
              onClick={() => toggleButtonClicked()}
              leftIcon={enabled ? <IconEditCircleOff /> : <IconEditCircle />}
              variant="default"
              radius="md"
              color="blue"
              style={{ height: 44 }}
            >
              <Text>{enabled ? t('button.enabled') : t('button.disabled')}</Text>
            </Button>
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
