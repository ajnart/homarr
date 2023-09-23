import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Menu,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useListState } from '@mantine/hooks';
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
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { openCreateBoardModal } from '~/components/Manage/Board/create-board.modal';
import { openDeleteBoardModal } from '~/components/Manage/Board/delete-board.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { getServerAuthSession } from '~/server/auth';
import { sleep } from '~/tools/client/time';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

const BoardsPage = () => {
  const context = api.useContext();
  const { data: sessionData } = useSession();
  const { data } = api.boards.all.useQuery();
  const { mutateAsync } = api.user.makeDefaultDashboard.useMutation({
    onSettled: () => {
      void context.boards.invalidate();
    },
  });

  const [deletingDashboards, { append, filter }] = useListState<string>([]);

  const { t } = useTranslation('manage/boards');

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Group position="apart">
        <Title mb="xl">{t('pageTitle')}</Title>
        {sessionData?.user.isAdmin && (
          <Button
            onClick={openCreateBoardModal}
            leftIcon={<IconPlus size="1rem" />}
            variant="default"
          >
            {t('buttons.create')}
          </Button>
        )}
      </Group>

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
                    {t('cards.badges.fileSystem')}
                  </Badge>
                  {board.isDefaultForUser && (
                    <Badge
                      leftSection={<IconStarFilled size=".7rem" />}
                      color="yellow"
                      variant="light"
                    >
                      {t('cards.badges.default')}
                    </Badge>
                  )}
                </Group>
              </Group>

              <Stack spacing={3}>
                <Group position="apart">
                  <Group spacing="xs">
                    <IconBox opacity={0.7} size="1rem" />
                    <Text color="dimmed">{t('cards.statistics.apps')}</Text>
                  </Group>
                  <Text>{board.countApps}</Text>
                </Group>

                <Group position="apart">
                  <Group spacing="xs">
                    <IconStack opacity={0.7} size="1rem" />
                    <Text color="dimmed">{t('cards.statistics.widgets')}</Text>
                  </Group>
                  <Text>{board.countWidgets}</Text>
                </Group>

                <Group position="apart">
                  <Group spacing="xs">
                    <IconCategory opacity={0.7} size="1rem" />
                    <Text color="dimmed">{t('cards.statistics.categories')}</Text>
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
                  {t('cards.buttons.view')}
                </Button>
                <Menu width={240} withinPortal position="bottom-end">
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
                      <Text size="sm">{t('cards.menu.setAsDefault')}</Text>
                    </Menu.Item>
                    {sessionData?.user.isAdmin && (
                      <>
                        <Menu.Divider />
                        <Menu.Item
                          onClick={async () => {
                            openDeleteBoardModal({
                              boardName: board.name,
                              onConfirm: async () => {
                                append(board.name);
                                // give user feedback, that it's being deleted
                                await sleep(500);
                                filter((item, _) => item !== board.name);
                              },
                            });
                          }}
                          disabled={board.name === 'default'}
                          icon={<IconTrash size="1rem" />}
                          color="red"
                        >
                          <Text size="sm">{t('cards.menu.delete.label')}</Text>
                          {board.name === 'default' && (
                            <Text size="xs">{t('cards.menu.delete.disabled')}</Text>
                          )}
                        </Menu.Item>
                      </>
                    )}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = await getServerAuthSession(ctx);

  const result = checkForSessionOrAskForLogin(ctx, session, () => true);
  if (result) {
    return result;
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

export default BoardsPage;
