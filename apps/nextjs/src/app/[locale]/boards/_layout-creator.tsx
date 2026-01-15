import type { JSX, PropsWithChildren } from "react";
import { notFound, redirect } from "next/navigation";
import { AppShellMain } from "@mantine/core";
import { TRPCError } from "@trpc/server";

import { auth } from "@homarr/auth/next";
import { BoardProvider } from "@homarr/boards/context";
import { EditModeProvider } from "@homarr/boards/edit-mode";
import { createLogger } from "@homarr/core/infrastructure/logs";

import { MainHeader } from "~/components/layout/header";
import { BoardLogoWithTitle } from "~/components/layout/logo/board-logo";
import { ClientShell } from "~/components/layout/shell";
import { getCurrentColorSchemeAsync } from "~/theme/color-scheme";
import type { Board } from "./_types";
import type { Params } from "./(content)/_creator";
import { CustomCss } from "./(content)/_custom-css";
import { BoardReadyProvider } from "./(content)/_ready-context";
import { BoardMantineProvider } from "./(content)/_theme";

const logger = createLogger({ module: "createBoardLayout" });

interface CreateBoardLayoutProps<TParams extends Params> {
  headerActions: JSX.Element;
  getInitialBoardAsync: (params: TParams) => Promise<Board>;
}

export const createBoardLayout = <TParams extends Params>({
  headerActions,
  getInitialBoardAsync: getInitialBoard,
}: CreateBoardLayoutProps<TParams>) => {
  const Layout = async ({
    params,
    children,
  }: PropsWithChildren<{
    params: Promise<TParams>;
  }>) => {
    const session = await auth();
    const initialBoard = await getInitialBoard(await params).catch((error) => {
      if (error instanceof TRPCError && error.code === "NOT_FOUND") {
        if (!session) {
          logger.debug("No home board found for anonymous user, redirecting to login");
          redirect("/auth/login");
        }

        logger.warn(error);
        notFound();
      }

      if (error instanceof TRPCError && error.code === "BAD_REQUEST") {
        notFound();
      }

      throw error;
    });
    const colorScheme = await getCurrentColorSchemeAsync();

    return (
      <BoardProvider initialBoard={initialBoard}>
        <BoardReadyProvider>
          <EditModeProvider>
            <BoardMantineProvider defaultColorScheme={colorScheme}>
              <CustomCss />
              <ClientShell hasNavigation={false}>
                <MainHeader
                  logo={<BoardLogoWithTitle size="md" hideTitleOnMobile />}
                  actions={headerActions}
                  hasNavigation={false}
                />
                <AppShellMain>{children}</AppShellMain>
              </ClientShell>
            </BoardMantineProvider>
          </EditModeProvider>
        </BoardReadyProvider>
      </BoardProvider>
    );
  };

  return Layout;
};
