import { Box, Card, createStyles, Group, Image, SimpleGrid, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { OnlyKeysWithStructure } from '~/types/helpers';

import { type quickActions } from '../../../public/locales/en/manage/index.json';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';

const ManagementPage = () => {
  const { t } = useTranslation('manage/index');
  const { classes } = useStyles();
  const largerThanMd = useScreenLargerThan('md');
  const { data: sessionData } = useSession();

  const metaTitle = `${t('metaTitle')} • Homarr`;
  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>
      <Box className={classes.box} w="100%" mih={150} p="xl" mb={50}>
        <Group position="apart" noWrap>
          <Stack spacing={15}>
            <Title className={classes.boxTitle} order={2}>
              {t('hero.title', {
                username: sessionData?.user?.name ?? t('hero.fallbackUsername'),
              })}
            </Title>
            <Text>{t('hero.subtitle')}</Text>
          </Stack>
          <Box bg="blue" w={100} h="100%" pos="relative">
            <Box
              pos="absolute"
              bottom={largerThanMd ? -100 : undefined}
              top={largerThanMd ? undefined : -120}
              right={largerThanMd ? 0 : -40}
            >
              <Image
                src="/imgs/logo/logo.png"
                width={largerThanMd ? 200 : 100}
                height={largerThanMd ? 150 : 60}
                alt="Homarr Logo"
              />
            </Box>
          </Box>
        </Group>
      </Box>

      <Text weight="bold" mb="md">
        {t('quickActions.title')}
      </Text>
      <SimpleGrid
        cols={3}
        spacing="xl"
        breakpoints={[
          { maxWidth: '62rem', cols: 2, spacing: 'lg' },
          { maxWidth: '48rem', cols: 1, spacing: 'md' },
        ]}
      >
        <QuickActionCard type="boards" href="/manage/boards" />
        <QuickActionCard type="inviteUsers" href="/manage/users/invites" />
        <QuickActionCard type="manageUsers" href="/manage/users" />
      </SimpleGrid>
    </ManageLayout>
  );
};

type QuickActionType = OnlyKeysWithStructure<
  typeof quickActions,
  {
    title: string;
    subtitle: string;
  }
>;

type QuickActionCardProps = {
  type: QuickActionType;
  href: string;
};

const QuickActionCard = ({ type, href }: QuickActionCardProps) => {
  const { t } = useTranslation('manage/index');
  const { classes } = useStyles();

  return (
    <UnstyledButton component={Link} href={href}>
      <Card className={classes.quickActionCard}>
        <Group position="apart" noWrap>
          <Stack spacing={0}>
            <Text weight={500}>{t(`quickActions.${type}.title`)}</Text>
            <Text>{t(`quickActions.${type}.subtitle`)}</Text>
          </Stack>
          <IconArrowRight />
        </Group>
      </Card>
    </UnstyledButton>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  const result = checkForSessionOrAskForLogin(ctx, session, () => true);
  if (result) {
    return result;
  }

  const translations = await getServerSideTranslations(
    ['layout/manage', 'manage/index'],
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

export default ManagementPage;

const useStyles = createStyles((theme) => ({
  box: {
    borderRadius: theme.radius.md,
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.fn.rgba(theme.colors.red[8], 0.1) : theme.colors.red[1],
  },
  boxTitle: {
    color: theme.colors.red[6],
  },
  quickActionCard: {
    height: '100%',
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[2],
    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[3],
    },
  },
}));
