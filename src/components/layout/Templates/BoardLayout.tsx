import { Button, Global, Modal, Stack, Text, Title, Tooltip, clsx } from '@mantine/core';
import { useDisclosure, useHotkeys, useWindowEvent } from '@mantine/hooks';
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
import { ContainerInfo } from 'dockerode';
import { useSession } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { env } from 'process';
import { useState } from 'react';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { useNamedWrapperColumnCount } from '~/components/Dashboard/Wrappers/gridstack/store';
import ContainerActionBar from '~/components/Manage/Tools/Docker/ContainerActionBar';
import ContainerTable from '~/components/Manage/Tools/Docker/ContainerTable';
import { BoardHeadOverride } from '~/components/layout/Meta/BoardHeadOverride';
import { HeaderActionButton } from '~/components/layout/header/ActionButton';
import { useConfigContext } from '~/config/provider';
import { api } from '~/utils/api';

import { MainLayout } from './MainLayout';

type BoardLayoutProps = {
  children: React.ReactNode;
  isDockerEnabled?: boolean;
};

export const BoardLayout = ({ children, isDockerEnabled = false }: BoardLayoutProps) => {
  const { config } = useConfigContext();
  const { data: session } = useSession();

  return (
    <MainLayout autoFocusSearch={session?.user.autoFocusSearch} headerActions={<HeaderActions isDockerEnabled={isDockerEnabled} />}>
      <BoardHeadOverride />
      <BackgroundImage />
      {children}
      <style>{clsx(config?.settings.customization.customCss)}</style>
    </MainLayout>
  );
};

export const HeaderActions = ({isDockerEnabled = false} : { isDockerEnabled: boolean}) => {
  const { data: sessionData } = useSession();

  if (!sessionData?.user?.isAdmin) return null;

  return (
    <>
      <ToggleEditModeButton />
      {isDockerEnabled && <DockerButton />}
      <CustomizeBoardButton />
    </>
  );
};

const DockerButton = () => {
  const [selection, setSelection] = useState<(ContainerInfo & { icon?: string })[]>([]);
  const [opened, { open, close, toggle }] = useDisclosure(false);
  useHotkeys([['mod+B', toggle]]);

  const { data, refetch, isRefetching } = api.docker.containers.useQuery(undefined, {
    cacheTime: 60 * 1000 * 5,
    staleTime: 60 * 1000 * 1,
  });
  const { t } = useTranslation('tools/docker');
  const reload = () => {
    refetch();
    setSelection([]);
  };

  return (
    <>
      <Tooltip label={t('title')}>
        <HeaderActionButton onClick={open}>
          <IconBrandDocker size={20} stroke={1.5} />
        </HeaderActionButton>
      </Tooltip>
      <Modal
        title={t('title')}
        withCloseButton={true}
        closeOnClickOutside={true}
        size="full"
        opened={opened}
        onClose={close}
      >
        <Stack>
          <ContainerActionBar selected={selection} reload={reload} isLoading={isRefetching} />
          <ContainerTable
            containers={data ?? []}
            selection={selection}
            setSelection={setSelection}
          />
        </Stack>
      </Modal>
    </>
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
                  href="https://homarr.dev/docs/advanced/customizations/board-customization#screen-sizes"
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

  // Check if the background image URL is a video
  const videoFormat = getVideoFormat(config?.settings.customization.backgroundImageUrl);
  if (videoFormat) {
    return <BackgroundVideo videoSource={config?.settings.customization.backgroundImageUrl} videoFormat={videoFormat} />;
  }

  return (
    <Global
      styles={{
        '.mantine-AppShell-root': {
          minHeight: '100vh',
          backgroundImage: `url('${config?.settings.customization.backgroundImageUrl}')`,
          backgroundPosition: 'center center',
          backgroundSize: config?.settings.customization.backgroundImageSize ?? 'cover',
          backgroundRepeat: config?.settings.customization.backgroundImageRepeat ?? 'no-repeat',
          backgroundAttachment: config?.settings.customization.backgroundImageAttachment ?? 'fixed',
        },
      }}
    />
  );
};


const getVideoFormat = (video: string) => {
  const supportedFormats = ['mp4', 'webm', 'ogg'];
  for(const format of supportedFormats) {
    if(video.endsWith(format)) return format;
  }
  return undefined;
}

interface BackgroundVideoProps {
  videoSource: string;
  videoFormat: string;
}

const BackgroundVideo = ({videoSource, videoFormat}: BackgroundVideoProps) => {
    return (
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'fixed',
          width: '100vw',
          height: '100vh',
          top: 0,
          left: 0,
          objectFit: 'cover'
        }}
      >
        <source src={videoSource} type={`video/${videoFormat}`} />
      </video>
    );
};


export const useBoardLink = (
  link: '/board' | `/board/${string}/customize` | `/board/${string}`
) => {
  const router = useRouter();

  return router.asPath.startsWith('/board') ? link : link.replace('/board', '/b');
};
