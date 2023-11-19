import { Button, Global, Menu, Text, Title, Tooltip, clsx } from '@mantine/core';
import { useHotkeys, useWindowEvent } from '@mantine/hooks';
import { openContextModal } from '@mantine/modals';
import { hideNotification, showNotification } from '@mantine/notifications';
import {
  IconApps,
  IconBrandDocker,
  IconEditCircle,
  IconEditCircleOff,
  IconLayoutBoardSplit,
  IconLayoutDashboard,
  IconPlug,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import Consola from 'consola';
import { useSession } from 'next-auth/react';
import { Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { env } from 'process';
import { useRequiredBoard } from '~/components/Board/context';
import { useNamedWrapperColumnCount } from '~/components/Board/gridstack/store';
import { useEditModeStore } from '~/components/Board/useEditModeStore';
import { BoardHeadOverride } from '~/components/layout/Meta/BoardHeadOverride';
import { HeaderActionButton } from '~/components/layout/header/ActionButton';
import { openContextModalGeneric } from '~/tools/mantineModalManagerExtensions';
import { api } from '~/utils/api';

import { MainLayout } from './MainLayout';

type BoardLayoutProps = {
  children: React.ReactNode;
  dockerEnabled?: boolean;
};

export const BoardLayout = ({ children, dockerEnabled = false }: BoardLayoutProps) => {
  const board = useRequiredBoard();
  const { data: session } = useSession();

  return (
    <MainLayout
      autoFocusSearch={session?.user.autoFocusSearch}
      headerActions={<HeaderActions dockerEnabled={dockerEnabled} />}
    >
      <BoardHeadOverride />
      <BackgroundImage />
      {children}
      <style>{clsx(board.customCss)}</style>
    </MainLayout>
  );
};

export const HeaderActions = ({ dockerEnabled }: { dockerEnabled: boolean }) => {
  const { data: sessionData } = useSession();

  if (!sessionData?.user?.isAdmin) return null;

  return (
    <>
      <CreateMenu />
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

const CreateMenu = () => {
  const board = useRequiredBoard();
  const createBoard = () => {
    openContextModalGeneric({
      modal: 'createBoardModal',
      title: 'Create a new board',
      innerProps: {},
    });
  };

  const createLayout = () => {
    openContextModalGeneric({
      modal: 'createLayoutModal',
      title: 'Create a new layout',
      innerProps: {
        boardId: board.id,
      },
      size: 'lg',
    });
  };

  return (
    <Menu>
      <Menu.Target>
        <HeaderActionButton onClick={() => {}}>
          <IconPlus size={20} stroke={1.5} />
        </HeaderActionButton>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item icon={<IconPlug stroke={1.5} size="1rem" />}>New integration</Menu.Item>
        <Menu.Item onClick={createLayout} icon={<IconLayoutBoardSplit stroke={1.5} size="1rem" />}>
          New layout
        </Menu.Item>
        <Menu.Item onClick={createBoard} icon={<IconLayoutDashboard stroke={1.5} size="1rem" />}>
          New board
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const CustomizeBoardButton = () => {
  const { name } = useRequiredBoard();
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
  const utils = api.useContext();
  const { enabled, toggleEditMode } = useEditModeStore();
  const board = useRequiredBoard();
  const { name } = board;
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

  const { mutateAsync: saveBoardAsync } = api.boards.save.useMutation();

  const save = async () => {
    toggleEditMode();
    if (!board || !name) return;
    await saveBoardAsync({ boardId: board.id, sections: board.sections, layoutId: board.layoutId });
    utils.boards.byName.invalidate();
    Consola.log('Saved config to server', name);
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
                  href="https://homarr.dev/docs/customizations/board-customization#screen-sizes"
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
  const board = useRequiredBoard();

  return (
    <Tooltip label={t('actionIcon.tooltip')}>
      <HeaderActionButton
        onClick={() =>
          openContextModal({
            modal: 'selectElement',
            title: t('modal.title'),
            size: 'xl',
            innerProps: {
              board,
            },
          })
        }
      >
        <IconApps size={20} stroke={1.5} />
      </HeaderActionButton>
    </Tooltip>
  );
};

const BackgroundImage = () => {
  const board = useRequiredBoard();

  if (!board.backgroundImageUrl) {
    return null;
  }

  return (
    <Global
      styles={{
        '.mantine-AppShell-root': {
          minHeight: '100vh',
          backgroundImage: `url('${board.backgroundImageUrl}')`,
          backgroundPosition: 'center center',
          backgroundSize: board.backgroundImageSize ?? 'cover',
          backgroundRepeat: board.backgroundImageRepeat ?? 'no-repeat',
          backgroundAttachment: board.backgroundImageAttachment ?? 'fixed',
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
