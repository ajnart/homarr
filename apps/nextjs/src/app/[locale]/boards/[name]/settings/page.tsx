import type { PropsWithChildren } from "react";
import { notFound } from "next/navigation";
import { AccordionControl, AccordionItem, AccordionPanel, Container, Stack, Text, Title } from "@mantine/core";
import {
  IconAlertTriangle,
  IconBrush,
  IconClick,
  IconFileTypeCss,
  IconLayout,
  IconPhoto,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import { TRPCError } from "@trpc/server";

import { api } from "@homarr/api/server";
import { capitalize } from "@homarr/common";
import { db } from "@homarr/db";
import { getServerSettingByKeyAsync } from "@homarr/db/queries";
import type { TranslationObject } from "@homarr/translation";
import { getScopedI18n } from "@homarr/translation/server";
import type { TablerIcon } from "@homarr/ui";

import { getBoardPermissionsAsync } from "~/components/board/permissions/server";
import { ActiveTabAccordion } from "../../../../../components/active-tab-accordion";
import { ColorSettingsContent } from "./_appereance";
import { BackgroundSettingsContent } from "./_background";
import { BehaviorSettingsContent } from "./_behavior";
import { BoardAccessSettings } from "./_board-access";
import { CustomCssSettingsContent } from "./_customCss";
import { DangerZoneSettingsContent } from "./_danger";
import { GeneralSettingsContent } from "./_general";
import { LayoutSettingsContent } from "./_layout";

interface Props {
  params: Promise<{
    name: string;
  }>;
  searchParams: Promise<{
    tab?: keyof TranslationObject["board"]["setting"]["section"];
  }>;
}

const getBoardAndPermissionsAsync = async (params: Awaited<Props["params"]>) => {
  try {
    const board = await api.board.getBoardByName({ name: params.name });
    const { hasFullAccess } = await getBoardPermissionsAsync(board);
    const permissions = hasFullAccess
      ? await api.board.getBoardPermissions({ id: board.id })
      : {
          users: [],
          groups: [],
          inherited: [],
        };

    return { board, permissions };
  } catch (error) {
    // Ignore not found errors and redirect to 404
    // error is already logged in _layout-creator.tsx
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }

    if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
      notFound();
    }

    throw error;
  }
};

export default async function BoardSettingsPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const { board, permissions } = await getBoardAndPermissionsAsync(params);
  const boardSettings = await getServerSettingByKeyAsync(db, "board");
  const { hasFullAccess, hasChangeAccess } = await getBoardPermissionsAsync(board);
  const t = await getScopedI18n("board.setting");

  if (!hasChangeAccess) {
    notFound();
  }

  return (
    <Container>
      <Stack>
        <Title>{t("title", { boardName: capitalize(board.name) })}</Title>
        <ActiveTabAccordion variant="separated" defaultValue={searchParams.tab ?? "general"}>
          <AccordionItemFor value="general" icon={IconSettings}>
            <GeneralSettingsContent board={board} />
          </AccordionItemFor>
          <AccordionItemFor value="layout" icon={IconLayout}>
            <LayoutSettingsContent board={board} />
          </AccordionItemFor>
          <AccordionItemFor value="background" icon={IconPhoto}>
            <BackgroundSettingsContent board={board} />
          </AccordionItemFor>
          <AccordionItemFor value="appearance" icon={IconBrush}>
            <ColorSettingsContent board={board} />
          </AccordionItemFor>
          <AccordionItemFor value="customCss" icon={IconFileTypeCss}>
            <CustomCssSettingsContent board={board} />
          </AccordionItemFor>
          <AccordionItemFor value="behavior" icon={IconClick}>
            <BehaviorSettingsContent board={board} />
          </AccordionItemFor>
          {hasFullAccess && (
            <>
              <AccordionItemFor value="access" icon={IconUser}>
                <BoardAccessSettings board={board} initialPermissions={permissions} />
              </AccordionItemFor>
              <AccordionItemFor value="dangerZone" icon={IconAlertTriangle} danger noPadding>
                <DangerZoneSettingsContent
                  hideVisibility={
                    boardSettings.homeBoardId === board.id || boardSettings.mobileHomeBoardId === board.id
                  }
                />
              </AccordionItemFor>
            </>
          )}
        </ActiveTabAccordion>
      </Stack>
    </Container>
  );
}

type AccordionItemForProps = PropsWithChildren<{
  value: keyof TranslationObject["board"]["setting"]["section"];
  icon: TablerIcon;
  danger?: boolean;
  noPadding?: boolean;
}>;

const AccordionItemFor = async ({ value, children, icon: Icon, danger, noPadding }: AccordionItemForProps) => {
  const t = await getScopedI18n("board.setting.section");
  return (
    <AccordionItem
      value={value}
      styles={
        danger
          ? {
              item: {
                "--__item-border-color": "rgba(248,81,73,0.4)",
                borderWidth: 4,
              },
            }
          : undefined
      }
    >
      <AccordionControl icon={<Icon />}>
        <Text fw="bold" size="lg">
          {t(`${value}.title`)}
        </Text>
      </AccordionControl>
      <AccordionPanel styles={noPadding ? { content: { paddingRight: 0, paddingLeft: 0 } } : undefined}>
        {children}
      </AccordionPanel>
    </AccordionItem>
  );
};
