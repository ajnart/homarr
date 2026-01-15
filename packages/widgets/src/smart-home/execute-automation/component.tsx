"use client";

import React from "react";
import { Center, LoadingOverlay, Overlay, Stack, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { useDisclosure, useTimeout } from "@mantine/hooks";
import { IconAutomation, IconCheck } from "@tabler/icons-react";

import { clientApi } from "@homarr/api/client";
import { useRegisterSpotlightContextActions } from "@homarr/spotlight";
import { useI18n } from "@homarr/translation/client";

import type { WidgetComponentProps } from "../../definition";

export default function SmartHomeTriggerAutomationWidget({
  options,
  integrationIds,
  isEditMode,
  width,
}: WidgetComponentProps<"smartHome-executeAutomation">) {
  const [isShowSuccess, { open: showSuccess, close: closeSuccess }] = useDisclosure();
  const { start } = useTimeout(() => {
    closeSuccess();
  }, 1000);

  const { mutateAsync, isPending } = clientApi.widget.smartHome.executeAutomation.useMutation({
    onSuccess: () => {
      showSuccess();
      start();
    },
  });
  const handleClick = React.useCallback(async () => {
    if (isEditMode) {
      return;
    }
    await mutateAsync({
      automationId: options.automationId,
      integrationId: integrationIds[0] ?? "",
    });
  }, [integrationIds, isEditMode, mutateAsync, options.automationId]);

  const t = useI18n();
  useRegisterSpotlightContextActions(
    `smartHome-automation-${options.automationId}`,
    [
      {
        id: options.automationId,
        name: t("widget.smartHome-executeAutomation.spotlightAction.run", { name: options.displayName }),
        icon: IconAutomation,
        interaction() {
          return {
            type: "javaScript",
            // eslint-disable-next-line no-restricted-syntax
            async onSelect() {
              await handleClick();
            },
          };
        },
      },
    ],
    [handleClick, options.automationId, options.displayName],
  );

  const isTiny = width < 128;

  return (
    <UnstyledButton
      onClick={handleClick}
      style={{ cursor: !isEditMode ? "pointer" : "initial", pointerEvents: isEditMode ? "none" : undefined }}
      w="100%"
      h="100%"
    >
      {isShowSuccess && (
        <Overlay>
          <Center w="100%" h="100%">
            <ThemeIcon variant="filled" color="green" size="xl" radius="xl">
              <IconCheck style={{ width: "70%", height: "70%" }} stroke={1.5} />
            </ThemeIcon>
          </Center>
        </Overlay>
      )}
      <LoadingOverlay visible={isPending} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Center w="100%" h="100%">
        <Stack align="center" gap="md">
          <IconAutomation size={isTiny ? 16 : undefined} />
          <Text ta="center" fw="bold" fz={isTiny ? "xs" : undefined}>
            {options.displayName}
          </Text>
        </Stack>
      </Center>
    </UnstyledButton>
  );
}
