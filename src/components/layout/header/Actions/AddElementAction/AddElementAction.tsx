import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconApps } from '@tabler/icons';
import { useTranslation } from 'next-i18next';
import { useColorTheme } from '../../../../../tools/color';

interface AddElementActionProps {
  type: 'action-icon' | 'button';
}

export const AddElementAction = ({ type }: AddElementActionProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  const { primaryColor, secondaryColor } = useColorTheme();

  switch (type) {
    case 'button':
      return (
        <Tooltip label={t('actionIcon.tooltip')} withinPortal withArrow>
          <Button
            variant="white"
            radius="md"
            color={secondaryColor}
            style={{ height: 43 }}
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
          </Button>
        </Tooltip>
      );
    case 'action-icon':
      return (
        <Tooltip label={t('actionIcon.tooltip')} withinPortal withArrow>
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
    default:
      return null;
  }
};
