import {
  Button,
  Container,
  Indicator,
  IndicatorProps,
  Popover,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import { MediaList } from './MediaList';
import { MediasType } from './type';

interface CalendarDayProps {
  date: Date;
  medias: MediasType;
  size: string;
}

export const CalendarDay = ({ date, medias, size }: CalendarDayProps) => {
  const [opened, { close, open }] = useDisclosure(false);
  const { radius, fn } = useMantineTheme();
  var indicatorSize = 10;
  var indicatorOffset = -4;
  switch (size) {
    case 'xs': {
      indicatorSize += 0;
      indicatorOffset -= 0;
      break;
    }
    case 'sm': {
      indicatorSize += 1;
      indicatorOffset -= 1;
      break;
    }
    case 'md': {
      indicatorSize += 2;
      indicatorOffset -= 1;
      break;
    }
    case 'lg': {
      indicatorSize += 3;
      indicatorOffset -= 2;
      break;
    }
    case 'xl': {
      indicatorSize += 4;
      indicatorOffset -= 3;
      break;
    }
  }

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
          onClick={medias.totalCount > 0 && !opened ? open : close}
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
          <DayIndicator
            size={indicatorSize}
            offset={indicatorOffset}
            color="red"
            position="bottom-start"
            medias={medias.books}
          >
            <DayIndicator
              size={indicatorSize}
              offset={indicatorOffset}
              color="yellow"
              position="top-start"
              medias={medias.movies}
            >
              <DayIndicator
                size={indicatorSize}
                offset={indicatorOffset}
                color="blue"
                position="top-end"
                medias={medias.tvShows}
              >
                <DayIndicator
                  size={indicatorSize}
                  offset={indicatorOffset}
                  color="green"
                  position="bottom-end"
                  medias={medias.musics}
                >
                  <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{date.getDate()}</div>
                </DayIndicator>
              </DayIndicator>
            </DayIndicator>
          </DayIndicator>
        </Container>
      </Popover.Target>
      <Popover.Dropdown>
        <MediaList medias={medias} />
      </Popover.Dropdown>
    </Popover>
  );
};

interface DayIndicatorProps {
  size: any;
  offset: any;
  color: string;
  medias: any[];
  children: JSX.Element;
  position: IndicatorProps['position'];
}

const DayIndicator = ({ size, offset, color, medias, children, position }: DayIndicatorProps) => {
  if (medias.length === 0) return children;

  return (
    <Indicator size={size} withBorder offset={offset} color={color} position={position} zIndex={0}>
      {children}
    </Indicator>
  );
};
