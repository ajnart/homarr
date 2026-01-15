"use client";

import { ActionIcon, Anchor, Avatar, Badge, Card, Group, Image, ScrollArea, Stack, Text, Tooltip } from "@mantine/core";
import { IconThumbDown, IconThumbUp } from "@tabler/icons-react";

import type { RouterInputs, RouterOutputs } from "@homarr/api";
import { clientApi } from "@homarr/api/client";
import { useRequiredBoard } from "@homarr/boards/context";
import type { MediaRequestStatus } from "@homarr/integrations/types";
import { mediaAvailabilityConfiguration, mediaRequestStatusConfiguration } from "@homarr/integrations/types";
import { useScopedI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../../definition";
import { NoIntegrationDataError } from "../../errors/no-data-integration";

export default function MediaServerWidget({
  integrationIds,
  isEditMode,
  options,
  width,
}: WidgetComponentProps<"mediaRequests-requestList">) {
  const [mediaRequests] = clientApi.widget.mediaRequests.getLatestRequests.useSuspenseQuery(
    {
      integrationIds,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const utils = clientApi.useUtils();
  clientApi.widget.mediaRequests.subscribeToLatestRequests.useSubscription(
    {
      integrationIds,
    },
    {
      onData(data) {
        utils.widget.mediaRequests.getLatestRequests.setData({ integrationIds }, (prevData) => {
          if (!prevData) return [];

          const filteredData = prevData.filter(({ integrationId }) => integrationId !== data.integrationId);
          const newData = filteredData.concat(
            data.requests.map((request) => ({ ...request, integrationId: data.integrationId })),
          );
          return newData.sort((dataA, dataB) => {
            if (dataA.status === dataB.status) {
              return dataB.createdAt.getTime() - dataA.createdAt.getTime();
            }

            return (
              mediaRequestStatusConfiguration[dataA.status].position -
              mediaRequestStatusConfiguration[dataB.status].position
            );
          });
        });
      },
    },
  );

  if (mediaRequests.length === 0) throw new NoIntegrationDataError();

  return (
    <ScrollArea
      className="mediaRequests-list-scrollArea"
      scrollbarSize="md"
      style={{ pointerEvents: isEditMode ? "none" : undefined }}
    >
      <Stack className="mediaRequests-list-list" gap="xs" p="sm">
        {mediaRequests.map((mediaRequest) => (
          <MediaRequestCard
            key={`${mediaRequest.integrationId}-${mediaRequest.id}`}
            request={mediaRequest}
            isTiny={width <= 256}
            options={options}
          />
        ))}
      </Stack>
    </ScrollArea>
  );
}

interface MediaRequestCardProps {
  request: RouterOutputs["widget"]["mediaRequests"]["getLatestRequests"][number];
  isTiny: boolean;
  options: WidgetComponentProps<"mediaRequests-requestList">["options"];
}

const MediaRequestCard = ({ request, isTiny, options }: MediaRequestCardProps) => {
  const board = useRequiredBoard();
  const t = useScopedI18n("widget.mediaRequests-requestList");

  return (
    <Card
      className={`mediaRequests-list-item-wrapper mediaRequests-list-item-${request.type} mediaRequests-list-item-${request.status}`}
      radius={board.itemRadius}
      p="xs"
      withBorder
    >
      <Image
        className="mediaRequests-list-item-background"
        src={request.backdropImageUrl}
        pos="absolute"
        w="100%"
        h="100%"
        opacity={0.2}
        top={0}
        left={0}
        alt=""
      />

      <Group
        className="mediaRequests-list-item-contents"
        h="100%"
        style={{ zIndex: 1 }}
        justify="space-between"
        wrap="nowrap"
        gap={0}
      >
        <Group className="mediaRequests-list-item-left-side" h="100%" gap="md" wrap="nowrap" flex={1}>
          {!isTiny && (
            <Image
              className="mediaRequests-list-item-poster"
              src={request.posterImagePath}
              h={40}
              w="auto"
              radius={"md"}
            />
          )}

          <Stack gap={0} w="100%">
            <Group justify="space-between" gap="xs" className="mediaRequests-list-item-top-group">
              <Group gap="xs">
                <Text className="mediaRequests-list-item-media-year" size="xs">
                  {request.airDate?.getFullYear() ?? t("toBeDetermined")}
                </Text>
                {!isTiny && (
                  <Badge
                    className="mediaRequests-list-item-media-status"
                    color={mediaAvailabilityConfiguration[request.availability].color}
                    variant="light"
                    size="xs"
                  >
                    {t(`availability.${request.availability}`)}
                  </Badge>
                )}
              </Group>
              <Group className="mediaRequests-list-item-request-user" gap={4} wrap="nowrap">
                <Avatar
                  className="mediaRequests-list-item-request-user-avatar"
                  src={request.requestedBy?.avatar}
                  size="xs"
                />
                <Anchor
                  className="mediaRequests-list-item-request-user-name"
                  href={request.requestedBy?.link}
                  c="var(--mantine-color-text)"
                  target={options.linksTargetNewTab ? "_blank" : "_self"}
                  fz="xs"
                  lineClamp={1}
                  style={{ wordBreak: "break-all" }}
                >
                  {(request.requestedBy?.displayName ?? "") || "unknown"}
                </Anchor>
              </Group>
            </Group>
            <Group gap="xs" justify="space-between" className="mediaRequests-list-item-bottom-group">
              <Anchor
                className="mediaRequests-list-item-info-second-line mediaRequests-list-item-media-title"
                href={request.href}
                c="var(--mantine-color-text)"
                target={options.linksTargetNewTab ? "_blank" : "_self"}
                fz={isTiny ? "xs" : "sm"}
                fw={"bold"}
                title={request.name}
                lineClamp={1}
              >
                {request.name || "unknown"}
              </Anchor>
              {request.status === "pending" ? (
                <DecisionButtons requestId={request.id} integrationId={request.integrationId} />
              ) : (
                <StatusBadge status={request.status} />
              )}
            </Group>
          </Stack>
        </Group>
      </Group>
    </Card>
  );
};

interface DecisionButtonsProps {
  requestId: number;
  integrationId: string;
}

const DecisionButtons = ({ requestId, integrationId }: DecisionButtonsProps) => {
  const { mutate: mutateRequestAnswer } = clientApi.widget.mediaRequests.answerRequest.useMutation();
  const t = useScopedI18n("widget.mediaRequests-requestList");
  const handleDecision = (answer: RouterInputs["widget"]["mediaRequests"]["answerRequest"]["answer"]) => {
    mutateRequestAnswer({
      integrationId,
      requestId,
      answer,
    });
  };

  return (
    <Group className="mediaRequests-list-item-pending-buttons" gap="sm">
      <Tooltip label={t("pending.approve")}>
        <ActionIcon
          className="mediaRequests-list-item-pending-button-approve"
          variant="light"
          color="green"
          size="xs"
          radius="md"
          onClick={() => {
            handleDecision("approve");
          }}
        >
          <IconThumbUp size={16} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label={t("pending.decline")}>
        <ActionIcon
          className="mediaRequests-list-item-pending-button-decline"
          variant="light"
          color="red"
          size="xs"
          radius="md"
          onClick={() => {
            handleDecision("decline");
          }}
        >
          <IconThumbDown size={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
};

interface StatusBadgeProps {
  status: MediaRequestStatus;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const tStatus = useScopedI18n("widget.mediaRequests-requestList.status");

  return (
    <Badge size="xs" color={mediaRequestStatusConfiguration[status].color} variant="light">
      {tStatus(status)}
    </Badge>
  );
};
