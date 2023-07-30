import { Button, Container, Group, Paper, Stack, Text, Title } from '@mantine/core';
import {
  IconArrowLeft,
  IconBrush,
  IconChartCandle,
  IconDragDrop,
  IconLayout,
  TablerIconsProps,
} from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode } from 'react';
import { AppearanceCustomization } from '~/components/Board/Customize/Appearance/AppearanceCustomization';
import { GridstackCustomization } from '~/components/Board/Customize/Gridstack/GridstackCustomization';
import { LayoutCustomization } from '~/components/Board/Customize/Layout/LayoutCustomization';
import { PageMetadataCustomization } from '~/components/Board/Customize/PageMetadata/PageMetadataCustomization';
import {
  BoardCustomizationFormProvider,
  useBoardCustomizationForm,
} from '~/components/Board/Customize/form';
import { MainLayout } from '~/components/layout/main';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { dashboardNamespaces } from '~/tools/server/translation-namespaces';

export default function CustomizationPage() {
  const query = useRouter().query as { slug: string };
  const { t } = useTranslation([
    'settings/customization/general',
    'settings/customization/color-selector',
  ]);
  const form = useBoardCustomizationForm({
    initialValues: {
      layout: {
        leftSidebarEnabled: false,
        rightSidebarEnabled: false,
        pingsEnabled: false,
      },
      appearance: {
        backgroundSrc: '',
        primaryColor: 'red',
        secondaryColor: 'orange',
        shade: 8,
        opacity: 50,
        customCss: '',
      },
      gridstack: {
        sm: 3,
        md: 6,
        lg: 12,
      },
      pageMetadata: {
        pageTitle: '',
        metaTitle: '',
        logoSrc: '',
        faviconSrc: '',
      },
    },
  });

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
              <form>
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
                  <Button type="submit">Save changes</Button>
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

export const getServerSideProps: GetServerSideProps = async ({ req, res, locale }) => {
  const translations = await getServerSideTranslations(dashboardNamespaces, locale, req, res);

  return {
    props: {
      ...translations,
    },
  };
};
