import { Card, Text, Title } from '@mantine/core';
import { useInterval } from '@mantine/hooks';
import fs from 'fs';
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { logFilePath } from '~/tools/constants';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { boardNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const LogPage = ({ logFileExists }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { t } = useTranslation('system/log');
  const metaTitle = `${t('metaTitle')} • Homarr`;

  const utils = api.useContext();
  const { data } = api.log.poll.useQuery(undefined, {
    retry: false
  });

  const refetchInterval = 5 * 1000;

  const [milliseconds, setMilliseconds] = useState(0);
  const interval = useInterval(
    () =>
      setMilliseconds((previous) => {
        const newValue = previous + 100;
        if (newValue > refetchInterval) {
          void utils.log.poll.refetch();
          return 0;
        }
        return newValue;
      }),
    100
  );

  useEffect(() => {
    interval.start();
    return interval.stop;
  }, []);

  return (
    <ManageLayout>
      <Title mb="lg">{t('title')}</Title>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Card>
        {!logFileExists && (
          <Text color="dimmed" mb="md">{t('notSupported')}</Text>
        )}
        {data?.map((line) => (
          <Card.Section inheritPadding withBorder>
            <Text py="sm">{line.message}</Text>
          </Card.Section>
        ))}
        <Card.Section inheritPadding withBorder>
          <Text py="sm">{t('timeDisplay', { time: ((refetchInterval - milliseconds) / 1000).toFixed(1) })}</Text>
        </Card.Section>
      </Card>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerAuthSession({ req: context.req, res: context.res });
  const result = checkForSessionOrAskForLogin(
    context,
    session,
    () => session?.user.isAdmin == true
  );
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    [...boardNamespaces, 'layout/manage', 'tools/docker', 'system/log'],
    context.locale,
    context.req,
    context.res
  );

  const logFileExists = fs.existsSync(logFilePath);

  return {
    props: {
      ...translations,
      logFileExists
    },
  };
};

export default LogPage;
