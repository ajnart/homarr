import { ActionIcon, Tooltip } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconApps } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

export const AddElementAction = () => {
  const { t } = useTranslation('layout/element-selector/selector');

  return (
    <Tooltip withinPortal label={t('actionIcon.tooltip')}>
      <ActionIcon
        variant="default"
        radius="md"
        size="xl"
        color="blue"
        onClick={() =>
          openContextModal({
            modal: 'selectElement',
            title: t('modal.title'),
            size: 'xl',
            innerProps: {},
          })
        }
      >
        <IconApps />
      </ActionIcon>
    </Tooltip>
  );
};
