"use client";

import { Anchor, Card, Flex, Group, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import combineClasses from "clsx";

import type { RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import { useRegisterSpotlightContextResults } from "@homarr/spotlight";
import { MaskedOrNormalImage } from "@homarr/ui";

import type { WidgetComponentProps } from "../definition";
import classes from "./bookmark.module.css";

export default function BookmarksWidget({ options, itemId }: WidgetComponentProps<"bookmarks">) {
  const board = useRequiredBoard();
  const [data] = clientApi.app.byIds.useSuspenseQuery(options.items, {
    select(data) {
      return data.sort((appA, appB) => options.items.indexOf(appA.id) - options.items.indexOf(appB.id));
    },
  });

  useRegisterSpotlightContextResults(
    `bookmark-${itemId}`,
    data
      .filter((app) => app.href !== null)
      .map((app) => ({
        id: app.id,
        name: app.name,
        icon: app.iconUrl,
        interaction() {
          return {
            type: "link",
            // We checked above that app.href is defined
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            href: app.href!,
            newTab: false,
          };
        },
      })),
    [data],
  );

  return (
    <Stack h="100%" gap="sm" p="sm">
      {options.title.length > 0 && (
        <Title order={4} px="0.25rem">
          {options.title}
        </Title>
      )}
      {(options.layout === "grid" || options.layout === "gridHorizontal") && (
        <GridLayout
          data={data}
          itemDirection={options.layout === "gridHorizontal" ? "horizontal" : "vertical"}
          hideTitle={options.hideTitle}
          hideIcon={options.hideIcon}
          hideHostname={options.hideHostname}
          openNewTab={options.openNewTab}
          hasIconColor={board.iconColor !== null}
        />
      )}
      {options.layout !== "grid" && options.layout !== "gridHorizontal" && (
        <FlexLayout
          data={data}
          direction={options.layout}
          hideTitle={options.hideTitle}
          hideIcon={options.hideIcon}
          hideHostname={options.hideHostname}
          openNewTab={options.openNewTab}
          hasIconColor={board.iconColor !== null}
        />
      )}
    </Stack>
  );
}

interface FlexLayoutProps {
  data: RouterOutputs["app"]["byIds"];
  direction: "row" | "column";
  hideTitle: boolean;
  hideIcon: boolean;
  hideHostname: boolean;
  openNewTab: boolean;
  hasIconColor: boolean;
}

const FlexLayout = ({
  data,
  direction,
  hideTitle,
  hideIcon,
  hideHostname,
  openNewTab,
  hasIconColor,
}: FlexLayoutProps) => {
  const board = useRequiredBoard();
  return (
    <Flex direction={direction} gap="0" w="100%">
      {data.map((app) => (
        <div key={app.id} style={{ display: "flex", flex: "1", flexDirection: direction }}>
          <UnstyledButton
            component="a"
            href={app.href ?? undefined}
            target={openNewTab ? "_blank" : "_self"}
            rel="noopener noreferrer"
            key={app.id}
            w="100%"
          >
            <Card radius={board.itemRadius} className={classes.card} w="100%" display="flex" p={4} h="100%">
              {direction === "row" ? (
                <VerticalItem
                  app={app}
                  hideTitle={hideTitle}
                  hideIcon={hideIcon}
                  hideHostname={hideHostname}
                  hasIconColor={hasIconColor}
                />
              ) : (
                <HorizontalItem
                  app={app}
                  hideTitle={hideTitle}
                  hideIcon={hideIcon}
                  hideHostname={hideHostname}
                  hasIconColor={hasIconColor}
                />
              )}
            </Card>
          </UnstyledButton>
        </div>
      ))}
    </Flex>
  );
};

interface GridLayoutProps {
  data: RouterOutputs["app"]["byIds"];
  hideTitle: boolean;
  hideIcon: boolean;
  hideHostname: boolean;
  openNewTab: boolean;
  itemDirection: "horizontal" | "vertical";
  hasIconColor: boolean;
}

const GridLayout = ({
  data,
  hideTitle,
  hideIcon,
  hideHostname,
  openNewTab,
  itemDirection,
  hasIconColor,
}: GridLayoutProps) => {
  const board = useRequiredBoard();

  return (
    <Flex miw="100%" gap={4} wrap="wrap" style={{ flex: 1 }}>
      {data.map((app) => (
        <UnstyledButton
          component="a"
          href={app.href ?? undefined}
          target={openNewTab ? "_blank" : "_self"}
          rel="noopener noreferrer"
          key={app.id}
          flex="1"
        >
          <Card
            h="100%"
            className={combineClasses(classes.card, classes["card-grid"])}
            radius={board.itemRadius}
            p="xs"
          >
            {itemDirection === "horizontal" ? (
              <HorizontalItem
                app={app}
                hideTitle={hideTitle}
                hideIcon={hideIcon}
                hideHostname={hideHostname}
                hasIconColor={hasIconColor}
              />
            ) : (
              <VerticalItem
                app={app}
                hideTitle={hideTitle}
                hideIcon={hideIcon}
                hideHostname={hideHostname}
                hasIconColor={hasIconColor}
              />
            )}
          </Card>
        </UnstyledButton>
      ))}
    </Flex>
  );
};

const VerticalItem = ({
  app,
  hideTitle,
  hideIcon,
  hideHostname,
  hasIconColor,
}: {
  app: RouterOutputs["app"]["byIds"][number];
  hideTitle: boolean;
  hideIcon: boolean;
  hideHostname: boolean;
  hasIconColor: boolean;
}) => {
  return (
    <Stack h="100%" miw={16} gap="sm" justify={"center"}>
      {!hideTitle && (
        <Text fw={700} ta="center" size="xs">
          {app.name}
        </Text>
      )}
      {!hideIcon && (
        <MaskedOrNormalImage
          imageUrl={app.iconUrl}
          hasColor={hasIconColor}
          alt={app.name}
          className={classes.bookmarkIcon}
          style={{
            width: hideHostname && hideTitle ? "min(max(100%, 16px), 40px)" : 40,
            height: hideHostname && hideTitle ? "min(max(100%, 16px), 40px)" : 40,
            overflow: "auto",
            flex: "unset",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      )}
      {!hideHostname && (
        <Anchor ta="center" component="span" size="xs">
          {app.href ? new URL(app.href).hostname : undefined}
        </Anchor>
      )}
    </Stack>
  );
};

const HorizontalItem = ({
  app,
  hideTitle,
  hideIcon,
  hideHostname,
  hasIconColor,
}: {
  app: RouterOutputs["app"]["byIds"][number];
  hideTitle: boolean;
  hideIcon: boolean;
  hideHostname: boolean;
  hasIconColor: boolean;
}) => {
  return (
    <Group wrap="nowrap" gap="xs" h="100%" justify="start">
      {!hideIcon && (
        <MaskedOrNormalImage
          imageUrl={app.iconUrl}
          hasColor={hasIconColor}
          alt={app.name}
          className={classes.bookmarkIcon}
          style={{
            overflow: "auto",
            width: hideHostname ? 16 : 24,
            height: hideHostname ? 16 : 24,
            flex: "unset",
          }}
        />
      )}
      {!(hideTitle && hideHostname) && (
        <>
          <Stack justify="space-between" gap={0}>
            {!hideTitle && (
              <Text fw={700} size="xs" lineClamp={hideHostname ? 2 : 1}>
                {app.name}
              </Text>
            )}

            {!hideHostname && (
              <Anchor component="span" size="xs">
                {app.href ? new URL(app.href).hostname : undefined}
              </Anchor>
            )}
          </Stack>
        </>
      )}
    </Group>
  );
};
