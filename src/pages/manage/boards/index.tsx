import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Flex,
  Group,
  LoadingOverlay,
  Menu,
  SimpleGrid,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { MainLayout } from '~/components/layout/admin/main-admin.layout';
import { CommonHeader } from '~/components/layout/common-header';
import { sleep } from '~/tools/client/time';
import { api } from '~/utils/api';

const BoardsPage = () => {
  const { data } = api.config.all.useQuery();
  const context = api.useContext();
  const { mutateAsync: deletionMutationAsync } = api.config.delete.useMutation({
    onSettled: () => {
      void context.config.all.invalidate();
    },
  });

  const [deletingDashboards, { append, filter }] = useListState<string>([]);

  return (
    <MainLayout>
      <CommonHeader>
        <title>Boards • Homarr</title>
      </CommonHeader>

      <Title mb="xl">Boards</Title>

      <Flex justify="end" mb="md">
        <Button
          onClick={() => {
            modals.openContextModal({
              modal: 'createDashboardModal',
              title: <Text>Create new dashboard</Text>,
              innerProps: {},
            });
          }}
          leftIcon={<IconPlus size="1rem" />}
          variant="default"
        >
          Create new dashboard
        </Button>
      </Flex>

      {data && (
        <SimpleGrid
          cols={3}
          spacing="lg"
          breakpoints={[
            { maxWidth: '62rem', cols: 2, spacing: 'lg' },
            { maxWidth: '48rem', cols: 1, spacing: 'lg' },
          ]}
        >
          {data.map((board, index) => (
            <Card key={index} shadow="sm" padding="lg" radius="md" pos="relative" withBorder>
              <LoadingOverlay visible={deletingDashboards.includes(board)} />
              <Group position="apart" mb="xs">
                <Text weight={500}>{board}</Text>
                <Badge color="pink" variant="light">
                  Filesystem
                </Badge>
              </Group>

              <Text size="sm" color="dimmed">
                With Fjord Tours you can explore more of the magical fjord landscapes with tours and
                activities on and around the fjords of Norway
              </Text>

              <Group mt="md">
                <Button
                  component={Link}
                  style={{ flexGrow: 1 }}
                  variant="default"
                  color="blue"
                  radius="md"
                  href={`/board/${board}`}
                >
                  View dashboard
                </Button>
                <Menu>
                  <Menu.Target>
                    <ActionIcon h={34} w={34} variant="default">
                      <IconDotsVertical size="1rem" />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      onClick={async () => {
                        append(board);
                        // give user feedback, that it's being deleted
                        await sleep(500);
                        deletionMutationAsync({
                          name: board,
                        }).finally(async () => {
                          await sleep(500);
                          filter((item, _) => item !== board);
                        });
                      }}
                      icon={<IconTrash size="1rem" />}
                      color="red"
                    >
                      Permanently delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </MainLayout>
  );
};

export default BoardsPage;
