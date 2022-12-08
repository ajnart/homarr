import { ActionIcon, Tooltip } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconApps } from '@tabler/icons';
import { useTranslation } from 'next-i18next';

export const AddElementAction = () => {
  const { t } = useTranslation('layout/add-service-app-shelf');

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
            title: 'Add an element to your dashboard',
            innerProps: {},
          })
        }
      >
        <IconApps />
      </ActionIcon>
    </Tooltip>
  );
};
