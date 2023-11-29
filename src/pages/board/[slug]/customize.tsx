import {
  Affix,
  Button,
  Card,
  Container,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Transition,
  rem,
} from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconAccessPoint,
  IconArrowLeft,
  IconBrush,
  IconChartCandle,
  IconCheck,
  IconLock,
  IconSearch,
  IconX,
  TablerIconsProps,
} from '@tabler/icons-react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { z } from 'zod';
import type generalSettingsTranslations from '~/../public/locales/en/settings/customization/general.json';
import { AccessCustomization } from '~/components/Board/Customize/Access/AccessCustomization';
import { AppearanceCustomization } from '~/components/Board/Customize/Appearance/AppearanceCustomization';
import { NetworkCustomization } from '~/components/Board/Customize/Network/NetworkCustomization';
import { PageMetadataCustomization } from '~/components/Board/Customize/PageMetadata/PageMetadataCustomization';
import { SearchCustomization } from '~/components/Board/Customize/Search/SearchCustomization';
import {
  BoardCustomizationFormProvider,
  useBoardCustomizationForm,
} from '~/components/Board/Customize/form';
import { useBoardLink } from '~/components/layout/Templates/BoardLayout';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import { boardRouter } from '~/server/api/routers/board';
import { integrationRouter } from '~/server/api/routers/integration';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { firstUpperCase } from '~/tools/shared/strings';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { boardCustomizationSchema } from '~/validations/boards';

const notificationId = 'board-customization-notification';

export default function CustomizationPage({
  initialBoard,
  allMediaIntegrations,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const query = useRouter().query as { slug: string };
  const utils = api.useContext();
  const {
    data: queryBoard,
    isError,
    error,
  } = api.boards.byNameSimple.useQuery(
    { boardName: query.slug },
    {
      refetchOnMount: false,
      refetchOnReconnect: false,
      useErrorBoundary: false,
      suspense: false,
      enabled: typeof window !== 'undefined', // Disable on server-side so it is not cached with an old result.
    }
  );

  const board = queryBoard ?? initialBoard; // Initialdata property is not working because it somehow ignores the enabled property.

  const { mutateAsync: updateCustomization, isLoading } =
    api.boards.updateCustomization.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();
  const { t } = useTranslation('boards/customize');
  const form = useBoardCustomizationForm({
    initialValues: {
      access: {
        allowGuests: board.allowGuests ?? false,
      },
      network: {
        pingsEnabled: board.isPingEnabled ?? false,
      },
      appearance: {
        backgroundSrc: board.backgroundImageUrl ?? '',
        primaryColor: board.primaryColor ?? 'red',
        secondaryColor: board.secondaryColor ?? 'orange',
        shade: board.primaryShade ?? 8,
        opacity: board.appOpacity ?? 50,
        customCss: board.customCss ?? '',
        backgroundImageAttachment: board.backgroundImageAttachment ?? 'fixed',
        backgroundImageRepeat: board.backgroundImageRepeat ?? 'no-repeat',
        backgroundImageSize: board.backgroundImageSize ?? 'cover',
      },
      pageMetadata: {
        pageTitle: board.pageTitle ?? '',
        metaTitle: board.metaTitle ?? '',
        logoSrc: board.logoImageUrl ?? '',
        faviconSrc: board.faviconImageUrl ?? '',
      },
      search: {
        mediaIntegrations: board.mediaIntegrations.map(({ id }) => id),
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
    await updateCustomization(
      {
        boardName: query.slug,
        customization: values,
      },
      {
        onSettled() {
          void utils.boards.byNameSimple.invalidate();
          void utils.boards.byName.invalidate();
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
          color={board.primaryColor ?? 'red'}
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
      <Container>
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
                  <SectionTitle type="pageMetadata" icon={IconChartCandle} />
                  <PageMetadataCustomization />
                </Stack>
                <Grid>
                  <Grid.Col span={12} sm={6}>
                    <Stack spacing="xs">
                      <SectionTitle type="access" icon={IconLock} />
                      <AccessCustomization />
                    </Stack>
                  </Grid.Col>
                  <Grid.Col span={12} sm={6}>
                    <Stack spacing="xs">
                      <SectionTitle type="network" icon={IconAccessPoint} />
                      <NetworkCustomization />
                    </Stack>
                  </Grid.Col>
                </Grid>
                <Stack spacing="xs">
                  <SectionTitle type="search" icon={IconSearch} />
                  <SearchCustomization allMediaIntegrations={allMediaIntegrations} />
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
  type: keyof (typeof generalSettingsTranslations)['accordeon'];
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

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const routeParams = routeParamsSchema.safeParse(context.params);
  if (!routeParams.success) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession(context);

  const result = checkForSessionOrAskForLogin(
    context,
    session,
    () => session?.user.isAdmin == true
  );
  if (result) {
    return result;
  }

  const boardCaller = boardRouter.createCaller({
    session: session,
    cookies: context.req.cookies,
    headers: context.req.headers,
  });

  const board = await boardCaller.byNameSimple({ boardName: routeParams.data.slug });
  if (!board) {
    return {
      notFound: true,
    };
  }

  const integrationCaller = integrationRouter.createCaller({
    session: session,
    cookies: context.req.cookies,
    headers: context.req.headers,
  });

  const allMediaIntegrations = await integrationCaller.allMedia();

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
      'settings/customization/search',
    ],
    context.locale,
    context.req,
    context.res
  );

  return {
    props: {
      primaryColor: board.primaryColor,
      secondaryColor: board.secondaryColor,
      primaryShade: board.primaryShade,
      initialBoard: board,
      allMediaIntegrations,
      ...translations,
    },
  };
};
