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
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
  IconBox,
  IconCategory,
  IconDeviceFloppy,
  IconDotsVertical,
  IconFolderFilled,
  IconPlus,
  IconStack,
  IconStarFilled,
  IconTrash,
} from '@tabler/icons-react';
import Head from 'next/head';
import Link from 'next/link';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { sleep } from '~/tools/client/time';
import { api } from '~/utils/api';

const BoardsPage = () => {
  const context = api.useContext();
  const { data } = api.boards.all.useQuery();
  const { mutateAsync } = api.user.makeDefaultDashboard.useMutation({
    onSettled: () => {
      void context.boards.invalidate();
    },
  });

  const [deletingDashboards, { append, filter }] = useListState<string>([]);

  return (
    <ManageLayout>
      <Head>
        <title>Boards • Homarr</title>
      </Head>

      <Title mb="xl">Boards</Title>

      <Flex justify="end" mb="md">
        <Button
          onClick={() => {
            modals.openContextModal({
              modal: 'createDashboardModal',
              title: <Text>Create new board</Text>,
              innerProps: {},
            });
          }}
          leftIcon={<IconPlus size="1rem" />}
          variant="default"
        >
          Create new board
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
              <LoadingOverlay visible={deletingDashboards.includes(board.name)} />

              <Group mb="xl" position="apart" noWrap>
                <Text weight={500} mb="xs">
                  {board.name}
                </Text>
                <Group spacing="xs" noWrap>
                  <Badge
                    leftSection={<IconFolderFilled size=".7rem" />}
                    color="pink"
                    variant="light"
                  >
                    Filesystem
                  </Badge>
                  {board.isDefaultForUser && (
                    <Badge
                      leftSection={<IconStarFilled size=".7rem" />}
                      color="yellow"
                      variant="light"
                    >
                      Default
                    </Badge>
                  )}
                </Group>
              </Group>

              <Stack spacing={3}>
                <Group position="apart">
                  <Group spacing="xs">
                    <IconBox opacity={0.7} size="1rem" />
                    <Text color="dimmed">Apps</Text>
                  </Group>
                  <Text>{board.countApps}</Text>
                </Group>

                <Group position="apart">
                  <Group spacing="xs">
                    <IconStack opacity={0.7} size="1rem" />
                    <Text color="dimmed">Widgets</Text>
                  </Group>
                  <Text>{board.countWidgets}</Text>
                </Group>

                <Group position="apart">
                  <Group spacing="xs">
                    <IconCategory opacity={0.7} size="1rem" />
                    <Text color="dimmed">Categories</Text>
                  </Group>
                  <Text>{board.countCategories}</Text>
                </Group>
              </Stack>

              <Group mt="md">
                <Button
                  component={Link}
                  style={{ flexGrow: 1 }}
                  variant="default"
                  color="blue"
                  radius="md"
                  href={`/board/${board.name}`}
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
                      icon={<IconDeviceFloppy size="1rem" />}
                      onClick={async () => {
                        void mutateAsync({
                          board: board.name,
                        });
                      }}
                    >
                      Set as your default board
                    </Menu.Item>
                    <Menu.Item
                      onClick={async () => {
                        modals.openContextModal({
                          modal: 'deleteBoardModal',
                          title: <Text weight={500}>Delete board</Text>,
                          innerProps: {
                            boardName: board.name,
                            onConfirm: async () => {
                              append(board.name);
                              // give user feedback, that it's being deleted
                              await sleep(500);
                              filter((item, _) => item !== board.name);
                            },
                          },
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
    </ManageLayout>
  );
};

export default BoardsPage;
