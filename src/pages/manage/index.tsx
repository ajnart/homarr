import {
  Box,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
  UnstyledButton,
  createStyles,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { useScreenLargerThan } from '~/hooks/useScreenLargerThan';
import { getServerAuthSession } from '~/server/auth';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';

const ManagementPage = () => {
  const { classes } = useStyles();
  const largerThanMd = useScreenLargerThan('md');
  const { data: sessionData } = useSession();

  return (
    <ManageLayout>
      <Head>
        <title>Manage • Homarr</title>
      </Head>
      <Box className={classes.box} w="100%" mih={150} p="xl" mb={50}>
        <Group position="apart" noWrap>
          <Stack spacing={15}>
            <Title className={classes.boxTitle} order={2}>
              Welcome back, {sessionData?.user?.name ?? 'Anonymous'}
            </Title>
            <Text>Welcome to Your Application Hub. Organize, Optimize, and Conquer!</Text>
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
                alt=""
              />
            </Box>
          </Box>
        </Group>
      </Box>

      <Text weight="bold" mb="md">
        Quick actions
      </Text>
      <SimpleGrid
        cols={3}
        spacing="xl"
        breakpoints={[
          { maxWidth: '62rem', cols: 2, spacing: 'lg' },
          { maxWidth: '48rem', cols: 1, spacing: 'md' },
        ]}
      >
        <UnstyledButton component={Link} href="/manage/boards">
          <Card className={classes.quickActionCard}>
            <Group spacing={30} noWrap>
              <Stack spacing={0}>
                <Text weight="bold">Your boards</Text>
                <Text>Show a list of all your dashboards</Text>
              </Stack>
              <IconArrowRight />
            </Group>
          </Card>
        </UnstyledButton>
        <UnstyledButton component={Link} href="/manage/users/invites">
          <Card className={classes.quickActionCard}>
            <Group spacing={30} noWrap>
              <Stack spacing={0}>
                <Text weight="bold">Invite a new user</Text>
                <Text>Create and send an invitation for registration</Text>
              </Stack>
              <IconArrowRight />
            </Group>
          </Card>
        </UnstyledButton>
        <UnstyledButton component={Link} href="/manage/users">
          <Card className={classes.quickActionCard}>
            <Group spacing={30} noWrap>
              <Stack spacing={0}>
                <Text weight="bold">Manage users</Text>
                <Text>Delete and manage your users</Text>
              </Stack>
              <IconArrowRight />
            </Group>
          </Card>
        </UnstyledButton>
      </SimpleGrid>
    </ManageLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  if (!session?.user) {
    return {
      notFound: true,
    };
  }

  const translations = await getServerSideTranslations(
    ['common'],
    ctx.locale,
    undefined,
    undefined
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
