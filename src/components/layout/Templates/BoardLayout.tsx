import { Button, Text, Title, Tooltip, clsx } from '@mantine/core';
import { useHotkeys, useWindowEvent } from '@mantine/hooks';
import { openContextModal } from '@mantine/modals';
import { hideNotification, showNotification } from '@mantine/notifications';
import {
  IconApps,
  IconBrandDocker,
  IconEditCircle,
  IconEditCircleOff,
  IconSettings,
} from '@tabler/icons-react';
import Consola from 'consola';
import { useSession } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { useNamedWrapperColumnCount } from '~/components/Dashboard/Wrappers/gridstack/store';
import { useConfigContext } from '~/config/provider';
import { env } from '~/env';
import { api } from '~/utils/api';

import { Background } from '../Background';
import { HeaderActionButton } from '../Header/ActionButton';
import { MainLayout } from './MainLayout';

type BoardLayoutProps = {
  children: React.ReactNode;
};

export const BoardLayout = ({ children }: BoardLayoutProps) => {
  const { config } = useConfigContext();

  return (
    <MainLayout headerActions={<HeaderActions />}>
      <Background />
      {children}
      <style>{clsx(config?.settings.customization.customCss)}</style>
    </MainLayout>
  );
};

export const HeaderActions = () => {
  const { data: sessionData } = useSession();

  if (!sessionData?.user?.isAdmin) return null;

  return (
    <>
      {env.NEXT_PUBLIC_DOCKER_ENABLED && <DockerButton />}
      <ToggleEditModeButton />
      <CustomizeBoardButton />
    </>
  );
};

const DockerButton = () => {
  const { t } = useTranslation('modules/docker');

  return (
    <Tooltip label={t('actionIcon.tooltip')}>
      <HeaderActionButton component={Link} href="/docker">
        <IconBrandDocker size={20} stroke={1.5} />
      </HeaderActionButton>
    </Tooltip>
  );
};

const CustomizeBoardButton = () => {
  const { name } = useConfigContext();
  console.log('name', name);

  return (
    <Tooltip label="Customize board">
      <HeaderActionButton component={Link} href={`/board/${name}/customize`}>
        <IconSettings size={20} stroke={1.5} />
      </HeaderActionButton>
    </Tooltip>
  );
};

const beforeUnloadEventText = 'Exit the edit mode to save your changes';
const editModeNotificationId = 'toggle-edit-mode';

const ToggleEditModeButton = () => {
  const { enabled, toggleEditMode } = useEditModeStore();
  const { config, name: configName } = useConfigContext();
  const { mutateAsync: saveConfig } = api.config.save.useMutation();
  const namedWrapperColumnCount = useNamedWrapperColumnCount();
  const { t } = useTranslation(['layout/header/actions/toggle-edit-mode', 'common']);
  const translatedSize =
    namedWrapperColumnCount !== null
      ? t(`common:breakPoints.${namedWrapperColumnCount}`)
      : t('common:loading');

  useHotkeys([['mod+E', toggleEditMode]]);

  useWindowEvent('beforeunload', (event: BeforeUnloadEvent) => {
    if (enabled) {
      // eslint-disable-next-line no-param-reassign
      event.returnValue = beforeUnloadEventText;
      return beforeUnloadEventText;
    }

    return undefined;
  });

  const save = async () => {
    toggleEditMode();
    if (!config || !configName) return;
    await saveConfig({ name: configName, config });
    Consola.log('Saved config to server', configName);
    hideNotification(editModeNotificationId);
  };

  const enableEditMode = () => {
    toggleEditMode();
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
  };

  if (enabled) {
    return (
      <Button.Group>
        <Tooltip label={t('button.disabled')}>
          <HeaderActionButton onClick={save}>
            <IconEditCircleOff size={20} stroke={1.5} />
          </HeaderActionButton>
        </Tooltip>
        <AddElementButton />
      </Button.Group>
    );
  }
  return (
    <Tooltip label={t('button.disabled')}>
      <HeaderActionButton onClick={enableEditMode}>
        <IconEditCircle size={20} stroke={1.5} />
      </HeaderActionButton>
    </Tooltip>
  );
};

const AddElementButton = () => {
  const { t } = useTranslation('layout/element-selector/selector');

  return (
    <Tooltip label={t('actionIcon.tooltip')}>
      <HeaderActionButton
        onClick={() =>
          openContextModal({
            modal: 'selectElement',
            title: t('modal.title'),
            size: 'xl',
            innerProps: {},
          })
        }
      >
        <IconApps size={20} stroke={1.5} />
      </HeaderActionButton>
    </Tooltip>
  );
};
