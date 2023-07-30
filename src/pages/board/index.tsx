import { Button, ButtonProps, Text, Title, Tooltip } from '@mantine/core';
import { useHotkeys, useWindowEvent } from '@mantine/hooks';
import { openContextModal } from '@mantine/modals';
import { hideNotification, showNotification } from '@mantine/notifications';
import { IconApps, IconBrandDocker, IconEditCircle, IconEditCircleOff } from '@tabler/icons-react';
import Consola from 'consola';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useSession } from 'next-auth/react';
import { SSRConfig, Trans, useTranslation } from 'next-i18next';
import Link from 'next/link';
import { ForwardedRef, forwardRef } from 'react';
import { Dashboard } from '~/components/Dashboard/Dashboard';
import { useEditModeStore } from '~/components/Dashboard/Views/useEditModeStore';
import { useNamedWrapperColumnCount } from '~/components/Dashboard/Wrappers/gridstack/store';
import { MainLayout } from '~/components/layout/main';
import { useCardStyles } from '~/components/layout/useCardStyles';
import { useInitConfig } from '~/config/init';
import { useConfigContext } from '~/config/provider';
import { getServerAuthSession } from '~/server/auth';
import { prisma } from '~/server/db';
import { getFrontendConfig } from '~/tools/config/getFrontendConfig';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '~/tools/server/translation-namespaces';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';

export default function BoardPage({
  config: initialConfig,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useInitConfig(initialConfig);

  return (
    <MainLayout headerActions={<HeaderActions />}>
      <Dashboard />
    </MainLayout>
  );
}

type BoardGetServerSideProps = {
  config: ConfigType;
  _nextI18Next?: SSRConfig['_nextI18Next'];
};

export const getServerSideProps: GetServerSideProps<BoardGetServerSideProps> = async (ctx) => {
  const session = await getServerAuthSession(ctx);
  const currentUserSettings = await prisma.userSettings.findFirst({
    where: {
      userId: session?.user?.id,
    },
  });

  const translations = await getServerSideTranslations(
    dashboardNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );
  const boardName = currentUserSettings?.defaultBoard ?? 'default';
  const config = await getFrontendConfig(boardName);

  return {
    props: {
      config,
      ...translations,
    },
  };
};

export const HeaderActions = () => {
  const { data: sessionData } = useSession();

  if (!sessionData?.user?.isAdmin) return null;

  return (
    <>
      <DockerButton />
      <ToggleEditModeButton />
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

type SpecificLinkProps = {
  component: typeof Link;
  href: string;
};
type SpecificButtonProps = {
  onClick: HTMLButtonElement['onclick'];
};
type HeaderActionButtonProps = Omit<ButtonProps, 'variant' | 'className' | 'h' | 'w' | 'px'> &
  (SpecificLinkProps | SpecificButtonProps);

const HeaderActionButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  HeaderActionButtonProps
>(({ children, ...props }, ref) => {
  const { classes } = useCardStyles(true);

  const buttonProps: ButtonProps = {
    variant: 'default',
    className: classes.card,
    h: 38,
    w: 38,
    px: 0,
    ...props,
  };

  if ('component' in props) {
    return (
      <Button
        ref={ref as ForwardedRef<HTMLAnchorElement>}
        component={props.component}
        href={props.href}
        {...buttonProps}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button ref={ref as ForwardedRef<HTMLButtonElement>} {...buttonProps}>
      {children}
    </Button>
  );
});

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
  const { classes } = useCardStyles(true);

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
