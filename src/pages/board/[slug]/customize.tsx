import { Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconBrush,
  IconChartCandle,
  IconCheck,
  IconDragDrop,
  IconLayout,
  IconX,
  TablerIconsProps,
} from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { z } from 'zod';
import { AppearanceCustomization } from '~/components/Board/Customize/Appearance/AppearanceCustomization';
import { GridstackCustomization } from '~/components/Board/Customize/Gridstack/GridstackCustomization';
import { LayoutCustomization } from '~/components/Board/Customize/Layout/LayoutCustomization';
import { PageMetadataCustomization } from '~/components/Board/Customize/PageMetadata/PageMetadataCustomization';
import {
  BoardCustomizationFormProvider,
  useBoardCustomizationForm,
} from '~/components/Board/Customize/form';
import { MainLayout } from '~/components/layout/main';
import { createTrpcServersideHelpers } from '~/server/api/helper';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';
import { useI18nZodResolver } from '~/utils/i18n-zod-resolver';
import { boardCustomizationSchema } from '~/validations/dashboards';

const notificationId = 'board-customization-notification';

export default function CustomizationPage() {
  const query = useRouter().query as { slug: string };
  const utils = api.useContext();
  const { data: config } = api.config.byName.useQuery({ name: query.slug });
  const { mutateAsync: saveCusomization, isLoading } = api.config.saveCusomization.useMutation();
  const { i18nZodResolver } = useI18nZodResolver();
  const form = useBoardCustomizationForm({
    initialValues: {
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
  });

  const handleSubmit = async (values: z.infer<typeof boardCustomizationSchema>) => {
    if (isLoading) return;
    showNotification({
      id: notificationId,
      title: 'Saving customization',
      message: 'Please wait while we save your customization',
      loading: true,
    });
    await saveCusomization(
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
            title: 'Customization saved',
            message: 'Your customization has been saved',
            color: 'green',
            icon: <IconCheck />,
          });
        },
        onError() {
          updateNotification({
            id: notificationId,
            title: 'Error',
            message: 'Unable to save customization',
            color: 'red',
            icon: <IconX />,
          });
        },
      }
    );
  };

  return (
    <MainLayout>
      <Container>
        <Paper p="xl" py="sm" mih="100%" withBorder>
          <Stack>
            <Group position="apart">
              <Title order={2}>Customization for {query.slug} Board</Title>
              <Button
                component={Link}
                href={`/board/${query.slug}`}
                variant="light"
                leftIcon={<IconArrowLeft size={16} />}
              >
                Back to Board
              </Button>
            </Group>
            <BoardCustomizationFormProvider form={form}>
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack spacing="xl">
                  <Stack spacing="xs">
                    <SectionTitle type="layout" icon={IconLayout} />
                    <LayoutCustomization />
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
                  <Button type="submit" loading={isLoading}>
                    Save changes
                  </Button>
                </Stack>
              </form>
            </BoardCustomizationFormProvider>
          </Stack>
        </Paper>
      </Container>
    </MainLayout>
  );
}

type SectionTitleProps = {
  type: 'layout' | 'gridstack' | 'pageMetadata' | 'appereance';
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

export const getServerSideProps: GetServerSideProps = async ({ req, res, locale, params }) => {
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

  helpers.config.byName.prefetch({ name: routeParams.data.slug });

  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);

  return {
    props: {
      trpcState: helpers.dehydrate(),
      ...translations,
    },
  };
};
