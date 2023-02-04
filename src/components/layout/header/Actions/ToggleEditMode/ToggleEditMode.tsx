import axios from 'axios';
import Consola from 'consola';
import { ActionIcon, Button, Group, Text, Title, Tooltip } from '@mantine/core';
import { IconEditCircle, IconEditCircleOff } from '@tabler/icons';
import { getCookie } from 'cookies-next';
import { Trans, useTranslation } from 'next-i18next';
import { useHotkeys } from '@mantine/hooks';
import { hideNotification, showNotification } from '@mantine/notifications';
import { useConfigContext } from '../../../../../config/provider';
import { useScreenSmallerThan } from '../../../../../hooks/useScreenSmallerThan';

import { useEditModeStore } from '../../../../Dashboard/Views/useEditModeStore';
import { AddElementAction } from '../AddElementAction/AddElementAction';
import { useNamedWrapperColumnCount } from '../../../../Dashboard/Wrappers/gridstack/store';
import { useCardStyles } from '../../../useCardStyles';

export const ToggleEditModeAction = () => {
  const { enabled, toggleEditMode } = useEditModeStore();
  const namedWrapperColumnCount = useNamedWrapperColumnCount();
  const { t } = useTranslation('layout/header/actions/toggle-edit-mode');
  const translatedSize =
    namedWrapperColumnCount !== null ? t(`screenSizes.${namedWrapperColumnCount}`) : 'loading...';

  const smallerThanSm = useScreenSmallerThan('sm');
  const { config } = useConfigContext();
  const { classes } = useCardStyles(true);

  useHotkeys([['ctrl+E', toggleEditMode]]);

  const toggleButtonClicked = () => {
    toggleEditMode();
    if (enabled || config === undefined || config?.schemaVersion === undefined) {
      const configName = getCookie('config-name')?.toString() ?? 'default';
      axios.put(`/api/configs/${configName}`, { ...config });
      Consola.log('Saved config to server', configName);
      hideNotification('toggle-edit-mode');
    } else if (!enabled) {
      showNotification({
        styles: (theme) => ({
          root: {
            backgroundColor: theme.colors.orange[7],
            borderColor: theme.colors.orange[7],

            '&::before': { backgroundColor: theme.white },
          },
          title: { color: theme.white },
          description: { color: theme.white },
          closeButton: {
            color: theme.white,
            '&:hover': { backgroundColor: theme.colors.orange[7] },
          },
        }),
        radius: 'md',
        id: 'toggle-edit-mode',
        autoClose: 10000,
        title: (
          <Title order={4}>
            <Trans
              i18nKey="layout/header/actions/toggle-edit-mode:popover.title"
              values={{ size: translatedSize }}
              components={{
                1: (
                  <Text
                    component="a"
                    style={{ color: 'inherit', textDecoration: 'underline' }}
                    href="https://homarr.dev/docs/customizations/layout"
                    target="_blank"
                  />
                ),
              }}
            />
          </Title>
        ),
        message: <Trans i18nKey="layout/header/actions/toggle-edit-mode:popover.text" />,
      });
    } else {
      hideNotification('toggle-edit-mode');
    }
  };

  const ToggleButtonDesktop = () => (
    <Tooltip label={enabled ? t('button.enabled') : t('button.disabled')}>
      <Button
        className={classes.card}
        onClick={() => toggleButtonClicked()}
        radius="md"
        variant="default"
        style={{ height: 43 }}
      >
        {enabled ? <IconEditCircleOff /> : <IconEditCircle />}
      </Button>
    </Tooltip>
  );

  const ToggleActionIconMobile = () => (
    <ActionIcon
      className={classes.card}
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
    <>
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
    </>
  );
};
