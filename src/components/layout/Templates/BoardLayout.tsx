import { Button, Global, Text, Title, Tooltip, clsx } from '@mantine/core';
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
import { useRouter } from 'next/router';
import { env } from 'process';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { useNamedWrapperColumnCount } from '~/components/Dashboard/Wrappers/gridstack/store';
import { BoardHeadOverride } from '~/components/layout/Meta/BoardHeadOverride';
import { HeaderActionButton } from '~/components/layout/header/ActionButton';
import { useConfigContext } from '~/config/provider';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';
import { api } from '~/utils/api';

import { MainLayout } from './MainLayout';

type BoardLayoutProps = {
  dockerEnabled: boolean;
  children: React.ReactNode;
};

export const BoardLayout = ({ children, dockerEnabled }: BoardLayoutProps) => {
  const { config } = useConfigContext();
  const { data: session } = useSession();

  return (
    <MainLayout
      autoFocusSearch={session?.user.autoFocusSearch}
      headerActions={<HeaderActions dockerEnabled={dockerEnabled} />}
    >
      <BoardHeadOverride />
      <BackgroundImage />
      {children}
      <style>{clsx(config?.settings.customization.customCss)}</style>
    </MainLayout>
  );
};

type HeaderActionProps = {
  dockerEnabled: boolean;
};

export const HeaderActions = ({ dockerEnabled }: HeaderActionProps) => {
  const { data: sessionData } = useSession();

  if (!sessionData?.user?.isAdmin) return null;

  return (
    <>
      {dockerEnabled && <DockerButton />}
      <ToggleEditModeButton />
      <CustomizeBoardButton />
    </>
  );
};

const DockerButton = () => {
  const { t } = useTranslation('modules/docker');

  return (
    <Tooltip label={t('actionIcon.tooltip')}>
      <HeaderActionButton component={Link} href="/manage/tools/docker">
        <IconBrandDocker size={20} stroke={1.5} />
      </HeaderActionButton>
    </Tooltip>
  );
};

const CustomizeBoardButton = () => {
  const { name } = useConfigContext();
  const { t } = useTranslation('boards/common');
  const href = useBoardLink(`/board/${name}/customize`);

  return (
    <Tooltip label={t('header.customize')}>
      <HeaderActionButton component={Link} href={href}>
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
    if (enabled && env.NODE_ENV === 'production') {
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
        <Tooltip label={t('button.enabled')}>
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

const BackgroundImage = () => {
  const { config } = useConfigContext();

  if (!config?.settings.customization.backgroundImageUrl) {
    return null;
  }

  return (
    <Global
      styles={{
        '.mantine-AppShell-root': {
          minHeight: '100vh',
          backgroundImage: `url('${config?.settings.customization.backgroundImageUrl}')`,
          backgroundPosition: 'center center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        },
      }}
    />
  );
};

export const useBoardLink = (
  link: '/board' | `/board/${string}/customize` | `/board/${string}`
) => {
  const router = useRouter();

  return router.asPath.startsWith('/board') ? link : link.replace('/board', '/b');
};
