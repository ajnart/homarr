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
  Text,
  Title,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { IconDotsVertical, IconFolderFilled, IconPlus, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { CommonHeader } from '~/components/layout/common-header';
import { sleep } from '~/tools/client/time';
import { api } from '~/utils/api';

const BoardsPage = () => {
  const { data } = api.config.all.useQuery();

  const [deletingDashboards, { append, filter }] = useListState<string>([]);

  return (
    <ManageLayout>
      <CommonHeader>
        <title>Boards • Homarr</title>
      </CommonHeader>

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
              <LoadingOverlay visible={deletingDashboards.includes(board)} />

              <Text weight={500} mb="xs">
                {board}
              </Text>

              <Group mb="xl">
                <Badge leftSection={<IconFolderFilled size=".7rem" />} color="pink" variant="light">
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
                        modals.openContextModal({
                          modal: 'deleteBoardModal',
                          title: <Text weight={500}>Delete board</Text>,
                          innerProps: {
                            boardName: board,
                            onConfirm: async () => {
                              append(board);
                              // give user feedback, that it's being deleted
                              await sleep(500);
                              filter((item, _) => item !== board);
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
