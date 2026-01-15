import { Badge, Card } from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import combineClasses from "clsx";
import { NoIntegrationSelectedError } from "node_modules/@homarr/widgets/src/errors";
import { ErrorBoundary } from "react-error-boundary";

import { useRequiredBoard } from "@homarr/boards/context";
import { useEditMode } from "@homarr/boards/edit-mode";
import { useSettings } from "@homarr/settings";
import { loadWidgetDynamic, reduceWidgetOptionsWithDefaultValues, widgetImports } from "@homarr/widgets";
import { WidgetError } from "@homarr/widgets/errors";

import type { SectionItem } from "~/app/[locale]/boards/_types";
import classes from "../sections/item.module.css";
import { useItemActions } from "./item-actions";
import itemContentClasses from "./item-content.module.css";
import { BoardItemMenu } from "./item-menu";

interface BoardItemContentProps {
  item: SectionItem;
}

const getOverflowFromKind = (kind: SectionItem["kind"]) => {
  if (kind === "iframe") return "hidden";
  if (kind === "systemResources") return "visible";
  return undefined;
};

export const BoardItemContent = ({ item }: BoardItemContentProps) => {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  const board = useRequiredBoard();

  return (
    <>
      <Card
        ref={ref}
        className={combineClasses(
          classes.itemCard,
          `${item.kind}-wrapper`,
          "grid-stack-item-content",
          item.advancedOptions.customCssClasses.join(" "),
        )}
        radius={board.itemRadius}
        withBorder
        styles={{
          root: {
            "--opacity": board.opacity / 100,
            containerType: "size",
            overflow: getOverflowFromKind(item.kind),
            "--border-color": item.advancedOptions.borderColor !== "" ? item.advancedOptions.borderColor : undefined,
          },
        }}
        p={0}
      >
        <InnerContent item={item} width={width} height={height} />
      </Card>
      {item.advancedOptions.title?.trim() && (
        <Badge
          pos="absolute"
          // It's 4 because of the mantine-react-table that has z-index 3
          style={{ zIndex: 4 }}
          top={2}
          left={16}
          size="xs"
          radius={board.itemRadius}
          styles={{
            root: {
              "--border-color": item.advancedOptions.borderColor !== "" ? item.advancedOptions.borderColor : undefined,
              "--opacity": board.opacity / 100,
            },
          }}
          className={itemContentClasses.badge}
          c="var(--mantine-color-text)"
        >
          {item.advancedOptions.title}
        </Badge>
      )}
    </>
  );
};

interface InnerContentProps {
  item: SectionItem;
  width: number;
  height: number;
}

const InnerContent = ({ item, ...dimensions }: InnerContentProps) => {
  const settings = useSettings();
  const board = useRequiredBoard();
  const [isEditMode] = useEditMode();
  const Comp = loadWidgetDynamic(item.kind);
  const { definition } = widgetImports[item.kind];
  const options = reduceWidgetOptionsWithDefaultValues(item.kind, settings, item.options);
  const newItem = { ...item, options };
  const { updateItemOptions } = useItemActions();
  const updateOptions = ({ newOptions }: { newOptions: Record<string, unknown> }) =>
    updateItemOptions({ itemId: item.id, newOptions });
  const widgetSupportsIntegrations =
    "supportedIntegrations" in definition && definition.supportedIntegrations.length >= 1;

  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ resetErrorBoundary, error }) => (
            <>
              <BoardItemMenu offset={4} item={newItem} resetErrorBoundary={resetErrorBoundary} />
              <WidgetError kind={item.kind} error={error as unknown} resetErrorBoundary={resetErrorBoundary} />
            </>
          )}
        >
          <Throw
            error={new NoIntegrationSelectedError()}
            when={
              widgetSupportsIntegrations &&
              item.integrationIds.length === 0 &&
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              (!("integrationsRequired" in definition) || definition.integrationsRequired !== false)
            }
          />
          <BoardItemMenu offset={4} item={newItem} />
          <Comp
            options={options as never}
            integrationIds={item.integrationIds}
            isEditMode={isEditMode}
            boardId={board.id}
            itemId={item.id}
            setOptions={(partialNewOptions) =>
              updateOptions({
                newOptions: {
                  ...options,
                  ...partialNewOptions.newOptions,
                },
              })
            }
            {...dimensions}
          />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

const Throw = ({ when, error }: { when: boolean; error: Error }) => {
  if (when) throw error;
  return null;
};
