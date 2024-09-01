import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure, useListState } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  IconBox,
  IconCategory,
  IconCopy,
  IconCursorText,
  IconDeviceFloppy,
  IconDotsVertical,
  IconDownload,
  IconFolderFilled,
  IconLock,
  IconLockOff,
  IconPlus,
  IconStack,
  IconStarFilled,
  IconTrash,
} from '@tabler/icons-react';
import { GetServerSidePropsContext, InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { RenameBoardModal } from '~/components/Dashboard/Modals/RenameBoard/RenameBoardModal';
import { openCreateBoardModal } from '~/components/Manage/Board/create-board.modal';
import { openDeleteBoardModal } from '~/components/Manage/Board/delete-board.modal';
import { ManageLayout } from '~/components/layout/Templates/ManageLayout';
import { boardRouter } from '~/server/api/routers/board';
import { getServerAuthSession } from '~/server/auth';
import { sleep } from '~/tools/client/time';
import { getServerSideTranslations } from '~/tools/server/getServerSideTranslations';
import { checkForSessionOrAskForLogin } from '~/tools/server/loginBuilder';
import { manageNamespaces } from '~/tools/server/translation-namespaces';
import { api } from '~/utils/api';

// Infer return type from the `getServerSideProps` function
export default function BoardsPage({
  boards,
  session,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [openedRenameBoardModal, { open: openRenameBoardModal, close: closeRenameBoardModal }] =
    useDisclosure(false);
  const [renameBoardName, setRenameBoardName] = useState<{ boardName: string }>();

  const { data, refetch } = api.boards.all.useQuery(undefined, {
    initialData: boards,
    cacheTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
  const { mutateAsync } = api.user.makeDefaultDashboard.useMutation({
    onSettled: () => {
      void refetch();
    },
  });

  const utils = api.useUtils();

  const { mutateAsync: mutateDuplicateBoardAsync } = api.boards.duplicateBoard.useMutation({
    onSettled: () => {
      void utils.boards.all.invalidate();
    },
    onError: (error) => {
      notifications.show({
        title: 'An error occurred while duplicating',
        message: error.message,
      });
    },
  });

  const [deletingDashboards, { append, filter }] = useListState<string>([]);
  const downloadAllBoards = async () => {
    const a = document.createElement('a');
    a.href = `/api/download`;
    a.click();
  };

  const { t } = useTranslation('manage/boards');

  const metaTitle = `${t('metaTitle')} • Homarr`;

  return (
    <ManageLayout>
      <Head>
        <title>{metaTitle}</title>
      </Head>

      <Modal
        opened={openedRenameBoardModal}
        onClose={closeRenameBoardModal}
        title={t('cards.menu.rename.modal.title', { name: renameBoardName?.boardName })}
      >
        <RenameBoardModal
          boardName={renameBoardName?.boardName as string}
          configNames={data.map((board) => board.name)}
          onClose={closeRenameBoardModal}
        />
      </Modal>

      <Group position="apart">
        <Title mb="xl">{t('pageTitle')}</Title>
        {session?.user.isAdmin && (
          <Group>
            <Button
              variant="outline"
              onClick={downloadAllBoards}
              leftIcon={<IconDownload size="1rem" />}
            >
              Download all boards
            </Button>
            <Button
              onClick={openCreateBoardModal}
              leftIcon={<IconPlus size="1rem" />}
              variant="default"
            >
              {t('buttons.create')}
            </Button>
          </Group>
        )}
      </Group>

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
                <Badge leftSection={<IconFolderFilled size=".7rem" />} color="pink" variant="light">
                  {t('cards.badges.fileSystem')}
                </Badge>
                <Badge
                  leftSection={
                    board.allowGuests ? <IconLock size=".7rem" /> : <IconLockOff size=".7rem" />
                  }
                  color="green"
                  variant="light"
                >
                  {board.allowGuests ? t('common:public') : t('common:restricted')}
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
                    onClick={async () => {
                      await mutateDuplicateBoardAsync({
                        boardName: board.name,
                      });
                    }}
                    icon={<IconCopy size={'1rem'} />}
                  >
                    {t('cards.menu.duplicate')}
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setRenameBoardName({
                        boardName: board.name as string,
                      });
                      openRenameBoardModal();
                    }}
                    icon={<IconCursorText size={'1rem'} />}
                    disabled={board.name === 'default'}
                  >
                    {t('cards.menu.rename.label')}
                  </Menu.Item>
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
                  {session?.user.isAdmin && (
                    <>
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
    </ManageLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getServerAuthSession({ req: context.req, res: context.res });
  const result = checkForSessionOrAskForLogin(
    context,
    session,
    () => session?.user.isAdmin == true
  );
  if (result !== undefined) {
    return result;
  }

  const caller = boardRouter.createCaller({
    session: session,
    cookies: context.req.cookies,
  });

  const boards = await caller.all();

  const translations = await getServerSideTranslations(
    manageNamespaces,
    context.locale,
    context.req,
    context.res
  );

  return {
    props: {
      boards,
      session,
      ...translations,
    },
  };
};
