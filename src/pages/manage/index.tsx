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
import Image from 'next/image';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';

const ManagementPage = () => {
  const { classes } = useStyles();
  return (
    <MainLayout>
      <Box className={classes.box} w="100%" h={150} p="xl" mb={50}>
        <Group position="apart">
          <Stack spacing={15}>
            <Title className={classes.boxTitle} order={2}>
              Welcome back, Manicraft1001
            </Title>
            <Text>
              Are you ready to organize?
              <br />
              You currently have 3 dashboards with 39 apps on them.
            </Text>
          </Stack>
          <Box bg="blue" w={100} h="100%" pos="relative">
            <Box pos="absolute" bottom={-100} right={0}>
              <Image src="/imgs/logo/logo.png" width={200} height={150} alt="" />
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
        <UnstyledButton>
          <Card className={classes.quickActionCard}>
            <Group spacing={30} noWrap>
              <Stack spacing={0}>
                <Text weight="bold">New dashboard</Text>
                <Text>Create a new dashboard</Text>
              </Stack>
              <IconArrowRight />
            </Group>
          </Card>
        </UnstyledButton>
        <UnstyledButton>
          <Card className={classes.quickActionCard}>
            <Group spacing={30} noWrap>
              <Stack spacing={0}>
                <Text weight="bold">Your dasboards</Text>
                <Text>Show a list of all your dashboards</Text>
              </Stack>
              <IconArrowRight />
            </Group>
          </Card>
        </UnstyledButton>
        <UnstyledButton>
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
        <UnstyledButton>
          <Card className={classes.quickActionCard}>
            <Group spacing={30} noWrap>
              <Stack spacing={0}>
                <Text weight="bold">Your preferences</Text>
                <Text>Adjust language, colors and more</Text>
              </Stack>
              <IconArrowRight />
            </Group>
          </Card>
        </UnstyledButton>
      </SimpleGrid>
    </MainLayout>
  );
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
