import { Button, Popover, Tooltip, Text } from '@mantine/core';
import { IconEditCircle, IconEditCircleOff } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

import { useEditModeStore } from '../../../../Dashboard/Views/useEditModeStore';

export const ToggleEditModeAction = () => {
  const { t } = useTranslation('layout/header/actions/toggle-edit-mode');

  const { enabled, toggleEditMode } = useEditModeStore();

  return (
    <Tooltip label={t('tooltip')} withinPortal>
      <Popover opened={enabled} width={250} withArrow>
        <Popover.Target>
          <Button
            onClick={() => toggleEditMode()}
            leftIcon={enabled ? <IconEditCircleOff /> : <IconEditCircle />}
            variant="default"
            radius="md"
            color="blue"
            style={{ height: 'auto', alignSelf: 'stretch' }}
          >
            {enabled ? t('button.enabled') : t('button.disabled')}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Text align="center">
            <Text weight="bold">{t('popover.title')}</Text>
            {t('popover.text')}
          </Text>
        </Popover.Dropdown>
      </Popover>
    </Tooltip>
  );
};
