import {
  Affix,
  Button,
  Card,
  Container,
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
import { GetServerSideProps, GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
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
import {
  BoardCustomizationFormProvider,
  useBoardCustomizationForm,
} from '~/components/Board/Customize/form';
import { useBoardLink } from '~/components/layout/Templates/BoardLayout';
import { MainLayout } from '~/components/layout/Templates/MainLayout';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { firstUpperCase } from '~/tools/shared/strings';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { boardCustomizationSchema } from '~/validations/boards';

const notificationId = 'board-customization-notification';

export default function CustomizationPage({
  initialBoard,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const query = useRouter().query as { slug: string };
  const utils = api.useContext();
  const { data: board } = api.boards.byNameSimple.useQuery(
    { boardName: query.slug },
    {
      initialData: initialBoard,
    }
  );
  const { mutateAsync: updateCustomization, isLoading } =
    api.boards.updateCustomization.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();
  const { t } = useTranslation('boards/customize');
  const form = useBoardCustomizationForm({
    initialValues: {
      access: {
        allowGuests: board.allowGuests ?? false,
      },
      layout: {
        leftSidebarEnabled: false,
        rightSidebarEnabled: false,
        pingsEnabled: board.isPingEnabled ?? false,
      },
      appearance: {
        backgroundSrc: board.backgroundImageUrl ?? '',
        primaryColor: board.primaryColor ?? 'red',
        secondaryColor: board.secondaryColor ?? 'orange',
        shade: board.primaryShade ?? 8,
        opacity: board.appOpacity ?? 50,
        customCss: board.customCss ?? '',
      },
      gridstack: {
        sm: 3, //config?.settings.customization.gridstack?.columnCountSmall ?? 3,
        md: 6, //config?.settings.customization.gridstack?.columnCountMedium ?? 6,
        lg: 12, //config?.settings.customization.gridstack?.columnCountLarge ?? 12,
      },
      pageMetadata: {
        pageTitle: board.pageTitle ?? '',
        metaTitle: board.metaTitle ?? '',
        logoSrc: board.logoImageUrl ?? '',
        faviconSrc: board.faviconImageUrl ?? '',
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
          void utils.boards.byNameSimple.invalidate({ boardName: query.slug });
        },
        onSuccess() {
          updateNotification({
            id: notificationId,
            title: t('notifications.success.title'),
            message: t('notifications.success.message'),
            color: 'green',
            icon: <IconCheck />,
          });
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

  return (
    <MainLayout
      contentComponents={
        <Button
          component={Link}
          passHref
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
                        return;
                      }

                      handleSubmit(form.values);
                    }}
                    disabled={!form.isValid()}
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

export const getServerSideProps = async ({
  req,
  res,
  locale,
  params,
}: GetServerSidePropsContext) => {
  const routeParams = routeParamsSchema.safeParse(params);
  if (!routeParams.success) {
    return {
      notFound: true,
    };
  }

  const session = await getServerAuthSession({ req, res });
  if (!session?.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const helpers = await createTrpcServersideHelpers({ req, res });

  const board = await helpers.boards.byNameSimple.fetch({ boardName: routeParams.data.slug });
  if (!board) {
    return {
      notFound: true,
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
    locale,
    req,
    res
  );

  return {
    props: {
      primaryColor: board.primaryColor,
      secondaryColor: board.secondaryColor,
      primaryShade: board.primaryShade,
      initialBoard: board,
      ...translations,
    },
  };
};
