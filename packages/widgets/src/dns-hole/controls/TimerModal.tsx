import { useRef, useState } from "react";
import type { NumberInputHandlers } from "@mantine/core";
import { ActionIcon, Button, Flex, Group, Modal, NumberInput, rem, Stack, Text } from "@mantine/core";
import { IconClockPause } from "@tabler/icons-react";

import { useI18n } from "@homarr/translation/client";

interface TimerModalProps {
  opened: boolean;
  close: () => void;
  selectedIntegrationIds: string[];
  disableDns: (data: { duration: number; integrationId: string }) => void;
}

const TimerModal = ({ opened, close, selectedIntegrationIds, disableDns }: TimerModalProps) => {
  const t = useI18n();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const hoursHandlers = useRef<NumberInputHandlers>(null);
  const minutesHandlers = useRef<NumberInputHandlers>(null);

  const handleSetTimer = () => {
    const duration = hours * 3600 + minutes * 60;
    selectedIntegrationIds.forEach((integrationId) => {
      disableDns({ duration, integrationId });
    });
    setHours(0);
    setMinutes(0);
    close();
  };

  return (
    <Modal
      withinPortal
      radius="lg"
      shadow="sm"
      size="sm"
      opened={opened}
      onClose={() => {
        close();
        setHours(0);
        setMinutes(0);
      }}
      title={t("widget.dnsHoleControls.controls.setTimer")}
    >
      <Flex direction="column" align="center" justify="center">
        <Stack align="flex-end">
          <Group>
            <Text>{t("widget.dnsHoleControls.controls.hours")}</Text>
            <ActionIcon size={35} variant="default" onClick={() => hoursHandlers.current?.decrement()}>
              –
            </ActionIcon>
            <NumberInput
              hideControls
              value={hours}
              onChange={(val) => setHours(Number(val))}
              handlersRef={hoursHandlers}
              max={999}
              min={0}
              step={1}
              styles={{ input: { width: rem(54), textAlign: "center" } }}
            />
            <ActionIcon size={35} variant="default" onClick={() => hoursHandlers.current?.increment()}>
              +
            </ActionIcon>
          </Group>
          <Group>
            <Text>{t("widget.dnsHoleControls.controls.minutes")}</Text>
            <ActionIcon size={35} variant="default" onClick={() => minutesHandlers.current?.decrement()}>
              –
            </ActionIcon>
            <NumberInput
              hideControls
              value={minutes}
              onChange={(val) => setMinutes(Number(val))}
              handlersRef={minutesHandlers}
              max={59}
              min={0}
              step={1}
              styles={{ input: { width: rem(54), textAlign: "center" } }}
            />
            <ActionIcon size={35} variant="default" onClick={() => minutesHandlers.current?.increment()}>
              +
            </ActionIcon>
          </Group>
        </Stack>
        <Text ta="center" c="dimmed" my={5}>
          {t("widget.dnsHoleControls.controls.unlimited")}
        </Text>
        <Button
          variant="light"
          color="red"
          leftSection={<IconClockPause size={20} />}
          h="2rem"
          w="12rem"
          onClick={handleSetTimer}
        >
          {t("widget.dnsHoleControls.controls.set")}
        </Button>
      </Flex>
    </Modal>
  );
};

export default TimerModal;
