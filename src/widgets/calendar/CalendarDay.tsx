import { Container, Indicator, IndicatorProps, Popover, useMantineTheme } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { CalendarEventList } from './CalendarEventList';
import { calendarEvents, calendarMediaEventSchema } from './type';
import { z } from 'zod';
import { ReactNode } from 'react';

interface CalendarDayProps {
  date: Date;
  medias: z.infer<typeof calendarEvents>;
  size: string;
}

export const CalendarDay = ({ date, medias, size }: CalendarDayProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  const { radius, fn } = useMantineTheme();

  const filteredEvents = medias.events.filter(event =>
    event.date.getDate() == date.getDate() &&
    event.date.getMonth() == date.getMonth() &&
    event.date.getFullYear() == date.getFullYear());

  return (
    <Popover
      position="bottom"
      withArrow
      withinPortal
      radius="lg"
      shadow="sm"
      transitionProps={{
        transition: 'pop',
      }}
      onClose={close}
      opened={opened}
    >
      <Popover.Target>
        <Container
          onClick={filteredEvents.length > 0 && !opened ? open : close}
          h="100%"
          w="100%"
          sx={{
            padding: '18% !important',
            borderRadius: ['xs', 'sm'].includes(size) ? radius.md : radius.lg,
            borderStyle: 'solid',
            borderWidth: '0.2rem',
            borderColor: opened ? fn.primaryColor() : 'transparent',
          }}
        >
          {filteredEvents.length > 0 ? (
            <DayIndicator
              size={16}
              color="red"
              position="bottom-start"
              medias={filteredEvents}
            >
              <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{date.getDate()}</div>
            </DayIndicator>
          ) : (
            <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{date.getDate()}</div>
          )}
        </Container>
      </Popover.Target>
      <Popover.Dropdown>
        <CalendarEventList events={filteredEvents as z.infer<typeof calendarMediaEventSchema>[]} />
      </Popover.Dropdown>
    </Popover>
  );
};

interface DayIndicatorProps {
  size: number;
  color: string;
  medias: any[];
  children: ReactNode;
  position: IndicatorProps['position'];
}

const DayIndicator = ({ size, color, medias, children, position }: DayIndicatorProps) => {
  if (medias.length === 0) return children;

  return (
    <Indicator size={size} withBorder color={color} position={position} zIndex={0}>
      {children}
    </Indicator>
  );
};
