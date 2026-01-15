import { notFound } from "next/navigation";
import {
  ActionIcon,
  Anchor,
  Group,
  Image,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Title,
  Tooltip,
} from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { z } from "zod/v4";

import type { RouterOutputs } from "@homarr/api";
import { api } from "@homarr/api/server";
import { auth } from "@homarr/auth/next";
import { humanFileSize } from "@homarr/common";
import type { inferSearchParamsFromSchema } from "@homarr/common/types";
import { createLocalImageUrl } from "@homarr/icons/local";
import { getI18n } from "@homarr/translation/server";
import { Link, SearchInput, TablePagination, UserAvatar } from "@homarr/ui";

import { ManageContainer } from "~/components/manage/manage-container";
import { DynamicBreadcrumb } from "~/components/navigation/dynamic-breadcrumb";
import { CopyMedia } from "./_actions/copy-media";
import { DeleteMedia } from "./_actions/delete-media";
import { IncludeFromAllUsersSwitch } from "./_actions/show-all";
import { UploadMediaButton } from "./_actions/upload-media";

const searchParamsSchema = z.object({
  search: z.string().optional(),
  includeFromAllUsers: z
    .string()
    .regex(/true|false/)
    .catch("false")
    .transform((value) => value === "true"),
  pageSize: z.string().regex(/\d+/).transform(Number).catch(10),
  page: z.string().regex(/\d+/).transform(Number).catch(1),
});

interface MediaListPageProps {
  searchParams: Promise<inferSearchParamsFromSchema<typeof searchParamsSchema>>;
}

export default async function GroupsListPage(props: MediaListPageProps) {
  const session = await auth();

  if (!session) {
    return notFound();
  }

  const t = await getI18n();
  const searchParams = searchParamsSchema.parse(await props.searchParams);
  const { items: medias, totalCount } = await api.media.getPaginated(searchParams);

  return (
    <ManageContainer>
      <DynamicBreadcrumb />
      <Stack>
        <Title>{t("media.plural")}</Title>
        <Group justify="space-between">
          <Group>
            <SearchInput placeholder={`${t("media.search")}...`} defaultValue={searchParams.search} />
            {session.user.permissions.includes("media-view-all") && (
              <IncludeFromAllUsersSwitch defaultChecked={searchParams.includeFromAllUsers} />
            )}
          </Group>

          {session.user.permissions.includes("media-upload") && <UploadMediaButton />}
        </Group>
        <Table striped highlightOnHover>
          <TableThead>
            <TableTr>
              <TableTh></TableTh>
              <TableTh>{t("media.field.name")}</TableTh>
              <TableTh>{t("media.field.size")}</TableTh>
              <TableTh>{t("media.field.creator")}</TableTh>
              <TableTh></TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {medias.map((media) => (
              <Row key={media.id} media={media} />
            ))}
          </TableTbody>
        </Table>

        {/* Added margin to not hide pagination behind affix-button */}
        <Group justify="end" mb={48}>
          <TablePagination total={Math.ceil(totalCount / searchParams.pageSize)} />
        </Group>
      </Stack>
    </ManageContainer>
  );
}

interface RowProps {
  media: RouterOutputs["media"]["getPaginated"]["items"][number];
}

const Row = async ({ media }: RowProps) => {
  const session = await auth();
  const t = await getI18n();
  const canDelete = media.creatorId === session?.user.id || session?.user.permissions.includes("media-full-all");

  return (
    <TableTr>
      <TableTd w={64}>
        <Image
          // Switched to mantine image because next/image doesn't support svgs
          src={createLocalImageUrl(media.id)}
          alt={media.name}
          w={64}
          h={64}
          fit="contain"
        />
      </TableTd>
      <TableTd>{media.name}</TableTd>
      <TableTd>{humanFileSize(media.size)}</TableTd>
      <TableTd>
        {media.creator ? (
          <Group gap="sm">
            <UserAvatar user={media.creator} size="sm" />
            <Anchor component={Link} href={`/manage/users/${media.creator.id}/general`} size="sm">
              {media.creator.name}
            </Anchor>
          </Group>
        ) : (
          "-"
        )}
      </TableTd>
      <TableTd w={64}>
        <Group wrap="nowrap" gap="xs">
          <CopyMedia media={media} />
          <Tooltip label={t("media.action.open.label")} openDelay={500}>
            <ActionIcon
              component="a"
              href={createLocalImageUrl(media.id)}
              target="_blank"
              color="gray"
              variant="subtle"
            >
              <IconExternalLink size={16} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
          {canDelete && <DeleteMedia media={media} />}
        </Group>
      </TableTd>
    </TableTr>
  );
};
