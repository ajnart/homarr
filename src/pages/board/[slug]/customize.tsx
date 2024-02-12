import { Affix, Button, Card, Container, Group, Paper, rem, Stack, Text, Title, Transition } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconBrush,
  IconChartCandle,
  IconCheck,
  IconDragDrop,
  IconLayout,
  IconLock,
  IconX,
  TablerIconsProps,
} from '@tabler/icons-react';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { z } from 'zod';
import { AccessCustomization } from '~/components/Board/Customize/Access/AccessCustomization';
import { AppearanceCustomization } from '~/components/Board/Customize/Appearance/AppearanceCustomization';
import { GridstackCustomization } from '~/components/Board/Customize/Gridstack/GridstackCustomization';
import { LayoutCustomization } from '~/components/Board/Customize/Layout/LayoutCustomization';
import { PageMetadataCustomization } from '~/components/Board/Customize/PageMetadata/PageMetadataCustomization';
import { BoardCustomizationFormProvider, useBoardCustomizationForm } from '~/components/Board/Customize/form';
import { useBoardLink } from '~/components/layout/Templates/BoardLayout';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { configRouter } from '~/server/api/routers/config';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { firstUpperCase } from '~/tools/shared/strings';
import { ConfigType } from '~/types/config';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { boardCustomizationSchema } from '~/validations/boards';

const notificationId = 'board-customization-notification';

export default function CustomizationPage({
  initialConfig,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const query = useRouter().query as {
    slug: string;
  };
  const utils = api.useContext();
  const {
    data: config,
    error,
    isError,
  } = api.config.byName.useQuery(
    { name: query.slug },
    {
      initialData: initialConfig,
      refetchOnMount: false,
      useErrorBoundary: false,
      suspense: false,
    }
  );
  const { mutateAsync: saveCustomization, isLoading } = api.config.saveCustomization.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();
  const { t } = useTranslation('boards/customize');
  const form = useBoardCustomizationForm({
    initialValues: {
      access: {
        allowGuests: config?.settings.access.allowGuests ?? false,
      },
      layout: {
        leftSidebarEnabled: config?.settings.customization.layout.enabledLeftSidebar ?? false,
        rightSidebarEnabled: config?.settings.customization.layout.enabledRightSidebar ?? false,
        pingsEnabled: config?.settings.customization.layout.enabledPing ?? false,
      },
      appearance: {
        backgroundSrc: config?.settings.customization.backgroundImageUrl ?? '',
        primaryColor: config?.settings.customization.colors.primary ?? 'red',
        secondaryColor: config?.settings.customization.colors.secondary ?? 'orange',
        shade: (config?.settings.customization.colors.shade as number | undefined) ?? 8,
        opacity: config?.settings.customization.appOpacity ?? 50,
        customCss: config?.settings.customization.customCss ?? '',
        backgroundImageAttachment: config?.settings.customization.backgroundImageAttachment ?? 'fixed',
        backgroundImageRepeat: config?.settings.customization.backgroundImageRepeat ?? 'no-repeat',
        backgroundImageSize: config?.settings.customization.backgroundImageSize ?? 'cover',
      },
      gridstack: {
        sm: config?.settings.customization.gridstack?.columnCountSmall ?? 3,
        md: config?.settings.customization.gridstack?.columnCountMedium ?? 6,
        lg: config?.settings.customization.gridstack?.columnCountLarge ?? 12,
      },
      pageMetadata: {
        pageTitle: config?.settings.customization.pageTitle ?? '',
        metaTitle: config?.settings.customization.metaTitle ?? '',
        logoSrc: config?.settings.customization.logoImageUrl ?? '',
        faviconSrc: config?.settings.customization.faviconUrl ?? '',
      },
    },
    validate: i18nZodResolver(boardCustomizationSchema),
    validateInputOnChange: true,
    validateInputOnBlur: true,
  });

  const backToBoardHref = useBoardLink(`/board/${query.slug}`);

  const handleSubmit = async (values: z.infer<typeof boardCustomizationSchema>) => {
    if (isLoading) return;
    showNotification({
      id: notificationId,
      title: t('notifications.pending.title'),
      message: t('notifications.pending.message'),
      loading: true,
    });
    await saveCustomization(
      {
        name: query.slug,
        ...values,
      },
      {
        onSettled() {
          void utils.config.byName.invalidate({ name: query.slug });
        },
        onSuccess() {
          updateNotification({
            id: notificationId,
            title: t('notifications.success.title'),
            message: t('notifications.success.message'),
            color: 'green',
            icon: <IconCheck />,
          });
          form.resetDirty();
        },
        onError() {
          updateNotification({
            id: notificationId,
            title: t('notifications.error.title'),
            message: t('notifications.error.message'),
            color: 'red',
            icon: <IconX />,
          });
        },
      }
    );
  };

  const metaTitle = `${t('metaTitle', {
    name: firstUpperCase(query.slug),
  })} • Homarr`;

  if (isError || error) {
    return {
      notFound: true,
    };
  }

  return (
    <MainLayout
      contentComponents={
        <Button
          component={Link}
          passHref
          color={config?.settings.customization.colors.primary ?? 'red'}
          href={backToBoardHref}
          variant="light"
          leftIcon={<IconArrowLeft size={16} />}
        >
          {t('backToBoard')}
        </Button>
      }
    >
      <Head>
        <title>{metaTitle}</title>
      </Head>
      <Affix position={{ bottom: rem(20), left: rem(20), right: rem(20) }}>
        <Transition transition="slide-up" mounted={form.isDirty()}>
          {(transitionStyles) => (
            <Card
              style={transitionStyles}
              sx={(theme) => ({
                background:
                  theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[1],
              })}
              shadow="md"
              withBorder
            >
              <Group position="apart" noWrap>
                <Text weight="bold">{t('save.note')}</Text>
                <Group spacing="md">
                  <Button
                    onClick={() => {
                      form.reset();
                    }}
                    variant="subtle"
                    type="button"
                  >
                    {t('common:cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      if (!form.isValid()) {
                        form.validate();
                        return;
                      }

                      handleSubmit(form.values);
                    }}
                    loading={isLoading}
                    color="green"
                  >
                    {t('save.button')}
                  </Button>
                </Group>
              </Group>
            </Card>
          )}
        </Transition>
      </Affix>
      <Container pb="6rem">
        <Paper p="xl" py="sm" mih="100%" withBorder>
          <Stack>
            <Group position="apart">
              <Title order={2}>
                {t('pageTitle', {
                  name: firstUpperCase(query.slug),
                })}
              </Title>
            </Group>
            <BoardCustomizationFormProvider form={form}>
              <Stack spacing="xl">
                <Stack spacing="xs">
                  <SectionTitle type="layout" icon={IconLayout} />
                  <LayoutCustomization />
                </Stack>
                <Stack spacing="xs">
                  <SectionTitle type="access" icon={IconLock} />
                  <AccessCustomization />
                </Stack>
                <Stack spacing="xs">
                  <SectionTitle type="gridstack" icon={IconDragDrop} />
                  <GridstackCustomization />
                </Stack>
                <Stack spacing="xs">
                  <SectionTitle type="pageMetadata" icon={IconChartCandle} />
                  <PageMetadataCustomization />
                </Stack>
                <Stack spacing="xs">
                  <SectionTitle type="appereance" icon={IconBrush} />
                  <AppearanceCustomization />
                </Stack>
              </Stack>
            </BoardCustomizationFormProvider>
          </Stack>
        </Paper>
      </Container>
    </MainLayout>
  );
}

type SectionTitleProps = {
  type: 'layout' | 'gridstack' | 'pageMetadata' | 'appereance' | 'access';
  icon: (props: TablerIconsProps) => ReactNode;
};

const SectionTitle = ({ type, icon: Icon }: SectionTitleProps) => {
  const { t } = useTranslation('settings/customization/general');

  return (
    <Stack spacing={0}>
      <Group spacing="xs">
        <Icon size={16} />
        <Title order={5}>{t(`accordeon.${type}.name`)}</Title>
      </Group>
      <Text color="dimmed">{t(`accordeon.${type}.description`)}</Text>
    </Stack>
  );
};

const routeParamsSchema = z.object({
  slug: z.string(),
});

export const getServerSideProps: GetServerSideProps = async (context) => {
  const routeParams = routeParamsSchema.safeParse(context.params);
  if (!routeParams.success) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession({ req: context.req, res: context.res });

  const result = checkForSessionOrAskForLogin(
    context,
    session,
    () => session?.user.isAdmin == true
  );
  if (result) {
    return result;
  }

  const helpers = await createTrpcServersideHelpers({ req: context.req, res: context.res });
  const caller = configRouter.createCaller({
    session: session,
    cookies: context.req.cookies,
  });

  let config: ConfigType;
  try {
    config = await caller.byName({ name: routeParams.data.slug });
  } catch {
    return {
      notFound: true
    };
  }

  const translations = await getServerSideTranslations(
    [
      'boards/customize',
      'settings/common',
      'settings/customization/general',
      'settings/customization/page-appearance',
      'settings/customization/shade-selector',
      'settings/customization/opacity-selector',
      'settings/customization/gridstack',
      'settings/customization/access',
    ],
    context.locale,
    context.req,
    context.res
  );

  return {
    props: {
      initialConfig: config,
      primaryColor: config.settings.customization.colors.primary,
      secondaryColor: config.settings.customization.colors.secondary,
      primaryShade: config.settings.customization.colors.shade,
      trpcState: helpers.dehydrate(),
      ...translations,
    },
  };
};
