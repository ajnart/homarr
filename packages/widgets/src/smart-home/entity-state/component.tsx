"use client";

import { useCallback } from "react";
import { Center, Stack, Text, UnstyledButton } from "@mantine/core";
import { IconBinaryTree } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useRegisterSpotlightContextActions } from "@homarr/spotlight";

import type { WidgetComponentProps } from "../../definition";

export default function SmartHomeEntityStateWidget({
  options,
  integrationIds,
  isEditMode,
  width,
}: WidgetComponentProps<"smartHome-entityState">) {
  // It will always have at least one integration as otherwise the NoIntegrationSelectedError would be thrown in item-content.tsx
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const integrationId = integrationIds[0]!;

  const input = {
    entityId: options.entityId,
    integrationId,
  };
  const [entityState] = clientApi.widget.smartHome.entityState.useSuspenseQuery(input);

  const utils = clientApi.useUtils();

  clientApi.widget.smartHome.subscribeEntityState.useSubscription(input, {
    onData(data) {
      utils.widget.smartHome.entityState.setData(input, data.state);
    },
  });

  const { mutate } = clientApi.widget.smartHome.switchEntity.useMutation();

  const attribute = options.entityUnit.length > 0 ? " " + options.entityUnit : "";

  const handleClick = useCallback(() => {
    if (isEditMode) {
      return;
    }

    if (!options.clickable) {
      return;
    }

    mutate({
      entityId: options.entityId,
      integrationId,
    });
  }, [integrationId, isEditMode, mutate, options.clickable, options.entityId]);

  useRegisterSpotlightContextActions(
    `smartHome-entityState-${options.entityId}`,
    [
      {
        id: options.entityId,
        name: options.displayName,
        icon: IconBinaryTree,
        interaction() {
          return {
            type: "javaScript",
            onSelect() {
              handleClick();
            },
          };
        },
        disabled: !options.clickable,
      },
    ],
    [handleClick, options.clickable, options.displayName, options.entityId],
  );
  const isTiny = width < 128;

  return (
    <UnstyledButton
      onClick={handleClick}
      w="100%"
      h="100%"
      styles={{
        root: {
          cursor: options.clickable && !isEditMode ? "pointer" : "initial",
          pointerEvents: isEditMode ? "none" : undefined,
        },
      }}
    >
      <Center h="100%" w="100%">
        <Stack align="center" gap="md">
          <Text ta="center" fw="bold" size={isTiny ? "sm" : "lg"}>
            {options.displayName}
          </Text>
          <Text ta="center" size={isTiny ? "xs" : "lg"}>
            {entityState}
            {attribute}
          </Text>
        </Stack>
      </Center>
    </UnstyledButton>
  );
}
