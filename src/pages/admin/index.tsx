import {
  Alert,
  Box,
  Card,
  Center,
  Image,
  Flex,
  Stack,
  Title,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconBook2, IconDashboard, IconInfoCircle, IconUser } from '@tabler/icons';
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next';
import { ReactNode } from 'react';
import { MainLayout } from '../../components/layout/admin/main-layout';
import { getServerSideTranslations } from '../../tools/server/getServerSideTranslations';

const Index: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = () => (
  <MainLayout>
    <Box h={200} style={{ overflow: 'hidden' }} pos="relative">
      <Image
        src="https://homarr.dev/img/pictures/homarr-devices-preview/compressed/homarr-devices-2d-mockup-flat-shadow-light-compressed.png"
        pos="absolute"
        h="100%"
        w="auto"
        style={{ zIndex: -2 }}
        opacity={0.5}
      />
      <Box
        pos="absolute"
        h="100%"
        w="100%"
        bg="linear-gradient(180deg, transparent, rgba(255,255,255,1) 95%, white 100%);"
        style={{ zIndex: -1 }}
      />

      <Flex align="end" h="100%" pb="lg">
        <Stack p="md" spacing={4}>
          <Text size="xl" style={{ lineHeight: 1 }}>
            Welcome back to Homarr
          </Text>
          <Title order={1} style={{ lineHeight: 1 }}>
            Your Dashboard
          </Title>
        </Stack>
      </Flex>
    </Box>

    <Alert color="blue" icon={<IconInfoCircle />}>
      <Text color="blue">
        The administration dashboard is experimental and may not work as intended.
      </Text>
    </Alert>

    <Text mt="lg" mb="xs">
      Quick Actions
    </Text>
    <Flex gap="md">
      <QuickAction name="Dashboards" icon={<IconDashboard size={50} strokeWidth={1} />} />
      <QuickAction name="Users" icon={<IconUser size={50} strokeWidth={1} />} />
      <QuickAction name="Online Documentation" icon={<IconBook2 size={50} strokeWidth={1} />} />
    </Flex>
  </MainLayout>
);

const QuickAction = ({ icon, name }: { icon: ReactNode; name: string }) => (
  <UnstyledButton>
    <Card
      sx={(theme) => ({
        backgroundColor: theme.colors.gray[2],
        '&:hover': {
          backgroundColor: theme.colors.gray[4],
        },
      })}
      w={140}
      h={140}
    >
      <Center h="100%">
        <Stack align="center" spacing="xs">
          {icon}
          <Text align="center" lineClamp={2}>
            {name}
          </Text>
        </Stack>
      </Center>
    </Card>
  </UnstyledButton>
);

export const getServerSideProps: GetServerSideProps = async (context) => {
  const translations = await getServerSideTranslations(
    ['common', 'form'],
    context.locale,
    context.req,
    context.res
  );

  return { props: { ...translations } };
};

export default Index;
