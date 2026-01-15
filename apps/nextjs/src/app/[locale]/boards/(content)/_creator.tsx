import type { Metadata } from "next";
import { TRPCError } from "@trpc/server";

// Placed here because gridstack styles are used for board content
import "~/styles/gridstack.scss";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import { getQueryClient } from "@homarr/api/server";
import { IntegrationProvider } from "@homarr/auth/client";
import { auth } from "@homarr/auth/next";
import { getIntegrationsWithPermissionsAsync } from "@homarr/auth/server";
import { isNullOrWhitespace } from "@homarr/common";
import { createLogger } from "@homarr/core/infrastructure/logs";
import { ErrorWithMetadata } from "@homarr/core/infrastructure/logs/error";
import type { WidgetKind } from "@homarr/definitions";
import { getI18n } from "@homarr/translation/server";
import { prefetchForKindAsync } from "@homarr/widgets/prefetch";

import { createMetaTitle } from "~/metadata";
import { createBoardLayout } from "../_layout-creator";
import type { Board, Item } from "../_types";
import { DynamicClientBoard } from "./_dynamic-client";
import { BoardContentHeaderActions } from "./_header-actions";

const logger = createLogger({ module: "createBoardContentPage" });

export type Params = Record<string, unknown>;

interface Props<TParams extends Params> {
  getInitialBoardAsync: (params: TParams) => Promise<Board>;
}

export const createBoardContentPage = <TParams extends Record<string, unknown>>({
  getInitialBoardAsync: getInitialBoard,
}: Props<TParams>) => {
  return {
    layout: createBoardLayout({
      headerActions: <BoardContentHeaderActions />,
      getInitialBoardAsync: getInitialBoard,
    }),
    // eslint-disable-next-line no-restricted-syntax
    page: async ({ params }: { params: Promise<TParams> }) => {
      const session = await auth();
      const integrations = await getIntegrationsWithPermissionsAsync(session);

      const board = await getInitialBoard(await params);
      const queryClient = getQueryClient();

      // Prefetch item data
      const itemsMap = board.items.reduce((acc, item) => {
        const existing = acc.get(item.kind);
        if (existing) {
          existing.push(item);
        } else {
          acc.set(item.kind, [item]);
        }
        return acc;
      }, new Map<WidgetKind, Item[]>());

      for (const [kind, items] of itemsMap) {
        await prefetchForKindAsync(kind, queryClient, items).catch((error) => {
          logger.error(
            new ErrorWithMetadata(
              "Failed to prefetch widget",
              { widgetKind: kind, itemCount: items.length },
              { cause: error },
            ),
          );
        });
      }

      return (
        <HydrationBoundary state={dehydrate(queryClient)}>
          <IntegrationProvider integrations={integrations}>
            <DynamicClientBoard />
          </IntegrationProvider>
        </HydrationBoundary>
      );
    },
    generateMetadataAsync: async ({ params }: { params: Promise<TParams> }): Promise<Metadata> => {
      try {
        const board = await getInitialBoard(await params);
        const t = await getI18n();

        return {
          title: board.metaTitle ?? createMetaTitle(t("board.content.metaTitle", { boardName: board.name })),
          icons: {
            icon: !isNullOrWhitespace(board.faviconImageUrl) ? board.faviconImageUrl : undefined,
            apple: !isNullOrWhitespace(board.faviconImageUrl) ? board.faviconImageUrl : undefined,
          },
          appleWebApp: {
            startupImage: {
              url: !isNullOrWhitespace(board.faviconImageUrl) ? board.faviconImageUrl : "/logo/logo.png",
            },
          },
        };
      } catch (error) {
        // Ignore not found errors and return empty metadata
        if (error instanceof TRPCError && error.code === "NOT_FOUND") {
          return {};
        }

        throw error;
      }
    },
  };
};
