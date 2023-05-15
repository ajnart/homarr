import { ActionIcon, Button, Tooltip } from '@mantine/core';
import { openContextModal } from '@mantine/modals';
import { IconApps } from '@tabler/icons-react';
import { useTranslation } from 'next-i18next';
import { useCardStyles } from '../../../useCardStyles';

interface AddElementActionProps {
  type: 'action-icon' | 'button';
}

export const AddElementAction = ({ type }: AddElementActionProps) => {
  const { t } = useTranslation('layout/element-selector/selector');
  const { classes } = useCardStyles(true);

  switch (type) {
    case 'button':
      return (
        <Tooltip label={t('actionIcon.tooltip')} withinPortal withArrow>
          <Button
            radius="md"
            variant="default"
            style={{ height: 43 }}
            className={classes.card}
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
