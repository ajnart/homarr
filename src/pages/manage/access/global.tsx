import { Card, Loader, SimpleGrid, Switch, Text, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { GetServerSideProps } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { RouterOutputs, api } from '~/utils/api';

type FindAllSettingsDataType = RouterOutputs['globalSettings']['findSingleSetting'];

export const GlobalAccessPage = () => {
  const { t } = useTranslation('manage/access/global');
  const metaTitle = `${t('metaTitle')} • Homarr`;

  const { data, isLoading } = api.globalSettings.findSingleSetting.useQuery();

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Title mb="xs">{t('pageTitle')}</Title>
      <Text mb="xl">{t('pageText')}</Text>

      {isLoading || !data ? <Loader /> : <SettingsForm settings={data} />}
    </ManageLayout>
  );
};

const SettingsForm = ({ settings }: { settings: FindAllSettingsDataType }) => {
  const { t } = useTranslation('manage/access/global');
  const form = useForm({
    initialValues: {
      allowBoardCreation: settings.allowBoardCreation
    }
  });
  return (
    <Card bg="gray.0" withBorder>
      <SimpleGrid>
        <Switch label={t('form.allowBoardCreation.label')} {...form.getInputProps('')} />
      </SimpleGrid>
    </Card>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user || !session.user.isAdmin) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    manageNamespaces,
    ctx.locale,
    ctx.req,
    ctx.res
  );
  return {
    props: {
      ...translations,
    },
  };
};

export default GlobalAccessPage;
