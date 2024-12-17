import {
  ActionIcon,
  Button,
  Flex,
  Group,
  Modal,
  NumberInput,
  NumberInputHandlers,
  Stack,
  Text,
  rem,
} from '@mantine/core';
import { IconClockPause } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TimerModalProps {
  toggleDns: any;
  getDnsStatus(): any;
  opened: boolean;
  close(): any;
  appId: string;
}

export function TimerModal({ toggleDns, getDnsStatus, opened, close, appId }: TimerModalProps) {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const hoursHandlers = useRef<NumberInputHandlers>();
  const minutesHandlers = useRef<NumberInputHandlers>();
  const { t } = useTranslation('modules/dns-hole-controls');

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
      title={t('durationModal.title')}
    >
      <Flex direction="column" align="center" justify="center">
        <Stack align="flex-end">
          <Group spacing={5}>
            <Text>{t('durationModal.hours')}</Text>
            <ActionIcon
              size={35}
              variant="default"
              onClick={() => hoursHandlers.current?.decrement()}
            >
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
              styles={{ input: { width: rem(54), textAlign: 'center' } }}
            />
            <ActionIcon
              size={35}
              variant="default"
              onClick={() => hoursHandlers.current?.increment()}
            >
              +
            </ActionIcon>
          </Group>
          <Group spacing={5}>
            <Text>{t('durationModal.minutes')}</Text>
            <ActionIcon
              size={35}
              variant="default"
              onClick={() => minutesHandlers.current?.decrement()}
            >
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
              styles={{ input: { width: rem(54), textAlign: 'center' } }}
            />
            <ActionIcon
              size={35}
              variant="default"
              onClick={() => minutesHandlers.current?.increment()}
            >
              +
            </ActionIcon>
          </Group>
        </Stack>
        <Text ta="center" c="dimmed" my={5}>
          {t('durationModal.unlimited')}
        </Text>
        <Button
          variant="light"
          color="red"
          leftIcon={<IconClockPause size={20} />}
          h="2rem"
          w="12rem"
          onClick={() => {
            toggleDns('disable', appId !== '' ? [appId] : getDnsStatus()?.enabled, hours, minutes);
            setHours(0);
            setMinutes(0);
            close();
          }}
        >
          {t('durationModal.set')}
        </Button>
      </Flex>
    </Modal>
  );
}
