import {
  ActionIcon,
  Badge,
  Button,
  Card,
  CardSection,
  Grid,
  GridCol,
  Group,
  Menu,
  MenuTarget,
  Stack,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconDeviceMobile, IconDotsVertical, IconHomeFilled, IconLock, IconWorld } from "@tabler/icons-react";

import type { RouterOutputs } from "@homarr/api";
import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { getScopedI18n } from "@homarr/translation/server";
import { Link, UserAvatar } from "@homarr/ui";

import { getBoardPermissionsAsync } from "~/components/board/permissions/server";
import { ManageContainer } from "~/components/manage/manage-container";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { BoardCardMenuDropdown } from "./_components/board-card-menu-dropdown";
import { CreateBoardButton } from "./_components/create-board-button";

export default async function ManageBoardsPage() {
  const t = await getScopedI18n("management.page.board");
  const session = await auth();
  const boards = await api.board.getAllBoards();
  const canCreateBoards = session?.user.permissions.includes("board-create");

  return (
    <ManageContainer>
      <DynamicBreadcrumb />
      <Stack>
        <Group justify="space-between">
          <Title mb="md">{t("title")}</Title>
          {canCreateBoards && <CreateBoardButton />}
        </Group>

        <Grid mb={{ base: "xl", md: 0 }}>
          {boards.map((board) => (
            <GridCol span={{ base: 12, md: 6 }} key={board.id}>
              <BoardCard board={board} />
            </GridCol>
          ))}
        </Grid>
      </Stack>
    </ManageContainer>
  );
}

interface BoardCardProps {
  board: RouterOutputs["board"]["getAllBoards"][number];
}

const BoardCard = async ({ board }: BoardCardProps) => {
  const t = await getScopedI18n("management.page.board");
  const { hasChangeAccess: isMenuVisible } = await getBoardPermissionsAsync(board);
  const visibility = board.isPublic ? "public" : "private";
  const VisibilityIcon = board.isPublic ? IconWorld : IconLock;

  return (
    <Card radius="lg" withBorder>
      <CardSection p="sm" withBorder>
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <Tooltip label={t(`visibility.${visibility}`)}>
              <VisibilityIcon size={20} stroke={1.5} />
            </Tooltip>
            <Text fw="bolder" tt="uppercase">
              {board.name}
            </Text>
          </Group>

          <Group>
            {board.isHome && (
              <Tooltip label={t("action.setHomeBoard.badge.tooltip")}>
                <Badge tt="none" color="yellow" variant="light" leftSection={<IconHomeFilled size=".7rem" />}>
                  {t("action.setHomeBoard.badge.label")}
                </Badge>
              </Tooltip>
            )}

            {board.isMobileHome && (
              <Tooltip label={t("action.setMobileHomeBoard.badge.tooltip")}>
                <Badge tt="none" color="yellow" variant="light" leftSection={<IconDeviceMobile size=".7rem" />}>
                  {t("action.setMobileHomeBoard.badge.label")}
                </Badge>
              </Tooltip>
            )}

            {board.creator && (
              <Group gap="xs">
                <UserAvatar user={board.creator} size="sm" />
                <Text>{board.creator.name}</Text>
              </Group>
            )}
          </Group>
        </Group>
      </CardSection>

      <CardSection>
        <Group gap={0} wrap="nowrap">
          <Button
            style={{ border: "none", borderRadius: 0 }}
            component={Link}
            href={`/boards/${board.name}`}
            variant="default"
            fullWidth
          >
            {t("action.open.label")}
          </Button>
          {isMenuVisible && (
            <Menu position="bottom-end">
              <MenuTarget>
                <ActionIcon
                  style={{ borderTop: "none", borderBottom: "none", borderRight: "none", borderRadius: 0 }}
                  variant="default"
                  size="lg"
                >
                  <IconDotsVertical size={16} stroke={1.5} />
                </ActionIcon>
              </MenuTarget>
              <BoardCardMenuDropdown board={board} />
            </Menu>
          )}
        </Group>
      </CardSection>
    </Card>
  );
};
